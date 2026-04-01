import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { getBookingsForUser as mockGetBookings, getUserById, mockBookings, mockPets } from '@/lib/mock-data';
import type { Booking, OwnerHistoryBooking, WalkSelectorBooking } from '@/lib/types';

type BookingFields = 'full' | 'walk-selector' | 'owner-history';

type MinimalPet = {
  id: string;
  owner_id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: null;
  age: null;
  weight: null;
  special_needs: null;
  photo_url: null;
  created_at: string;
};

type MinimalSitter = {
  id: string;
  name: string;
  avatar_url: string | null;
};

type BookingBaseRow = {
  id: string;
  owner_id: string;
  sitter_id: string;
  pet_id: string;
  service_type: Booking['service_type'];
  start_date: string;
  end_date: string;
  status: Booking['status'];
  total_price: number;
  note: string | null;
  created_at: string;
};

type WalkSelectorRow = BookingBaseRow & { pet?: MinimalPet };
type OwnerHistoryRow = BookingBaseRow & { sitter?: MinimalSitter; pet?: MinimalPet };

function toWalkSelectorBooking(row: WalkSelectorRow): WalkSelectorBooking {
  return {
    id: row.id,
    owner_id: row.owner_id,
    sitter_id: row.sitter_id,
    pet_id: row.pet_id,
    service_type: row.service_type,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    total_price: row.total_price,
    note: row.note,
    created_at: row.created_at,
    pet: row.pet,
  };
}

function toOwnerHistoryBooking(row: OwnerHistoryRow): OwnerHistoryBooking {
  return {
    id: row.id,
    owner_id: row.owner_id,
    sitter_id: row.sitter_id,
    pet_id: row.pet_id,
    service_type: row.service_type,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status,
    total_price: row.total_price,
    note: row.note,
    created_at: row.created_at,
    sitter: row.sitter
      ? {
          id: row.sitter.id,
          email: '',
          name: row.sitter.name,
          role: 'sitter',
          avatar_url: row.sitter.avatar_url,
          phone: null,
          city: null,
          created_at: '',
        }
      : undefined,
    pet: row.pet,
  };
}

function pickMockBookingFields(bookings: Booking[], fields: 'walk-selector'): WalkSelectorBooking[];
function pickMockBookingFields(bookings: Booking[], fields: 'owner-history'): OwnerHistoryBooking[];
function pickMockBookingFields(bookings: Booking[], fields?: 'full'): Booking[];
function pickMockBookingFields(bookings: Booking[], fields: BookingFields = 'full'): Booking[] | OwnerHistoryBooking[] | WalkSelectorBooking[] {
  if (fields === 'full') return bookings;

  if (fields === 'walk-selector') {
    return bookings.map((booking) =>
      toWalkSelectorBooking({
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
        pet: booking.pet
          ? {
              id: booking.pet.id,
              owner_id: booking.pet.owner_id,
              name: booking.pet.name,
              species: booking.pet.species,
              breed: null,
              age: null,
              weight: null,
              special_needs: null,
              photo_url: null,
              created_at: booking.pet.created_at,
            }
          : undefined,
      })
    );
  }

  return bookings.map((booking) =>
    toOwnerHistoryBooking({
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
            name: booking.sitter.name,
            avatar_url: booking.sitter.avatar_url,
          }
        : undefined,
      pet: booking.pet
        ? {
            id: booking.pet.id,
            owner_id: booking.pet.owner_id,
            name: booking.pet.name,
            species: booking.pet.species,
            breed: null,
            age: null,
            weight: null,
            special_needs: null,
            photo_url: null,
            created_at: booking.pet.created_at,
          }
        : undefined,
    })
  );
}

export async function getBookings(
  userId: string,
  role: 'owner' | 'sitter',
  fields: 'owner-history'
): Promise<OwnerHistoryBooking[]>;
export async function getBookings(
  userId: string,
  role: 'owner' | 'sitter',
  fields: 'walk-selector'
): Promise<WalkSelectorBooking[]>;
export async function getBookings(
  userId: string,
  role: 'owner' | 'sitter',
  fields?: Exclude<BookingFields, 'owner-history' | 'walk-selector'>
): Promise<Booking[]>;
export async function getBookings(
  userId: string,
  role: 'owner' | 'sitter',
  fields: BookingFields = 'full'
): Promise<Booking[] | OwnerHistoryBooking[] | WalkSelectorBooking[]> {
  if (!isSupabaseConfigured()) {
    return fields === 'walk-selector'
      ? pickMockBookingFields(mockGetBookings(userId, role), 'walk-selector')
      : fields === 'owner-history'
      ? pickMockBookingFields(mockGetBookings(userId, role), 'owner-history')
      : pickMockBookingFields(mockGetBookings(userId, role), 'full');
  }
  try {
    const supabase = await createClient();
    const column = role === 'owner' ? 'owner_id' : 'sitter_id';

    if (fields === 'walk-selector') {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, owner_id, sitter_id, pet_id, service_type, start_date, end_date, status, total_price, note, created_at, pet:pets(id, owner_id, name, species, created_at)')
        .eq(column, userId)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return (data as unknown as WalkSelectorRow[]).map((row) =>
        toWalkSelectorBooking({
          ...row,
          pet: row.pet
            ? {
                ...row.pet,
                breed: null,
                age: null,
                weight: null,
                special_needs: null,
                photo_url: null,
              }
            : undefined,
        })
      );
    }

    if (fields === 'owner-history') {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, owner_id, sitter_id, pet_id, service_type, start_date, end_date, status, total_price, note, created_at, sitter:users!sitter_id(id, name, avatar_url), pet:pets(id, owner_id, name, species, created_at)')
        .eq(column, userId)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return (data as unknown as OwnerHistoryRow[]).map((row) =>
        toOwnerHistoryBooking({
          ...row,
          pet: row.pet
            ? {
                ...row.pet,
                breed: null,
                age: null,
                weight: null,
                special_needs: null,
                photo_url: null,
              }
            : undefined,
        })
      );
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*, owner:users!owner_id(*), sitter:users!sitter_id(*), pet:pets(*)')
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
    return null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select('*, owner:users!owner_id(*), sitter:users!sitter_id(*), pet:pets(*)')
      .single();
    if (error || !data) return null;
    return data as Booking;
  } catch {
    return null;
  }
}
