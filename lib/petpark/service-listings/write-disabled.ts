import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { disabledServiceListingMessage, serviceListingWritesGuard } from './guards';
import type { ServiceListingDraftInput, ServiceListingMutationResult, ServiceListingUpdateInput } from './types';

type DraftCreated = {
  id: string;
  slug: string;
  status: 'draft';
  moderationStatus: 'pending';
};

type ProviderWriteRow = {
  id: string;
  city: string | null;
};

type ProviderServiceWriteRow = {
  id: string;
  provider_id: string;
  service_code: string | null;
  is_active: boolean | null;
};

type InsertDraftRow = {
  provider_id: string;
  provider_service_id: string | null;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  display_category: string | null;
  city: string | null;
  district: string | null;
  service_area: string | null;
  photos: unknown[];
  included_features: string[];
  house_rules: string[];
  availability_mode: 'request' | 'calendar' | 'instant';
  status: 'draft';
  moderation_status: 'pending';
  seo_title: string | null;
  seo_description: string | null;
  listed_at: null;
};

type InsertedDraftRow = {
  id: string;
  slug: string;
  status: string | null;
  moderation_status: string | null;
};

type CreateDraftDependencies = {
  env?: { PETPARK_ENABLE_SERVICE_LISTINGS_WRITES?: string };
  getCurrentUserId?: () => Promise<string | null>;
  findOwnedProvider?: (userId: string, providerId?: string) => Promise<ProviderWriteRow | null>;
  findOwnedProviderService?: (providerId: string, providerServiceId?: string, category?: string) => Promise<ProviderServiceWriteRow | null>;
  createUniqueSlug?: (base: string) => Promise<string>;
  insertDraft?: (row: InsertDraftRow) => Promise<InsertedDraftRow>;
};

const categoryMap: Record<string, { category: string; displayCategory: string; serviceCodes: string[] }> = {
  cuvanje: { category: 'boarding', displayCategory: 'Čuvanje', serviceCodes: ['boarding', 'daycare', 'drop_in'] },
  boarding: { category: 'boarding', displayCategory: 'Čuvanje', serviceCodes: ['boarding'] },
  daycare: { category: 'daycare', displayCategory: 'Dnevno čuvanje', serviceCodes: ['daycare'] },
  setnja: { category: 'walking', displayCategory: 'Šetnja', serviceCodes: ['walking'] },
  walking: { category: 'walking', displayCategory: 'Šetnja', serviceCodes: ['walking'] },
  grooming: { category: 'grooming', displayCategory: 'Grooming', serviceCodes: ['grooming_basic', 'grooming'] },
  trening: { category: 'training', displayCategory: 'Trening', serviceCodes: ['training_basic', 'training'] },
  training: { category: 'training', displayCategory: 'Trening', serviceCodes: ['training_basic', 'training'] },
};

const draftSchema = z.object({
  providerId: z.string().uuid().optional(),
  providerServiceId: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(120),
  category: z.string().trim().max(60).optional(),
  shortDescription: z.string().trim().max(240).optional(),
  description: z.string().trim().max(2400).optional(),
  city: z.string().trim().max(120).optional(),
  district: z.string().trim().max(120).optional(),
  serviceArea: z.string().trim().max(180).optional(),
  availabilityMode: z.enum(['request', 'calendar', 'instant']).optional(),
  includedFeatures: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
  houseRules: z.array(z.string().trim().min(1).max(120)).max(12).optional(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(170).optional(),
});

function disabledResult(): ServiceListingMutationResult {
  return {
    ok: false,
    reason: 'service_listings_writes_disabled',
    message: disabledServiceListingMessage('service_listings_writes_disabled'),
  };
}

function failure(reason: 'service_listings_auth_required' | 'service_listings_provider_required' | 'service_listings_provider_service_required' | 'service_listings_validation_failed' | 'service_listings_write_failed', message: string): ServiceListingMutationResult {
  return { ok: false, reason, message };
}

function slugify(value: string) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);

  return slug || 'service-listing';
}

function normalizeCategory(input?: string | null) {
  const key = String(input || '').trim().toLowerCase();
  return categoryMap[key] || categoryMap.cuvanje;
}

async function defaultCurrentUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id || null;
}

async function defaultFindOwnedProvider(userId: string, providerId?: string): Promise<ProviderWriteRow | null> {
  const supabase = createAdminClient();
  let query = supabase
    .from('providers')
    .select('id, city')
    .eq('profile_id', userId)
    .limit(1);

  if (providerId) query = query.eq('id', providerId);

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data as ProviderWriteRow;
}

async function defaultFindOwnedProviderService(providerId: string, providerServiceId?: string, category?: string): Promise<ProviderServiceWriteRow | null> {
  const supabase = createAdminClient();
  const normalized = normalizeCategory(category);
  let query = supabase
    .from('provider_services')
    .select('id, provider_id, service_code, is_active')
    .eq('provider_id', providerId)
    .eq('is_active', true)
    .limit(1);

  if (providerServiceId) {
    query = query.eq('id', providerServiceId);
  } else if (normalized.serviceCodes.length > 0) {
    query = query.in('service_code', normalized.serviceCodes);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data as ProviderServiceWriteRow;
}

async function defaultCreateUniqueSlug(base: string): Promise<string> {
  const supabase = createAdminClient();
  for (let index = 0; index < 10; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const { data, error } = await supabase
      .from('service_listings')
      .select('slug')
      .eq('slug', candidate)
      .maybeSingle();

    if (error) throw error;
    if (!data) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}

async function defaultInsertDraft(row: InsertDraftRow): Promise<InsertedDraftRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('service_listings')
    .insert(row)
    .select('id, slug, status, moderation_status')
    .single();

  if (error) throw error;
  return data as InsertedDraftRow;
}

export async function createDraftServiceListing(input: ServiceListingDraftInput, dependencies: CreateDraftDependencies = {}): Promise<ServiceListingMutationResult<DraftCreated>> {
  const guard = serviceListingWritesGuard(dependencies.env);
  if (!guard.enabled) return disabledResult();

  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) {
    return failure('service_listings_validation_failed', 'Provjeri obavezna polja prije spremanja nacrta.');
  }

  const getCurrentUserId = dependencies.getCurrentUserId || defaultCurrentUserId;
  const findOwnedProvider = dependencies.findOwnedProvider || defaultFindOwnedProvider;
  const findOwnedProviderService = dependencies.findOwnedProviderService || defaultFindOwnedProviderService;
  const createUniqueSlug = dependencies.createUniqueSlug || defaultCreateUniqueSlug;
  const insertDraft = dependencies.insertDraft || defaultInsertDraft;

  const userId = await getCurrentUserId();
  if (!userId) return failure('service_listings_auth_required', 'Prijavi se prije spremanja nacrta usluge.');

  const provider = await findOwnedProvider(userId, parsed.data.providerId);
  if (!provider) return failure('service_listings_provider_required', 'Prvo dovrši profil pružatelja usluge.');

  const normalized = normalizeCategory(parsed.data.category);
  const providerService = await findOwnedProviderService(provider.id, parsed.data.providerServiceId, normalized.category);
  if (!providerService) return failure('service_listings_provider_service_required', 'Za nacrt je potrebna postojeća aktivna usluga pružatelja.');

  if (providerService.provider_id !== provider.id || providerService.is_active !== true) {
    return failure('service_listings_provider_service_required', 'Odabrana usluga ne pripada ovom pružatelju.');
  }

  const city = parsed.data.city || provider.city || null;
  const slugBase = slugify([parsed.data.title, city, provider.id.slice(0, 8)].filter(Boolean).join(' '));
  const slug = await createUniqueSlug(slugBase);

  try {
    const inserted = await insertDraft({
      provider_id: provider.id,
      provider_service_id: providerService.id,
      slug,
      title: parsed.data.title,
      short_description: parsed.data.shortDescription || null,
      description: parsed.data.description || null,
      category: normalized.category,
      display_category: normalized.displayCategory,
      city,
      district: parsed.data.district || null,
      service_area: parsed.data.serviceArea || city,
      photos: [],
      included_features: parsed.data.includedFeatures || [],
      house_rules: parsed.data.houseRules || [],
      availability_mode: parsed.data.availabilityMode || 'request',
      status: 'draft',
      moderation_status: 'pending',
      seo_title: parsed.data.seoTitle || null,
      seo_description: parsed.data.seoDescription || null,
      listed_at: null,
    });

    return {
      ok: true,
      data: {
        id: inserted.id,
        slug: inserted.slug,
        status: 'draft',
        moderationStatus: 'pending',
      },
    };
  } catch {
    return failure('service_listings_write_failed', 'Nacrt trenutno nije moguće spremiti. Pokušaj ponovno kasnije.');
  }
}

export async function updateDraftServiceListing(_input: ServiceListingUpdateInput): Promise<ServiceListingMutationResult> {
  const guard = serviceListingWritesGuard();
  if (!guard.enabled) return disabledResult();
  return failure('service_listings_write_failed', 'Uređivanje nacrta bit će dodano nakon prvog sigurnog spremanja.');
}

export async function publishServiceListing(_id: string): Promise<ServiceListingMutationResult> {
  const guard = serviceListingWritesGuard();
  if (!guard.enabled) return disabledResult();
  return failure('service_listings_write_failed', 'Objava javne usluge zahtijeva admin odobrenje.');
}

export async function pauseServiceListing(_id: string): Promise<ServiceListingMutationResult> {
  const guard = serviceListingWritesGuard();
  if (!guard.enabled) return disabledResult();
  return failure('service_listings_write_failed', 'Pauziranje će biti dodano u sljedećem koraku.');
}

export async function archiveServiceListing(_id: string): Promise<ServiceListingMutationResult> {
  const guard = serviceListingWritesGuard();
  if (!guard.enabled) return disabledResult();
  return failure('service_listings_write_failed', 'Arhiviranje će biti dodano u sljedećem koraku.');
}
