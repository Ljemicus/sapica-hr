import { supabase } from '../supabase';
import { LostPet } from '../../types';

export async function getLostPets(): Promise<LostPet[]> {
  const { data, error } = await supabase
    .from('lost_pets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const speciesMap: Record<string, string> = {
    pas: 'Pas',
    macka: 'Mačka',
    ostalo: 'Ostalo',
  };

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    type: speciesMap[row.species] || row.species,
    breed: row.breed || '',
    image: row.images?.[0] || row.image_url || '',
    lastSeen: row.last_seen_location || row.neighborhood || '',
    lastSeenDate: row.last_seen_date || row.date_lost?.split('T')[0] || '',
    city: row.last_seen_city || row.city || '',
    description: row.description || '',
    contactPhone: row.contact_phone || '',
    found: row.status === 'found',
  }));
}
