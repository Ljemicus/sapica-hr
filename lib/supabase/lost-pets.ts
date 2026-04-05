import { createClient } from './client';
import type { LostPet } from '@/lib/types';

const supabase = createClient();

// Map DB row (Schema A — migration 002) to LostPet type
function mapDbToLostPet(row: Record<string, unknown>): LostPet {
  return {
    id: row.id as string,
    user_id: (row.user_id as string) || null,
    name: row.name as string,
    species: row.species as LostPet['species'],
    breed: (row.breed as string) || '',
    color: row.color as string,
    sex: (row.sex as 'muško' | 'žensko') || 'muško',
    image_url: (row.image_url as string) || '/images/placeholder-pet.jpg',
    gallery: (row.gallery as string[]) || [],
    city: row.city as string,
    neighborhood: (row.neighborhood as string) || '',
    location_lat: Number(row.location_lat) || 45.815,
    location_lng: Number(row.location_lng) || 15.982,
    date_lost: row.date_lost as string,
    status: row.status as LostPet['status'],
    hidden: (row.hidden as boolean) || false,
    description: (row.description as string) || '',
    special_marks: (row.special_marks as string) || '',
    has_microchip: (row.has_microchip as boolean) || false,
    has_collar: (row.has_collar as boolean) || false,
    contact_name: (row.contact_name as string) || '',
    contact_phone: (row.contact_phone as string) || '',
    contact_email: (row.contact_email as string) || '',
    share_count: (row.share_count as number) || 0,
    found_at: (row.found_at as string) || null,
    found_method: (row.found_method as LostPet['found_method']) || null,
    reunion_message: (row.reunion_message as string) || null,
    expires_at: (row.expires_at as string) || null,
    reminder_sent_at: (row.reminder_sent_at as string) || null,
    updates: (row.updates as LostPet['updates']) || [],
    sightings: (row.sightings as LostPet['sightings']) || [],
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
    .select('*')
    .order('created_at', { ascending: false });

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

  if (error) {
    return [];
  }

  return (data || []).map(mapDbToLostPet);
}

export async function fetchLostPetById(id: string): Promise<LostPet | null> {
  const { data, error } = await supabase
    .from('lost_pets')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
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
  sex?: string;
  description?: string;
  special_marks?: string;
  neighborhood?: string;
  city: string;
  date_lost: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  has_microchip?: boolean;
  has_collar?: boolean;
  image_url?: string;
  gallery?: string[];
  location_lat?: number;
  location_lng?: number;
}): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
  const { data, error } = await supabase
    .from('lost_pets')
    .insert(pet)
    .select()
    .single();

  return { data, error };
}

export async function addSighting(
  petId: string,
  sighting: { location: string; description?: string }
): Promise<{ error: unknown }> {
  // Sightings are stored as JSONB array in the lost_pets row
  const { data: pet, error: fetchError } = await supabase
    .from('lost_pets')
    .select('sightings')
    .eq('id', petId)
    .single();

  if (fetchError || !pet) return { error: fetchError };

  const currentSightings = (pet.sightings as Record<string, unknown>[]) || [];
  const newSighting = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    location: sighting.location,
    description: sighting.description || '',
  };

  const { error } = await supabase
    .from('lost_pets')
    .update({ sightings: [...currentSightings, newSighting] })
    .eq('id', petId);

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
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('lost-pet-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
