'use server';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { PetUpdate, UpdateType } from '@/lib/types';

interface CreatePetUpdateInput {
  booking_id: string;
  sitter_id: string;
  type: UpdateType;
  emoji: string;
  caption: string;
  photo_url?: string | null;
}

export async function createPetUpdate(input: CreatePetUpdateInput): Promise<PetUpdate | null> {
  if (!isSupabaseConfigured()) {
    // Mock: return a fake update for demo
    return {
      id: `upd-${Date.now()}`,
      ...input,
      photo_url: input.photo_url ?? null,
      created_at: new Date().toISOString(),
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pet_updates')
      .insert({
        ...input,
        photo_url: input.photo_url ?? null,
      })
      .select()
      .single();

    if (error || !data) return null;
    return data as PetUpdate;
  } catch {
    return null;
  }
}

export async function getRecentUpdatesBySitter(sitterId: string, limit = 5): Promise<PetUpdate[]> {
  if (!isSupabaseConfigured()) {
    const { mockUpdates } = await import('@/lib/mock-data');
    return mockUpdates.filter(u => u.sitter_id === sitterId).slice(0, limit);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pet_updates')
      .select('*')
      .eq('sitter_id', sitterId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as PetUpdate[];
  } catch {
    return [];
  }
}
