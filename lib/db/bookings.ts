import { createClient } from '@/lib/supabase/server';
import type { Booking } from '@/lib/types';

export async function getBookings(
  userId: string,
  role: 'owner' | 'sitter'
): Promise<Booking[]> {
  try {
    const supabase = await createClient();
    const column = role === 'owner' ? 'owner_id' : 'sitter_id';
    const { data, error } = await supabase
      .from('bookings')
      .select('*, owner:users!owner_id(*), sitter:users!sitter_id(*), pet:pets(*)')
      .eq(column, userId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Booking[];
  } catch {
    return [];
  }
}

export async function getBooking(id: string): Promise<Booking | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*, owner:users!owner_id(*), sitter:users!sitter_id(*), pet:pets(*)')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as Booking;
  } catch {
    return null;
  }
}

export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'created_at' | 'owner' | 'sitter' | 'pet' | 'sitter_profile'>
): Promise<Booking | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    if (error || !data) return null;
    return data as Booking;
  } catch {
    return null;
  }
}

export async function updateBooking(
  id: string,
  updates: Partial<Omit<Booking, 'id' | 'created_at' | 'owner' | 'sitter' | 'pet' | 'sitter_profile'>>
): Promise<Booking | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return null;
    return data as Booking;
  } catch {
    return null;
  }
}
