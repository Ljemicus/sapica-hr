import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { getBookingsForUser as mockGetBookings, mockBookings } from '@/lib/mock-data';
import type { Booking } from '@/lib/types';

export async function getBookings(
  userId: string,
  role: 'owner' | 'sitter'
): Promise<Booking[]> {
  if (!isSupabaseConfigured()) {
    return mockGetBookings(userId, role);
  }
  try {
    const supabase = await createClient();
    const column = role === 'owner' ? 'owner_id' : 'sitter_id';
    const { data, error } = await supabase
      .from('bookings')
      .select('*, owner:users!owner_id(*), sitter:users!sitter_id(*), pet:pets(*)')
      .eq(column, userId)
      .order('created_at', { ascending: false });
    if (error || !data) return mockGetBookings(userId, role);
    return data as Booking[];
  } catch {
    return mockGetBookings(userId, role);
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  if (!isSupabaseConfigured()) {
    return mockBookings;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*, owner:users!owner_id(*), sitter:users!sitter_id(*), pet:pets(*)')
      .order('created_at', { ascending: false });
    if (error || !data) return mockBookings;
    return data as Booking[];
  } catch {
    return mockBookings;
  }
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (!isSupabaseConfigured()) {
    return mockBookings.find((b) => b.id === id) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*, owner:users!owner_id(*), sitter:users!sitter_id(*), pet:pets(*)')
      .eq('id', id)
      .single();
    if (error || !data) return mockBookings.find((b) => b.id === id) ?? null;
    return data as Booking;
  } catch {
    return mockBookings.find((b) => b.id === id) ?? null;
  }
}

export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'created_at' | 'owner' | 'sitter' | 'pet' | 'sitter_profile'>
): Promise<Booking | null> {
  if (!isSupabaseConfigured()) {
    // Mock: return a fake booking with generated ID
    const mockBooking: Booking = {
      ...bookingData,
      id: `mock-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    return mockBooking;
  }
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

export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<Booking | null> {
  return updateBooking(id, { status });
}

export async function updateBooking(
  id: string,
  updates: Partial<Omit<Booking, 'id' | 'created_at' | 'owner' | 'sitter' | 'pet' | 'sitter_profile'>>
): Promise<Booking | null> {
  if (!isSupabaseConfigured()) {
    const booking = mockBookings.find((b) => b.id === id);
    if (!booking) return null;
    return { ...booking, ...updates };
  }
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
