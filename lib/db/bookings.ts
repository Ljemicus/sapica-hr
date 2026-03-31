import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { getBookingsForUser as mockGetBookings, getUserById, mockBookings, mockPets } from '@/lib/mock-data';
import type { Booking } from '@/lib/types';

type BookingFields = 'full' | 'walk-selector' | 'owner-history';

function pickMockBookingFields(bookings: Booking[], fields: BookingFields = 'full'): Booking[] {
  if (fields === 'full') return bookings;

  return bookings.map((booking) => ({
    id: booking.id,
    owner_id: booking.owner_id,
    sitter_id: booking.sitter_id,
    pet_id: booking.pet_id,
    service_type: booking.service_type,
    start_date: booking.start_date,
    end_date: booking.end_date,
    status: booking.status,
    total_price: booking.total_price,
    note: booking.note,
    created_at: booking.created_at,
    sitter: booking.sitter
      ? {
          id: booking.sitter.id,
          email: '',
          name: booking.sitter.name,
          role: 'sitter',
          avatar_url: booking.sitter.avatar_url,
          phone: null,
          city: null,
          created_at: '',
        }
      : undefined,
    pet: booking.pet
      ? {
          id: booking.pet.id,
          owner_id: booking.pet.owner_id,
          name: booking.pet.name,
          species: booking.pet.species,
          breed: fields === 'owner-history' ? null : null,
          age: null,
          weight: null,
          special_needs: null,
          photo_url: null,
          created_at: booking.pet.created_at,
        }
      : undefined,
  }));
}

export async function getBookings(
  userId: string,
  role: 'owner' | 'sitter',
  fields: BookingFields = 'full'
): Promise<Booking[]> {
  if (!isSupabaseConfigured()) {
    return pickMockBookingFields(mockGetBookings(userId, role), fields);
  }
  try {
    const supabase = await createClient();
    const column = role === 'owner' ? 'owner_id' : 'sitter_id';
    const selectClause = fields === 'walk-selector'
      ? 'id, owner_id, sitter_id, pet_id, service_type, start_date, end_date, status, total_price, note, created_at, pet:pets(id, owner_id, name, species, created_at)'
      : fields === 'owner-history'
        ? 'id, owner_id, sitter_id, pet_id, service_type, start_date, end_date, status, total_price, note, created_at, sitter:users!sitter_id(id, name, avatar_url), pet:pets(id, owner_id, name, species, created_at)'
        : '*, owner:users!owner_id(*), sitter:users!sitter_id(*), pet:pets(*)';
    const { data, error } = await supabase
      .from('bookings')
      .select(selectClause)
      .eq(column, userId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as unknown as Booking[];
  } catch {
    return [];
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
    if (error || !data) return [];
    return data as unknown as Booking[];
  } catch {
    return [];
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
    if (error || !data) return null;
    return data as Booking;
  } catch {
    return null;
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
