import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { Walk } from '@/lib/types';

export async function getWalk(id: string): Promise<Walk | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('walks').select('*').eq('id', id).single();
    if (error || !data) return null;
    return data as Walk;
  } catch {
    return null;
  }
}

export async function getWalksByBooking(bookingId: string): Promise<Walk[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('walks')
      .select('*')
      .eq('booking_id', bookingId)
      .order('start_time', { ascending: false });
    if (error || !data) return [];
    return data as Walk[];
  } catch {
    return [];
  }
}

export async function getWalksForUser(userId: string): Promise<Walk[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = await createClient();

    const { data: sitterWalks, error: sitterError } = await supabase
      .from('walks')
      .select('*')
      .eq('sitter_id', userId)
      .order('start_time', { ascending: false });

    const { data: pets } = await supabase
      .from('pets')
      .select('id')
      .eq('owner_id', userId);

    const petIds = (pets || []).map((p) => p.id);

    let ownerWalks: Walk[] = [];
    if (petIds.length > 0) {
      const { data, error } = await supabase
        .from('walks')
        .select('*')
        .in('pet_id', petIds)
        .order('start_time', { ascending: false });
      if (!error && data) {
        ownerWalks = data as Walk[];
      }
    }

    const allWalks = [...(sitterError || !sitterWalks ? [] : (sitterWalks as Walk[])), ...ownerWalks];

    const seen = new Set<string>();
    return allWalks.filter((w) => {
      if (seen.has(w.id)) return false;
      seen.add(w.id);
      return true;
    });
  } catch {
    return [];
  }
}

export async function getActiveWalksForSitter(sitterId: string): Promise<Walk[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('walks')
      .select('*')
      .eq('sitter_id', sitterId)
      .eq('status', 'u_tijeku')
      .order('start_time', { ascending: false });
    if (error || !data) return [];
    return data as Walk[];
  } catch {
    return [];
  }
}
