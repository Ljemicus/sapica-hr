import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { getBookingsForUser as mockGetBookings, getUserById, mockBookings, mockPets } from '@/lib/mock-data';
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
    return data as unknown as Booking[];
  } catch {
    return mockGetBookings(userId, role);
  }
}

type AllBookingFields = 'full' | 'admin-list';

function attachMockBookingRelations(bookings: Booking[]): Booking[] {
  return bookings.map((booking) => ({
    ...booking,
    owner: getUserById(booking.owner_id),
    sitter: getUserById(booking.sitter_id),
    pet: mockPets.find((pet) => pet.id === booking.pet_id),
  }));
}

export async function getAllBookings(fields: AllBookingFields = 'full'): Promise<Booking[]> {
  if (!isSupabaseConfigured()) {
    return attachMockBookingRelations(mockBookings);
  }
  try {
    const supabase = await createClient();
    const selectClause = fields === 'admin-list'
      ? 'id, owner_id, sitter_id, pet_id, service_type, start_date, end_date, status, total_price, note, created_at, owner:users!owner_id(id, name), sitter:users!sitter_id(id, name)'
      : '*, owner:users!owner_id(*), sitter:users!sitter_id(*), pet:pets(*)';
    const { data, error } = await supabase
      .from('bookings')
      .select(selectClause)
      .order('created_at', { ascending: false });
    if (error || !data) return attachMockBookingRelations(mockBookings);
    return data as unknown as Booking[];
  } catch {
    return attachMockBookingRelations(mockBookings);
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
