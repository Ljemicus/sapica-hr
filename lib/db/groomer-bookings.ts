import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { GroomerBooking, GroomerBookingStatus } from '@/lib/types';

export async function createGroomerBooking(
  booking: Omit<GroomerBooking, 'id' | 'created_at' | 'updated_at' | 'groomer'>
): Promise<GroomerBooking | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();

    // Check slot isn't already booked
    const { data: existing } = await supabase
      .from('groomer_bookings')
      .select('id')
      .eq('groomer_id', booking.groomer_id)
      .eq('date', booking.date)
      .eq('start_time', booking.start_time)
      .not('status', 'in', '("cancelled","rejected")')
      .maybeSingle();

    if (existing) return null; // Slot taken

    const { data, error } = await supabase
      .from('groomer_bookings')
      .insert(booking)
      .select()
      .single();
    if (error || !data) return null;
    return data as GroomerBooking;
  } catch {
    return null;
  }
}

export async function getGroomerBookings(
  groomerId: string,
  filters?: { status?: string; fromDate?: string }
): Promise<GroomerBooking[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from('groomer_bookings')
      .select('*')
      .eq('groomer_id', groomerId)
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
    return data as GroomerBooking[];
  } catch {
    return [];
  }
}

export async function getUserGroomerBookings(userId: string): Promise<GroomerBooking[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('groomer_bookings')
      .select('*, groomer:groomers(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error || !data) return [];
    return data as GroomerBooking[];
  } catch {
    return [];
  }
}

export async function updateGroomerBookingStatus(
  bookingId: string,
  status: GroomerBookingStatus
): Promise<GroomerBooking | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('groomer_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();
    if (error || !data) return null;
    return data as GroomerBooking;
  } catch {
    return null;
  }
}

export async function cancelGroomerBooking(
  bookingId: string,
  userId: string
): Promise<GroomerBooking | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('groomer_bookings')
      .update({ status: 'cancelled' as GroomerBookingStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error || !data) return null;
    return data as GroomerBooking;
  } catch {
    return null;
  }
}
