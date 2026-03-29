'use server';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { Walk } from '@/lib/types';

interface CreateWalkInput {
  sitter_id: string;
  pet_id: string;
  booking_id: string;
  start_time: string;
}

interface UpdateWalkInput {
  end_time?: string;
  status?: 'u_tijeku' | 'zavrsena';
  distance_km?: number;
  route?: { lat: number; lng: number }[];
  checkpoints?: Walk['checkpoints'];
}

export async function createWalk(input: CreateWalkInput): Promise<Walk | null> {
  if (!isSupabaseConfigured()) {
    // Mock: return a fake walk for demo
    return {
      id: `walk-${Date.now()}`,
      ...input,
      end_time: null,
      status: 'u_tijeku',
      distance_km: 0,
      route: [],
      checkpoints: [],
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('walks')
      .insert({
        ...input,
        status: 'u_tijeku',
        distance_km: 0,
        route: [],
        checkpoints: [],
      })
      .select()
      .single();

    if (error || !data) return null;
    return data as Walk;
  } catch {
    return null;
  }
}

export async function updateWalk(id: string, input: UpdateWalkInput): Promise<Walk | null> {
  if (!isSupabaseConfigured()) {
    // Mock: return null (client handles state locally)
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('walks')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return data as Walk;
  } catch {
    return null;
  }
}
