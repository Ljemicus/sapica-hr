import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import {
  getLostPets as mockGetLostPets,
  getLostPetById as mockGetLostPet,
} from '@/lib/mock-data';
import type { LostPet, LostPetSpecies, LostPetStatus } from '@/lib/types';

interface LostPetFilters {
  city?: string;
  species?: LostPetSpecies;
  status?: LostPetStatus;
  limit?: number;
  fields?: 'full' | 'homepage-card';
}

export async function getLostPets(filters?: LostPetFilters): Promise<LostPet[]> {
  if (!isSupabaseConfigured()) {
    return mockGetLostPets(filters).slice(0, filters?.limit ?? Number.POSITIVE_INFINITY);
  }
  try {
    const supabase = await createClient();
    const selectClause = filters?.fields === 'homepage-card'
      ? 'id, name, species, breed, image_url, city, neighborhood, date_lost'
      : '*';

    let query = supabase
      .from('lost_pets')
      .select(selectClause)
      .order('date_lost', { ascending: false });

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }
    if (filters?.species) {
      query = query.eq('species', filters.species);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.limit != null) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error || !data) return mockGetLostPets(filters).slice(0, filters?.limit ?? Number.POSITIVE_INFINITY);
    return data as LostPet[];
  } catch {
    return mockGetLostPets(filters).slice(0, filters?.limit ?? Number.POSITIVE_INFINITY);
  }
}

export async function getLostPet(id: string): Promise<LostPet | null> {
  if (!isSupabaseConfigured()) {
    return mockGetLostPet(id) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pets')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return mockGetLostPet(id) ?? null;
    return data as LostPet;
  } catch {
    return mockGetLostPet(id) ?? null;
  }
}
