import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
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
    return [];
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

export async function getPetsByOwner(ownerId: string, fields: 'walk-label'): Promise<WalkLabelPet[]>;
export async function getPetsByOwner(ownerId: string, fields?: 'full'): Promise<Pet[]>;
export async function getPetsByOwner(ownerId: string, fields: PetFields = 'full'): Promise<Pet[] | WalkLabelPet[]> {
  if (!isSupabaseConfigured()) {
    return [];
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
  if (!isSupabaseConfigured()) {
    return null;
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

export async function getPetCardData(_id: string): Promise<PetCardData | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return null;
}
