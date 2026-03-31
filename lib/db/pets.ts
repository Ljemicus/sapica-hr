import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { mockPets, getPetsForOwner as mockGetPetsForOwner } from '@/lib/mock-data';
import type { Pet } from '@/lib/types';

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
    if (error || !data) return [];
    return data as unknown as Pet[];
  } catch {
    return [];
  }
}

export async function getPet(id: string): Promise<Pet | null> {
  if (!isSupabaseConfigured()) {
    return mockPets.find((p) => p.id === id) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('pets').select('*').eq('id', id).single();
    if (error || !data) return null;
    return data as Pet;
  } catch {
    return null;
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
      microchip: 'Nije uneseno',
      ownerName: 'Nepoznato',
      ownerPhone: '',
      vetName: 'Nije uneseno',
      vetPhone: '',
      allergies: [],
      specialNeeds: pet.special_needs || '',
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pets')
      .select('name, species, breed, age, weight, microchip, vet_name, vet_phone, allergies, special_needs, owner:users!owner_id(name, phone)')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    const petData = data as Record<string, unknown> & {
      owner?: { name?: string | null; phone?: string | null } | null;
    };

    return {
      name: (petData.name as string) || 'Nepoznato',
      species: ((petData.species as 'dog' | 'cat' | 'other' | null) || 'dog'),
      breed: (petData.breed as string | null) || 'Nepoznata pasmina',
      age: (petData.age as number | null) || 0,
      weight: (petData.weight as number | null) || 0,
      microchip: (petData.microchip as string | null) || 'Nije uneseno',
      ownerName: petData.owner?.name || 'Nepoznato',
      ownerPhone: petData.owner?.phone || '',
      vetName: (petData.vet_name as string | null) || 'Nije uneseno',
      vetPhone: (petData.vet_phone as string | null) || '',
      allergies: Array.isArray(petData.allergies) ? petData.allergies as string[] : [],
      specialNeeds: (petData.special_needs as string | null) || '',
    };
  } catch {
    return null;
  }
}
