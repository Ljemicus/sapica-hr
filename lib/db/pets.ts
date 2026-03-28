import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { mockPets, getPetsForOwner as mockGetPetsForOwner } from '@/lib/mock-data';
import type { Pet } from '@/lib/types';

export async function getPets(): Promise<Pet[]> {
  if (!isSupabaseConfigured()) {
    return mockPets;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('pets').select('*');
    if (error || !data) return mockPets;
    return data as Pet[];
  } catch {
    return mockPets;
  }
}

export async function getPetsByOwner(ownerId: string): Promise<Pet[]> {
  if (!isSupabaseConfigured()) {
    return mockGetPetsForOwner(ownerId);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('pets').select('*').eq('owner_id', ownerId);
    if (error || !data) return mockGetPetsForOwner(ownerId);
    return data as Pet[];
  } catch {
    return mockGetPetsForOwner(ownerId);
  }
}

export async function getPet(id: string): Promise<Pet | null> {
  if (!isSupabaseConfigured()) {
    return mockPets.find((p) => p.id === id) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('pets').select('*').eq('id', id).single();
    if (error || !data) return mockPets.find((p) => p.id === id) ?? null;
    return data as Pet;
  } catch {
    return mockPets.find((p) => p.id === id) ?? null;
  }
}

export async function createPet(petData: {
  owner_id: string;
  name: string;
  species: string;
  breed?: string | null;
  age?: number | null;
  weight?: number | null;
  special_needs?: string | null;
  photo_url?: string | null;
}): Promise<Pet | null> {
  if (!isSupabaseConfigured()) {
    const mockPet: Pet = {
      id: `mock-pet-${Date.now()}`,
      owner_id: petData.owner_id,
      name: petData.name,
      species: petData.species as Pet['species'],
      breed: petData.breed ?? null,
      age: petData.age ?? null,
      weight: petData.weight ?? null,
      special_needs: petData.special_needs ?? null,
      photo_url: petData.photo_url ?? null,
      created_at: new Date().toISOString(),
    };
    return mockPet;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pets')
      .insert(petData)
      .select()
      .single();
    if (error || !data) return null;
    return data as Pet;
  } catch {
    return null;
  }
}
