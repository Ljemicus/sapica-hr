import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { TrainerAvailabilitySlot } from '@/lib/types';
import { getTrainerBookedSlots } from './trainer-bookings';

/**
 * Fetch available (and un-booked) slots for a trainer.
 * Phase 5: slots that overlap an active booking (pending/confirmed)
 * are excluded from the result.
 */
export async function getTrainerAvailability(
  trainerId: string,
  fromDate?: string,
  toDate?: string
): Promise<TrainerAvailabilitySlot[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const today = fromDate || new Date().toISOString().split('T')[0];
    let query = supabase
      .from('trainer_availability')
      .select('*')
      .eq('trainer_id', trainerId)
      .eq('is_available', true)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (toDate) {
      query = query.lte('date', toDate);
    }

    const [{ data, error }, booked] = await Promise.all([
      query,
      getTrainerBookedSlots(trainerId, fromDate, toDate),
    ]);

    if (error || !data) return [];

    // Fast-path: no bookings → return all slots unchanged
    if (booked.length === 0) return data as TrainerAvailabilitySlot[];

    // Build a Set of "date|start_time" keys for O(1) conflict checks
    const bookedKeys = new Set(
      booked.map((b) => `${b.date}|${b.start_time}`)
    );

    return (data as TrainerAvailabilitySlot[]).filter(
      (slot) => !bookedKeys.has(`${slot.date}|${slot.start_time}`)
    );
  } catch {
    return [];
  }
}

export async function getTrainerAvailableDates(trainerId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const slots = await getTrainerAvailability(trainerId);
    return [...new Set(slots.map((s) => s.date))];
  } catch {
    return [];
  }
}

export async function setTrainerAvailability(
  trainerId: string,
  slots: { date: string; start_time: string; end_time: string }[]
): Promise<TrainerAvailabilitySlot[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const records = slots.map((s) => ({
      trainer_id: trainerId,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      is_available: true,
    }));
    const { data, error } = await supabase
      .from('trainer_availability')
      .upsert(records, { onConflict: 'trainer_id,date,start_time' })
      .select();
    if (error || !data) return [];
    return data as TrainerAvailabilitySlot[];
  } catch {
    return [];
  }
}

export async function deleteTrainerAvailability(
  trainerId: string,
  slotIds: string[]
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('trainer_availability')
      .delete()
      .eq('trainer_id', trainerId)
      .in('id', slotIds);
    return !error;
  } catch {
    return false;
  }
}
