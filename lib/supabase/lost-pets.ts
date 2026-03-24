import { createClient } from './client';
import type { LostPet, LostPetSighting } from '@/lib/types';

const supabase = createClient();

// Map DB row to LostPet type
function mapDbToLostPet(row: Record<string, unknown>): LostPet {
  return {
    id: row.id as string,
    user_id: (row.user_id as string) || null,
    name: row.name as string,
    species: row.species as LostPet['species'],
    breed: (row.breed as string) || '',
    color: row.color as string,
    sex: (row.gender as 'muško' | 'žensko') || 'muško',
    image_url: ((row.images as string[]) || [])[0] || '/images/placeholder-pet.jpg',
    gallery: (row.images as string[]) || [],
    city: row.last_seen_city as string,
    neighborhood: (row.last_seen_location as string) || '',
    location_lat: Number(row.lat) || 45.815,
    location_lng: Number(row.lng) || 15.982,
    date_lost: row.last_seen_date as string,
    status: row.status as LostPet['status'],
    description: (row.description as string) || '',
    special_marks: (row.special_marks as string) || '',
    has_microchip: (row.has_microchip as boolean) || false,
    has_collar: (row.has_collar as boolean) || false,
    contact_name: (row.contact_name as string) || '',
    contact_phone: (row.contact_phone as string) || '',
    contact_email: (row.contact_email as string) || '',
    share_count: (row.share_count as number) || 0,
    updates: [],
    sightings: ((row.lost_pet_sightings as Record<string, unknown>[]) || []).map(s => ({
      id: s.id as string,
      date: s.created_at as string,
      location: s.location as string,
      description: (s.description as string) || '',
    })),
    created_at: row.created_at as string,
  };
}

export async function fetchLostPets(filters?: {
  city?: string;
  species?: string;
  status?: string;
}): Promise<LostPet[]> {
  let query = supabase
    .from('lost_pets')
    .select('*, lost_pet_sightings(*)')
    .order('created_at', { ascending: false });

  if (filters?.city) {
    query = query.eq('last_seen_city', filters.city);
  }
  if (filters?.species) {
    query = query.eq('species', filters.species);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching lost pets:', error);
    return [];
  }

  return (data || []).map(mapDbToLostPet);
}

export async function fetchLostPetById(id: string): Promise<LostPet | null> {
  const { data, error } = await supabase
    .from('lost_pets')
    .select('*, lost_pet_sightings(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching lost pet:', error);
    return null;
  }

  return mapDbToLostPet(data);
}

export async function insertLostPet(pet: {
  user_id: string;
  name: string;
  species: string;
  breed?: string;
  color: string;
  gender?: string;
  description?: string;
  special_marks?: string;
  last_seen_location?: string;
  last_seen_city: string;
  last_seen_date: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  has_microchip?: boolean;
  has_collar?: boolean;
  images?: string[];
  lat?: number;
  lng?: number;
}): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
  const { data, error } = await supabase
    .from('lost_pets')
    .insert(pet)
    .select()
    .single();

  return { data, error };
}

export async function insertSighting(sighting: {
  lost_pet_id: string;
  user_id?: string;
  location: string;
  description?: string;
}): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('lost_pet_sightings')
    .insert(sighting);

  return { error };
}

export async function uploadLostPetImage(
  file: File,
  userId: string
): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('lost-pet-images')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('lost-pet-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
