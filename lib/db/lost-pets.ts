import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { LostPet, LostPetFoundMethod, LostPetSpecies, LostPetStatus } from '@/lib/types';

interface LostPetFilters {
  city?: string;
  species?: LostPetSpecies;
  status?: LostPetStatus;
  limit?: number;
  fields?: 'full' | 'homepage-card';
  includeHidden?: boolean;
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
