import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { TrainerBooking, TrainerBookingStatus } from '@/lib/types';
import { TRAINER_BOOKING_BLOCKING_STATUSES } from '@/lib/types';

/**
 * Return active (pending | confirmed) bookings for a trainer in a date range.
 * Used by the availability layer to filter out taken slots.
 */
export async function getTrainerBookedSlots(
  trainerId: string,
  fromDate?: string,
  toDate?: string
): Promise<Pick<TrainerBooking, 'date' | 'start_time' | 'end_time'>[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const today = fromDate || new Date().toISOString().split('T')[0];

    let query = supabase
      .from('trainer_bookings')
      .select('date, start_time, end_time')
      .eq('trainer_id', trainerId)
      .in('status', TRAINER_BOOKING_BLOCKING_STATUSES)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (toDate) {
      query = query.lte('date', toDate);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Pick<TrainerBooking, 'date' | 'start_time' | 'end_time'>[];
  } catch {
    return [];
  }
}

/**
 * Create a trainer booking with conflict-safe insert.
 * Returns null when the slot is already taken (pending/confirmed).
 */
export async function createTrainerBooking(
  booking: Omit<TrainerBooking, 'id' | 'created_at' | 'updated_at' | 'trainer'>
): Promise<TrainerBooking | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();

    // Check for conflicting booking on the same trainer + date + start_time
    const { data: existing } = await supabase
      .from('trainer_bookings')
      .select('id')
      .eq('trainer_id', booking.trainer_id)
      .eq('date', booking.date)
      .eq('start_time', booking.start_time)
      .in('status', TRAINER_BOOKING_BLOCKING_STATUSES)
      .maybeSingle();

    if (existing) return null;

    const { data, error } = await supabase
      .from('trainer_bookings')
      .insert(booking)
      .select()
      .single();
    if (error || !data) return null;
    return data as TrainerBooking;
  } catch {
    return null;
  }
}

/** Update a trainer booking's status. */
export async function updateTrainerBookingStatus(
  bookingId: string,
  status: TrainerBookingStatus
): Promise<TrainerBooking | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('trainer_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();
    if (error || !data) return null;
    return data as TrainerBooking;
  } catch {
    return null;
  }
}

/** Get all bookings for a trainer (dashboard use). */
export async function getTrainerBookings(
  trainerId: string,
  filters?: { status?: TrainerBookingStatus; fromDate?: string }
): Promise<TrainerBooking[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from('trainer_bookings')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.fromDate) {
      query = query.gte('date', filters.fromDate);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as TrainerBooking[];
  } catch {
    return [];
  }
}
