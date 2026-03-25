import { createClient } from '@/lib/supabase/server';
import type { LostPet, LostPetSpecies, LostPetStatus } from '@/lib/types';

interface LostPetFilters {
  city?: string;
  species?: LostPetSpecies;
  status?: LostPetStatus;
}

export async function getLostPets(filters?: LostPetFilters): Promise<LostPet[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('lost_pets')
      .select('*')
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

    const { data, error } = await query;
    if (error || !data) return [];
    return data as LostPet[];
  } catch {
    return [];
  }
}

export async function getLostPet(id: string): Promise<LostPet | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pets')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as LostPet;
  } catch {
    return null;
  }
}
