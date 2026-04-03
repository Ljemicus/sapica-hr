import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { appLogger } from '@/lib/logger';
import type { ProviderApplication } from '@/lib/types';

type LinkableProviderType = 'groomer' | 'trener';

interface AutoLinkResult {
  linked: boolean;
  providerType: LinkableProviderType;
  listingId?: string;
  listingName?: string;
  matchedBy?: 'email' | 'phone' | 'name_city';
}

interface DirectoryRow {
  id: string;
  name: string;
  city: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  bio: string | null;
  user_id: string | null;
}

// ── Normalization helpers ──────────────────────────────

function normalizeText(value?: string | null) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeEmail(value?: string | null) {
  return (value || '').trim().toLowerCase();
}

function canonicalPhone(value?: string | null) {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('385')) {
    return digits.slice(3);
  }

  if (digits.startsWith('0')) {
    return digits.slice(1);
  }

  return digits;
}

function phonesMatch(a?: string | null, b?: string | null) {
  const left = canonicalPhone(a);
  const right = canonicalPhone(b);

  if (!left || !right) return false;
  return left === right || left.endsWith(right) || right.endsWith(left);
}

// ── Supabase service-role client ───────────────────────

function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}

// ── Scoring logic (shared for groomers & trainers) ─────

function pickBestMatch(
  rows: DirectoryRow[],
  application: ProviderApplication,
  authEmail?: string | null,
) {
  const appName = normalizeText(application.display_name);
  const appCity = normalizeText(application.city);
  const appPhone = application.phone || null;
  const userEmail = normalizeEmail(authEmail);

  const scored = rows
    .map((row) => {
      const rowName = normalizeText(row.name);
      const rowCity = normalizeText(row.city);
      const rowEmail = normalizeEmail(row.email);

      const emailMatch = Boolean(userEmail && rowEmail && userEmail === rowEmail);
      const phoneMatch = phonesMatch(appPhone, row.phone);
      const nameMatch = Boolean(appName && rowName && appName === rowName);
      const cityMatch = Boolean(appCity && rowCity && appCity === rowCity);

      let score = 0;
      let matchedBy: AutoLinkResult['matchedBy'] | undefined;

      if (emailMatch) {
        score = 100;
        matchedBy = 'email';
      } else if (phoneMatch) {
        score = 90;
        matchedBy = 'phone';
      } else if (nameMatch && cityMatch) {
        score = 60;
        matchedBy = 'name_city';
      }

      return { row, score, matchedBy };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return null;

  const best = scored[0];
  const equallyStrong = scored.filter((candidate) => candidate.score === best.score);

  // Ambiguous name+city — refuse to guess
  if (best.matchedBy === 'name_city' && equallyStrong.length > 1) {
    return null;
  }

  return best;
}

// ── Table-specific config ──────────────────────────────

const DIRECTORY_CONFIG: Record<
  LinkableProviderType,
  { table: string; verifiedField: string; label: string }
> = {
  groomer: { table: 'groomers', verifiedField: 'verified', label: 'groomer' },
  trener: { table: 'trainers', verifiedField: 'certified', label: 'trainer' },
};

// ── Main auto-link function ────────────────────────────

export async function autoLinkProviderDirectoryListing(
  userId: string,
  application: ProviderApplication,
  authEmail?: string | null,
): Promise<AutoLinkResult> {
  const providerType = application.provider_type as LinkableProviderType;
  const config = DIRECTORY_CONFIG[providerType];

  if (!config) {
    return { linked: false, providerType: providerType || 'groomer' };
  }

  const supabase = getServiceRoleClient();
  if (!supabase) {
    appLogger.warn('providerDirectory.autoLink', 'Skipped because service role is not configured');
    return { linked: false, providerType };
  }

  try {
    const baseQuery = () =>
      supabase
        .from(config.table)
        .select('id, name, city, email, phone, address, bio, user_id')
        .is('user_id', null);

    const normalizedCity = normalizeText(application.city);

    // Try city-scoped first, fall back to all unlinked rows for email/phone matches
    const initial = normalizedCity
      ? await baseQuery().eq('city', application.city)
      : await baseQuery();

    if (initial.error) {
      appLogger.error('providerDirectory.autoLink', `Failed to load ${config.label} directory rows`, { reason: initial.error.message });
      return { linked: false, providerType };
    }

    let rows = initial.data;

    if (!rows?.length && normalizedCity) {
      const fallback = await baseQuery();
      if (fallback.error) {
        appLogger.error('providerDirectory.autoLink', `Fallback query failed for ${config.label}`, { reason: fallback.error.message });
        return { linked: false, providerType };
      }
      rows = fallback.data;
    }

    if (!rows?.length) {
      return { linked: false, providerType };
    }

    const match = pickBestMatch(rows as DirectoryRow[], application, authEmail);
    if (!match) {
      return { linked: false, providerType };
    }

    const patch: Record<string, unknown> = {
      user_id: userId,
      [config.verifiedField]: true,
      email: match.row.email || normalizeEmail(authEmail) || null,
      phone: match.row.phone || application.phone || null,
      address: match.row.address || application.address || null,
      bio: match.row.bio || application.bio || null,
      city: match.row.city || application.city || null,
    };

    const { error: updateError } = await supabase
      .from(config.table)
      .update(patch)
      .eq('id', match.row.id)
      .is('user_id', null);

    if (updateError) {
      appLogger.error('providerDirectory.autoLink', `Failed to link ${config.label} directory row`, {
        listingId: match.row.id,
        reason: updateError.message,
      });
      return { linked: false, providerType };
    }

    appLogger.info('providerDirectory.autoLink', `Linked ${config.label} directory row to user`, {
      userId,
      listingId: match.row.id,
      matchedBy: match.matchedBy,
    });

    return {
      linked: true,
      providerType,
      listingId: match.row.id,
      listingName: match.row.name,
      matchedBy: match.matchedBy,
    };
  } catch (error) {
    appLogger.error('providerDirectory.autoLink', 'Unexpected auto-link failure', {
      userId,
      providerType,
      error: error instanceof Error ? error.message : String(error),
    });
    return { linked: false, providerType };
  }
}
