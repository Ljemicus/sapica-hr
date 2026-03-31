import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { mockUpdates, getUpdatesForBooking as mockGetUpdates } from '@/lib/mock-data';
import type { PetUpdate } from '@/lib/types';

export async function getUpdates(): Promise<PetUpdate[]> {
  if (!isSupabaseConfigured()) {
    return mockUpdates;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pet_updates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return mockUpdates;
    return data as PetUpdate[];
  } catch {
    return mockUpdates;
  }
}

type BookingUpdateFields = 'full' | 'recent-list';

function pickMockUpdateFields(updates: PetUpdate[], fields: BookingUpdateFields = 'full'): PetUpdate[] {
  if (fields === 'full') return updates;

  return updates.map((update) => ({
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

export async function getUpdatesByBooking(bookingId: string, fields: BookingUpdateFields = 'full'): Promise<PetUpdate[]> {
  if (!isSupabaseConfigured()) {
    return pickMockUpdateFields(mockGetUpdates(bookingId), fields);
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
    if (error || !data) return pickMockUpdateFields(mockGetUpdates(bookingId), fields);
    return data as unknown as PetUpdate[];
  } catch {
    return pickMockUpdateFields(mockGetUpdates(bookingId), fields);
  }
}
