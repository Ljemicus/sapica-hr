import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { AdoptionListing, AdoptionListingCard, AdoptionListingStatus } from '@/lib/types';

export interface AdoptionListingFilters {
  status?: AdoptionListingStatus;
  city?: string;
  species?: AdoptionListing['species'];
  urgentOnly?: boolean;
}

interface AdoptionListingCardRow
  extends Pick<
    AdoptionListing,
    'id' | 'status' | 'name' | 'species' | 'breed' | 'age_months' | 'gender' | 'size' | 'city' | 'images' | 'is_urgent' | 'published_at'
  > {
  publisher?: { display_name: string | null } | null;
}

function toCard(row: AdoptionListingCardRow): AdoptionListingCard {
  return {
    id: row.id,
    status: row.status,
    name: row.name,
    species: row.species,
    breed: row.breed,
    age_months: row.age_months,
    gender: row.gender,
    size: row.size,
    city: row.city,
    images: row.images,
    is_urgent: row.is_urgent,
    published_at: row.published_at,
    publisher_display_name: row.publisher?.display_name ?? null,
  };
}

export function canTransition(current: AdoptionListingStatus, next: AdoptionListingStatus): boolean {
  const allowed: Record<AdoptionListingStatus, AdoptionListingStatus[]> = {
    draft: ['active', 'paused', 'expired'],
    active: ['paused', 'adopted', 'expired'],
    paused: ['active', 'expired'],
    adopted: [],
    expired: ['draft', 'active'],
  };
  return allowed[current].includes(next);
}

export async function getAdoptionListing(id: string): Promise<AdoptionListing | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('adoption_listings')
      .select('*, publisher:publisher_profiles(*)')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as AdoptionListing;
  } catch {
    return null;
  }
}

export async function getAdoptionListings(filters?: AdoptionListingFilters): Promise<AdoptionListingCard[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from('adoption_listings')
      .select('id, status, name, species, breed, age_months, gender, size, city, images, is_urgent, published_at, publisher:publisher_profiles(display_name)')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.city) query = query.eq('city', filters.city);
    if (filters?.species) query = query.eq('species', filters.species);
    if (filters?.urgentOnly) query = query.eq('is_urgent', true);

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as unknown as AdoptionListingCardRow[]).map(toCard);
  } catch {
    return [];
  }
}

export async function getActiveAdoptionListings(filters?: Omit<AdoptionListingFilters, 'status'>): Promise<AdoptionListingCard[]> {
  return getAdoptionListings({ ...filters, status: 'active' });
}

export async function getAdoptionListingsByPublisher(publisherId: string): Promise<AdoptionListing[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('adoption_listings')
      .select('*')
      .eq('publisher_id', publisherId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as AdoptionListing[];
  } catch {
    return [];
  }
}

export async function getPublisherListings(publisherId: string): Promise<AdoptionListing[]> {
  return getAdoptionListingsByPublisher(publisherId);
}

export async function createAdoptionListing(
  input: Omit<AdoptionListing, 'id' | 'created_at' | 'updated_at' | 'publisher'>
): Promise<AdoptionListing | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('adoption_listings')
      .insert(input)
      .select('*')
      .single();
    if (error || !data) return null;
    return data as AdoptionListing;
  } catch {
    return null;
  }
}

export async function updateAdoptionListing(
  id: string,
  updates: Partial<Omit<AdoptionListing, 'id' | 'publisher_id' | 'created_at' | 'updated_at' | 'publisher'>>
): Promise<AdoptionListing | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('adoption_listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) return null;
    return data as AdoptionListing;
  } catch {
    return null;
  }
}

export async function updateAdoptionListingStatus(
  id: string,
  _publisherId: string,
  status: AdoptionListingStatus
): Promise<AdoptionListing | null> {
  const current = await getAdoptionListing(id);
  if (!current || !canTransition(current.status, status)) return null;

  return updateAdoptionListing(id, {
    status,
    published_at: status === 'active' && !current.published_at ? new Date().toISOString() : current.published_at,
  });
}

export async function deleteAdoptionListing(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('adoption_listings')
      .delete()
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
