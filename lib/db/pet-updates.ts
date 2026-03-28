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

export async function getUpdatesByBooking(bookingId: string): Promise<PetUpdate[]> {
  if (!isSupabaseConfigured()) {
    return mockGetUpdates(bookingId);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pet_updates')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });
    if (error || !data) return mockGetUpdates(bookingId);
    return data as PetUpdate[];
  } catch {
    return mockGetUpdates(bookingId);
  }
}
