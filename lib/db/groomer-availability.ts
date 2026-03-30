import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { GroomerAvailabilitySlot } from '@/lib/types';

export async function getGroomerAvailability(
  groomerId: string,
  fromDate?: string,
  toDate?: string
): Promise<GroomerAvailabilitySlot[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const today = fromDate || new Date().toISOString().split('T')[0];
    let query = supabase
      .from('groomer_availability')
      .select('*')
      .eq('groomer_id', groomerId)
      .eq('is_available', true)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (toDate) {
      query = query.lte('date', toDate);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    // Filter out slots that already have a non-cancelled/rejected booking
    const { data: bookings } = await supabase
      .from('groomer_bookings')
      .select('date, start_time')
      .eq('groomer_id', groomerId)
      .gte('date', today)
      .not('status', 'in', '("cancelled","rejected")');

    const bookedSlots = new Set(
      (bookings || []).map((b) => `${b.date}_${b.start_time}`)
    );

    return (data as GroomerAvailabilitySlot[]).filter(
      (slot) => !bookedSlots.has(`${slot.date}_${slot.start_time}`)
    );
  } catch {
    return [];
  }
}

export async function getGroomerAvailableDates(groomerId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const slots = await getGroomerAvailability(groomerId);
    const dates = [...new Set(slots.map((s) => s.date))];
    return dates;
  } catch {
    return [];
  }
}

export async function setGroomerAvailability(
  groomerId: string,
  slots: { date: string; start_time: string; end_time: string }[]
): Promise<GroomerAvailabilitySlot[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const records = slots.map((s) => ({
      groomer_id: groomerId,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      is_available: true,
    }));
    const { data, error } = await supabase
      .from('groomer_availability')
      .upsert(records, { onConflict: 'groomer_id,date,start_time' })
      .select();
    if (error || !data) return [];
    return data as GroomerAvailabilitySlot[];
  } catch {
    return [];
  }
}

export async function deleteGroomerAvailability(
  groomerId: string,
  slotIds: string[]
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('groomer_availability')
      .delete()
      .eq('groomer_id', groomerId)
      .in('id', slotIds);
    return !error;
  } catch {
    return false;
  }
}
