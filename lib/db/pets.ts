import { createClient } from '@/lib/supabase/server';
import type { Pet } from '@/lib/types';

export async function getPets(): Promise<Pet[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('pets').select('*');
    if (error || !data) return [];
    return data as Pet[];
  } catch {
    return [];
  }
}

export async function getPetsByOwner(ownerId: string): Promise<Pet[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('pets').select('*').eq('owner_id', ownerId);
    if (error || !data) return [];
    return data as Pet[];
  } catch {
    return [];
  }
}

export async function getPet(id: string): Promise<Pet | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('pets').select('*').eq('id', id).single();
    if (error || !data) return null;
    return data as Pet;
  } catch {
    return null;
  }
}
