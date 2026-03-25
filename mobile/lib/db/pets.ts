import { supabase } from '../supabase';
import { Pet } from '../../types';

export async function getPets(): Promise<Pet[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  const speciesMap: Record<string, Pet['type']> = {
    dog: 'pas',
    cat: 'macka',
    other: 'ostalo',
  };

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    type: speciesMap[row.species] || 'ostalo',
    breed: row.breed || '',
    age: row.age || 0,
    image: row.photo_url || '',
  }));
}
