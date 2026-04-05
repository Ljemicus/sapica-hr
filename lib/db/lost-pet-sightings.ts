import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { LostPetSighting } from '@/lib/types';

function mapRow(row: Record<string, unknown>): LostPetSighting {
  return {
    id: row.id as string,
    lost_pet_id: row.lost_pet_id as string,
    location_label: (row.location_label as string) || '',
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    seen_at: row.seen_at as string,
    photo_url: (row.photo_url as string) || null,
    description: (row.description as string) || '',
    created_at: row.created_at as string,
  };
}

export async function getSightingsByPetId(petId: string): Promise<LostPetSighting[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pet_sightings')
      .select('*')
      .eq('lost_pet_id', petId)
      .order('seen_at', { ascending: false });

    if (error || !data) return [];
    return data.map((r) => mapRow(r as unknown as Record<string, unknown>));
  } catch {
    return [];
  }
}

export interface InsertSightingInput {
  lost_pet_id: string;
  location_label: string;
  lat?: number;
  lng?: number;
  seen_at?: string;
  photo_url?: string;
  description: string;
  reporter_ip?: string;
}

export async function insertSighting(input: InsertSightingInput): Promise<LostPetSighting | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('lost_pet_sightings')
      .insert({
        lost_pet_id: input.lost_pet_id,
        location_label: input.location_label,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        seen_at: input.seen_at ?? new Date().toISOString(),
        photo_url: input.photo_url ?? null,
        description: input.description,
        reporter_ip: input.reporter_ip ?? null,
      })
      .select('*')
      .single();

    if (error || !data) return null;
    return mapRow(data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}
