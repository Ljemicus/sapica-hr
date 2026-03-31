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
    return mockUpdates
      .filter(u => u.sitter_id === sitterId)
      .slice(0, limit)
      .map((update) => ({
        id: update.id,
        booking_id: update.booking_id,
        sitter_id: update.sitter_id,
        type: update.type,
        emoji: update.emoji,
        caption: update.caption,
        photo_url: update.photo_url,
        created_at: update.created_at,
      }));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pet_updates')
      .select('id, booking_id, sitter_id, type, emoji, caption, photo_url, created_at')
      .eq('sitter_id', sitterId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as unknown as PetUpdate[];
  } catch {
    return [];
  }
}
