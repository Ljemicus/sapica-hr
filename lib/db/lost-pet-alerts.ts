import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from './helpers';
import type { LostPetAlert, LostPetAlertSpecies, LostPetSpecies } from '@/lib/types';

function mapDbToAlert(row: Record<string, unknown>): LostPetAlert {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    city: row.city as string,
    species: row.species as LostPetAlertSpecies,
    active: (row.active as boolean) ?? true,
    created_at: row.created_at as string,
  };
}

// ── User-facing CRUD ──

export async function getUserAlerts(userId: string): Promise<LostPetAlert[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pet_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((row) => mapDbToAlert(row as unknown as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function upsertAlert(
  userId: string,
  city: string,
  species: LostPetAlertSpecies,
): Promise<LostPetAlert | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pet_alerts')
      .upsert(
        { user_id: userId, city, species, active: true },
        { onConflict: 'user_id,city,species' },
      )
      .select('*')
      .single();

    if (error || !data) return null;
    return mapDbToAlert(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function deleteAlert(userId: string, alertId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('lost_pet_alerts')
      .delete()
      .eq('id', alertId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

// ── Cron dispatch helpers (use admin/service-role client) ──

interface AlertSubscriber {
  email: string;
  name: string;
  user_id: string;
}

/**
 * Find all active subscribers whose alert preferences match a given listing.
 * Matches on city (exact) and species ('sve' matches any).
 * Excludes the listing owner so they don't alert themselves.
 */
export async function getSubscribersForListing(
  city: string,
  species: LostPetSpecies,
  ownerUserId: string | null,
): Promise<AlertSubscriber[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createAdminClient();

    // Find alert rows matching city + (species or 'sve'), active only
    let query = supabase
      .from('lost_pet_alerts')
      .select('user_id')
      .eq('city', city)
      .eq('active', true)
      .in('species', [species, 'sve']);

    if (ownerUserId) {
      query = query.neq('user_id', ownerUserId);
    }

    const { data: alertRows, error: alertErr } = await query;
    if (alertErr || !alertRows || alertRows.length === 0) return [];

    // Deduplicate user IDs (user might have both specific + 'sve' for same city)
    const userIds = [...new Set(alertRows.map((r) => r.user_id as string))];

    // Fetch user email + name, respecting notification preferences
    const { data: users, error: userErr } = await supabase
      .from('users')
      .select('id, email, name')
      .in('id', userIds);

    if (userErr || !users) return [];

    // Check notification preferences (email_enabled + lost_pets_enabled)
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('user_id, email_enabled, lost_pets_enabled')
      .in('user_id', userIds);

    const prefMap = new Map(
      (prefs || []).map((p) => [p.user_id as string, p]),
    );

    return users
      .filter((u) => {
        const pref = prefMap.get(u.id as string);
        // Default to enabled if no preference row exists
        if (!pref) return true;
        return pref.email_enabled !== false && pref.lost_pets_enabled !== false;
      })
      .map((u) => ({
        email: u.email as string,
        name: u.name as string,
        user_id: u.id as string,
      }));
  } catch {
    return [];
  }
}

export interface AlertDispatchResult {
  listingsProcessed: number;
  emailsSent: number;
  errors: string[];
}

/**
 * Get listings that need alert dispatch (not yet dispatched).
 * Does NOT mark them — call {@link markListingDispatched} after emails succeed.
 */
export async function getUndispatchedListings(): Promise<
  Array<{ id: string; name: string; species: LostPetSpecies; city: string; neighborhood: string; image_url: string; user_id: string | null }>
> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('lost_pets')
      .select('id, name, species, city, neighborhood, image_url, user_id')
      .eq('status', 'lost')
      .eq('hidden', false)
      .is('alerts_dispatched_at', null);

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      species: row.species as LostPetSpecies,
      city: row.city as string,
      neighborhood: (row.neighborhood as string) || '',
      image_url: (row.image_url as string) || '',
      user_id: (row.user_id as string) || null,
    }));
  } catch {
    return [];
  }
}

/**
 * Mark a single listing as dispatched. Call only after all subscriber
 * emails for this listing have been sent (or attempted).
 */
export async function markListingDispatched(listingId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('lost_pets')
      .update({ alerts_dispatched_at: new Date().toISOString() })
      .eq('id', listingId);

    return !error;
  } catch {
    return false;
  }
}
