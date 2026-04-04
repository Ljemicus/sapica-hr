import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { PetUpdate } from '@/lib/types';

export async function getUpdates(): Promise<PetUpdate[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pet_updates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as PetUpdate[];
  } catch {
    return [];
  }
}

type BookingUpdateFields = 'full' | 'recent-list';

export async function getUpdatesByBooking(bookingId: string, fields: BookingUpdateFields = 'full'): Promise<PetUpdate[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = await createClient();
    const selectClause = fields === 'recent-list'
      ? 'id, booking_id, sitter_id, type, emoji, caption, photo_url, created_at'
      : '*';
    const { data, error } = await supabase
      .from('pet_updates')
      .select(selectClause)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as unknown as PetUpdate[];
  } catch {
    return [];
  }
}
