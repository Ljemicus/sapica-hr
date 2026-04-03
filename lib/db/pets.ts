import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { mockPets, getPetsForOwner as mockGetPetsForOwner } from '@/lib/mock-data';
import type { Pet, WalkLabelPet } from '@/lib/types';

export interface PetCardData {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight: number;
  microchip: string;
  ownerName: string;
  ownerPhone: string;
  vetName: string;
  vetPhone: string;
  allergies: string[];
  specialNeeds: string;
}

export async function getPets(): Promise<Pet[]> {
  if (!isSupabaseConfigured()) {
    return mockPets;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('pets').select('*');
    if (error || !data) return [];
    return data as Pet[];
  } catch {
    return [];
  }
}

type PetFields = 'full' | 'walk-label';

function pickMockPetFields(pets: Pet[], fields: 'walk-label'): WalkLabelPet[];
function pickMockPetFields(pets: Pet[], fields?: 'full'): Pet[];
function pickMockPetFields(pets: Pet[], fields: PetFields = 'full'): Pet[] | WalkLabelPet[] {
  if (fields === 'full') return pets;

  return pets.map((pet) => ({
    id: pet.id,
    owner_id: pet.owner_id,
    name: pet.name,
    species: pet.species,
    created_at: pet.created_at,
  }));
}

export async function getPetsByOwner(ownerId: string, fields: 'walk-label'): Promise<WalkLabelPet[]>;
export async function getPetsByOwner(ownerId: string, fields?: 'full'): Promise<Pet[]>;
export async function getPetsByOwner(ownerId: string, fields: PetFields = 'full'): Promise<Pet[] | WalkLabelPet[]> {
  if (!isSupabaseConfigured()) {
    const ownerPets = mockGetPetsForOwner(ownerId);
    return fields === 'walk-label'
      ? pickMockPetFields(ownerPets, 'walk-label')
      : pickMockPetFields(ownerPets, 'full');
  }
  try {
    const supabase = await createClient();
    const selectClause = fields === 'walk-label' ? 'id, owner_id, name, species, created_at' : '*';
    const { data, error } = await supabase.from('pets').select(selectClause).eq('owner_id', ownerId);
    if (error || !data) return [];
    return fields === 'walk-label' ? (data as unknown as WalkLabelPet[]) : (data as unknown as Pet[]);
  } catch {
    return [];
  }
}

export async function getPet(id: string): Promise<Pet | null> {
  const mockPet = mockPets.find((p) => p.id === id) ?? null;

  if (!isSupabaseConfigured()) {
    return mockPet;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('pets').select('*').eq('id', id).single();
    if (error || !data) return mockPet;
    return data as Pet;
  } catch {
    return mockPet;
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
    return null;
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

export async function getPetCardData(id: string): Promise<PetCardData | null> {
  if (!isSupabaseConfigured()) {
    const pet = mockPets.find((p) => p.id === id);
    if (!pet) return null;

    return {
      name: pet.name,
      species: pet.species || 'dog',
      breed: pet.breed || 'Nepoznata pasmina',
      age: pet.age || 0,
      weight: pet.weight || 0,
      microchip: 'N/A',
      ownerName: 'Vlasnik',
      ownerPhone: 'N/A',
      vetName: 'Veterinar',
      vetPhone: 'N/A',
      allergies: [],
      specialNeeds: pet.special_needs || '',
    };
  }
  return null;
}
