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

type PetFields = 'full' | 'walk-label';

function pickMockPetFields(pets: Pet[], fields: PetFields = 'full'): Pet[] {
  if (fields === 'full') return pets;

  return pets.map((pet) => ({
    id: pet.id,
    owner_id: pet.owner_id,
    name: pet.name,
    species: pet.species,
    breed: null,
    age: null,
    weight: null,
    special_needs: null,
    photo_url: null,
    created_at: pet.created_at,
  }));
}

export async function getPetsByOwner(ownerId: string, fields: PetFields = 'full'): Promise<Pet[]> {
  if (!isSupabaseConfigured()) {
    return pickMockPetFields(mockGetPetsForOwner(ownerId), fields);
  }
  try {
    const supabase = await createClient();
    const selectClause = fields === 'walk-label' ? 'id, owner_id, name, species, created_at' : '*';
    const { data, error } = await supabase.from('pets').select(selectClause).eq('owner_id', ownerId);
    if (error || !data) return pickMockPetFields(mockGetPetsForOwner(ownerId), fields);
    return data as unknown as Pet[];
  } catch {
    return pickMockPetFields(mockGetPetsForOwner(ownerId), fields);
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
