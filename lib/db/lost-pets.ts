import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { LostPet, LostPetFoundMethod, LostPetSpecies, LostPetStatus } from '@/lib/types';
import { LOST_PET_LISTING_DURATION_DAYS, LOST_PET_EXPIRY_WARN_DAYS } from '@/lib/types';

interface LostPetFilters {
  city?: string;
  species?: LostPetSpecies;
  status?: LostPetStatus;
  limit?: number;
  fields?: 'full' | 'homepage-card';
  includeHidden?: boolean;
  excludeExpired?: boolean;
}

function mapDbToLostPet(row: Record<string, unknown>): LostPet {
  return {
    id: row.id as string,
    user_id: (row.user_id as string) || null,
    name: row.name as string,
    species: row.species as LostPet['species'],
    breed: (row.breed as string) || '',
    color: row.color as string,
    sex: (row.sex as 'muško' | 'žensko') || 'muško',
    image_url: (row.image_url as string) || '/images/placeholder-pet.jpg',
    gallery: (row.gallery as string[]) || [],
    city: row.city as string,
    neighborhood: (row.neighborhood as string) || '',
    location_lat: Number(row.location_lat) || 45.815,
    location_lng: Number(row.location_lng) || 15.982,
    date_lost: row.date_lost as string,
    status: row.status as LostPet['status'],
    hidden: (row.hidden as boolean) || false,
    description: (row.description as string) || '',
    special_marks: (row.special_marks as string) || '',
    has_microchip: (row.has_microchip as boolean) || false,
    has_collar: (row.has_collar as boolean) || false,
    contact_name: (row.contact_name as string) || '',
    contact_phone: (row.contact_phone as string) || '',
    contact_email: (row.contact_email as string) || '',
    share_count: (row.share_count as number) || 0,
    found_at: (row.found_at as string) || null,
    found_method: (row.found_method as LostPetFoundMethod) || null,
    reunion_message: (row.reunion_message as string) || null,
    expires_at: (row.expires_at as string) || null,
    reminder_sent_at: (row.reminder_sent_at as string) || null,
    alerts_dispatched_at: (row.alerts_dispatched_at as string) || null,
    updates: (row.updates as LostPet['updates']) || [],
    sightings: (row.sightings as LostPet['sightings']) || [],
    created_at: row.created_at as string,
  };
}

export async function getLostPets(filters?: LostPetFilters): Promise<LostPet[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from('lost_pets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!filters?.includeHidden) query = query.eq('hidden', false);
    if (filters?.city) query = query.eq('city', filters.city);
    if (filters?.species) query = query.eq('species', filters.species);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.excludeExpired) query = query.neq('status', 'expired');
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row) => mapDbToLostPet(row as unknown as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getLostPet(id: string): Promise<LostPet | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapDbToLostPet(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function updateLostPetStatus(id: string, status: LostPetStatus): Promise<LostPet | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pets')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return mapDbToLostPet(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function markLostPetFound(
  id: string,
  details: { found_method: LostPetFoundMethod; reunion_message?: string },
): Promise<LostPet | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('lost_pets')
      .update({
        status: 'found' as LostPetStatus,
        found_at: new Date().toISOString(),
        found_method: details.found_method,
        reunion_message: details.reunion_message || null,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return mapDbToLostPet(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function updateLostPetHidden(id: string, hidden: boolean): Promise<LostPet | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pets')
      .update({ hidden })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return mapDbToLostPet(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function renewLostPet(id: string): Promise<LostPet | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const newExpiry = new Date(Date.now() + LOST_PET_LISTING_DURATION_DAYS * 86_400_000).toISOString();

    const { data, error } = await supabase
      .from('lost_pets')
      .update({ expires_at: newExpiry, status: 'lost' as LostPetStatus })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return mapDbToLostPet(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function deleteLostPet(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('lost_pets')
      .delete()
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

// ── Expiry lifecycle helpers (cron-friendly) ──

export interface ExpiryProcessResult {
  expired: number;
  reminded: number;
  errors: string[];
}

/**
 * Process listing expiry in a single pass:
 * 1. Expire listings past their expires_at date.
 * 2. Send reminder marker for listings expiring within LOST_PET_EXPIRY_WARN_DAYS
 *    that haven't been reminded yet.
 *
 * Returns counts for observability / logging.
 */
export async function processLostPetExpiry(): Promise<ExpiryProcessResult> {
  const result: ExpiryProcessResult = { expired: 0, reminded: 0, errors: [] };
  if (!isSupabaseConfigured()) return result;

  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // 1. Expire overdue listings
    const { data: expiredRows, error: expireErr } = await supabase
      .from('lost_pets')
      .update({ status: 'expired' as LostPetStatus })
      .eq('status', 'lost')
      .not('expires_at', 'is', null)
      .lte('expires_at', now)
      .select('id');

    if (expireErr) {
      result.errors.push(`expire: ${expireErr.message}`);
    } else {
      result.expired = expiredRows?.length ?? 0;
    }

    // 2. Mark reminder_sent_at for listings expiring within warn window
    const warnCutoff = new Date(Date.now() + LOST_PET_EXPIRY_WARN_DAYS * 86_400_000).toISOString();

    const { data: remindedRows, error: remindErr } = await supabase
      .from('lost_pets')
      .update({ reminder_sent_at: now })
      .eq('status', 'lost')
      .is('reminder_sent_at', null)
      .not('expires_at', 'is', null)
      .lte('expires_at', warnCutoff)
      .gt('expires_at', now)
      .select('id');

    if (remindErr) {
      result.errors.push(`remind: ${remindErr.message}`);
    } else {
      result.reminded = remindedRows?.length ?? 0;
    }

    return result;
  } catch (err) {
    result.errors.push(`unexpected: ${err instanceof Error ? err.message : String(err)}`);
    return result;
  }
}

/** Get listings whose reminder was just set (for notification dispatch). */
export async function getNewlyRemindedListings(): Promise<LostPet[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();

    const { data, error } = await supabase
      .from('lost_pets')
      .select('*')
      .eq('status', 'lost')
      .gte('reminder_sent_at', fiveMinAgo)
      .order('expires_at', { ascending: true });

    if (error || !data) return [];
    return data.map((row) => mapDbToLostPet(row as unknown as Record<string, unknown>));
  } catch {
    return [];
  }
}

/** Extend a listing's expiry by the given number of days (admin use). */
export async function extendLostPetExpiry(id: string, days: number): Promise<LostPet | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const pet = await getLostPet(id);
    if (!pet) return null;

    const baseDate = pet.expires_at ? new Date(pet.expires_at) : new Date();
    const newExpiry = new Date(baseDate.getTime() + days * 86_400_000).toISOString();

    const { data, error } = await supabase
      .from('lost_pets')
      .update({ expires_at: newExpiry, reminder_sent_at: null })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return mapDbToLostPet(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}
