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
    use_radius: (row.use_radius as boolean) ?? false,
    radius_km: (row.radius_km as number | null) ?? null,
    location_lat: (row.location_lat as number | null) ?? null,
    location_lng: (row.location_lng as number | null) ?? null,
    address: (row.address as string | null) ?? null,
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

export interface UpsertAlertInput {
  city: string;
  species: LostPetAlertSpecies;
  radius_km?: number | null;
  location_lat?: number | null;
  location_lng?: number | null;
  address?: string | null;
}

export async function upsertAlert(
  userId: string,
  input: UpsertAlertInput,
): Promise<LostPetAlert | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pet_alerts')
      .upsert(
        {
          user_id: userId,
          city: input.city,
          species: input.species,
          active: true,
          radius_km: input.radius_km ?? null,
          location_lat: input.location_lat ?? null,
          location_lng: input.location_lng ?? null,
          address: input.address ?? null,
        },
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
  distance_km?: number;
}

/**
 * Find all active subscribers whose alert preferences match a given listing.
 * Matches on:
 * - City (exact) + species for non-radius alerts (radius_km IS NULL)
 * - Haversine distance within subscriber's radius + species for geo alerts
 * Excludes the listing owner so they don't alert themselves.
 */
export async function getSubscribersForListing(
  city: string,
  species: LostPetSpecies,
  ownerUserId: string | null,
  listingLat?: number | null,
  listingLng?: number | null,
): Promise<AlertSubscriber[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createAdminClient();
    const subscribers: AlertSubscriber[] = [];
    const seenUserIds = new Set<string>();

    // ── 1. Get city-based subscribers (non-radius alerts: radius_km IS NULL) ──
    let cityQuery = supabase
      .from('lost_pet_alerts')
      .select('user_id')
      .eq('city', city)
      .eq('active', true)
      .is('radius_km', null)
      .in('species', [species, 'sve']);

    if (ownerUserId) {
      cityQuery = cityQuery.neq('user_id', ownerUserId);
    }

    const { data: cityAlertRows, error: cityAlertErr } = await cityQuery;
    if (!cityAlertErr && cityAlertRows && cityAlertRows.length > 0) {
      const cityUserIds: string[] = [];
      for (const row of cityAlertRows) {
        const uid = row.user_id as string;
        if (!seenUserIds.has(uid)) {
          seenUserIds.add(uid);
          cityUserIds.push(uid);
        }
      }

      if (cityUserIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, email, name')
          .in('id', cityUserIds);

        if (users && users.length > 0) {
          const { data: prefs } = await supabase
            .from('notification_preferences')
            .select('user_id, email_enabled, lost_pets_enabled')
            .in('user_id', cityUserIds);

          const prefMap = new Map<string, { email_enabled?: boolean; lost_pets_enabled?: boolean }>();
          for (const p of (prefs || [])) {
            prefMap.set(p.user_id as string, p as { email_enabled?: boolean; lost_pets_enabled?: boolean });
          }

          for (const u of users) {
            const pref = prefMap.get(u.id as string);
            if (!pref || (pref.email_enabled !== false && pref.lost_pets_enabled !== false)) {
              subscribers.push({
                email: u.email as string,
                name: u.name as string,
                user_id: u.id as string,
              });
            }
          }
        }
      }
    }

    // ── 2. Get radius-based subscribers (if listing has coordinates) ──
    if (listingLat != null && listingLng != null) {
      const { data: radiusSubscribers, error: radiusErr } = await supabase.rpc(
        'get_subscribers_within_radius',
        {
          p_lat: listingLat,
          p_lng: listingLng,
          p_species: species,
          p_exclude_user_id: ownerUserId,
        }
      );

      if (!radiusErr && radiusSubscribers && radiusSubscribers.length > 0) {
        const radiusUserIds: string[] = [];
        for (const r of radiusSubscribers) {
          const uid = r.user_id as string;
          if (!seenUserIds.has(uid)) {
            seenUserIds.add(uid);
            radiusUserIds.push(uid);
          }
        }

        if (radiusUserIds.length > 0) {
          const { data: prefs } = await supabase
            .from('notification_preferences')
            .select('user_id, email_enabled, lost_pets_enabled')
            .in('user_id', radiusUserIds);

          const prefMap = new Map<string, { email_enabled?: boolean; lost_pets_enabled?: boolean }>();
          for (const p of (prefs || [])) {
            prefMap.set(p.user_id as string, p as { email_enabled?: boolean; lost_pets_enabled?: boolean });
          }

          for (const r of radiusSubscribers) {
            const uid = r.user_id as string;
            if (!seenUserIds.has(uid)) continue; // Skip if already processed
            
            const pref = prefMap.get(uid);
            if (!pref || (pref.email_enabled !== false && pref.lost_pets_enabled !== false)) {
              subscribers.push({
                email: r.email as string,
                name: r.name as string,
                user_id: uid,
                distance_km: Math.round((r.distance_km as number) * 10) / 10,
              });
            }
          }
        }
      }
    }

    return subscribers;
  } catch {
    return [];
  }
}

export interface AlertDispatchResult {
  listingsProcessed: number;
  emailsSent: number;
  errors: string[];
}

interface UndispatchedListing {
  id: string;
  name: string;
  species: LostPetSpecies;
  city: string;
  neighborhood: string;
  image_url: string;
  user_id: string | null;
  location_lat: number | null;
  location_lng: number | null;
}

/**
 * Get listings that need alert dispatch (not yet dispatched).
 * Does NOT mark them — call {@link markListingDispatched} only after delivery succeeds.
 */
export async function getUndispatchedListings(): Promise<UndispatchedListing[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('lost_pets')
      .select('id, name, species, city, neighborhood, image_url, user_id, location_lat, location_lng')
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
      location_lat: (row.location_lat as number) ?? null,
      location_lng: (row.location_lng as number) ?? null,
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
    const { data, error } = await supabase
      .from('lost_pets')
      .update({ alerts_dispatched_at: new Date().toISOString() })
      .eq('id', listingId)
      .is('alerts_dispatched_at', null)
      .select('id')
      .maybeSingle();

    return !error && Boolean(data);
  } catch {
    return false;
  }
}
