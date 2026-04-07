// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Availability Library Functions
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/client';
import type {
  AvailabilitySlot,
  BlockedDate,
  CreateAvailabilitySlotInput,
  UpdateAvailabilitySlotInput,
  CreateBlockedDateInput,
  UpdateBlockedDateInput,
  WorkingHours,
  DailyAvailabilitySlot,
  CalendarApiResponse,
} from '@/types/calendar';

const supabase = createClient();

// ═══════════════════════════════════════════════════════════════════════════════
// AVAILABILITY SLOTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get availability slots for a provider
 */
export async function getAvailabilitySlots(
  providerType: string,
  providerId: string,
  options?: {
    slotType?: 'one_time' | 'recurring';
    fromDate?: string;
    toDate?: string;
  }
): Promise<CalendarApiResponse<AvailabilitySlot[]>> {
  try {
    let query = supabase
      .from('availability_slots')
      .select('*')
      .eq('provider_type', providerType)
      .eq('provider_id', providerId)
      .eq('is_available', true);

    if (options?.slotType) {
      query = query.eq('slot_type', options.slotType);
    }

    if (options?.fromDate && options?.toDate) {
      query = query.or(
        `and(slot_type.eq.recurring,effective_from.lte.${options.toDate},effective_until.gte.${options.fromDate}),and(slot_type.eq.one_time,specific_date.gte.${options.fromDate},specific_date.lte.${options.toDate})`
      );
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) throw error;

    return { data: data || [] };
  } catch (error) {
    console.error('Error fetching availability slots:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch availability' };
  }
}

/**
 * Create a new availability slot
 */
export async function createAvailabilitySlot(
  input: CreateAvailabilitySlotInput
): Promise<CalendarApiResponse<AvailabilitySlot>> {
  try {
    const { data, error } = await supabase
      .from('availability_slots')
      .insert({
        provider_type: input.provider_type,
        provider_id: input.provider_id,
        slot_type: input.slot_type,
        specific_date: input.specific_date,
        day_of_week: input.day_of_week,
        start_time: input.start_time,
        end_time: input.end_time,
        effective_from: input.effective_from || new Date().toISOString().split('T')[0],
        effective_until: input.effective_until,
        slot_duration_minutes: input.slot_duration_minutes || 60,
        buffer_minutes: input.buffer_minutes || 0,
        max_bookings_per_slot: input.max_bookings_per_slot || 1,
        notes: input.notes,
      })
      .select()
      .single();

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Error creating availability slot:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create availability slot' };
  }
}

/**
 * Update an availability slot
 */
export async function updateAvailabilitySlot(
  slotId: string,
  input: UpdateAvailabilitySlotInput
): Promise<CalendarApiResponse<AvailabilitySlot>> {
  try {
    const { data, error } = await supabase
      .from('availability_slots')
      .update({
        start_time: input.start_time,
        end_time: input.end_time,
        is_available: input.is_available,
        notes: input.notes,
        effective_until: input.effective_until,
        updated_at: new Date().toISOString(),
      })
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Error updating availability slot:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update availability slot' };
  }
}

/**
 * Delete an availability slot
 */
export async function deleteAvailabilitySlot(
  slotId: string
): Promise<CalendarApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('availability_slots')
      .delete()
      .eq('id', slotId);

    if (error) throw error;

    return { data: true };
  } catch (error) {
    console.error('Error deleting availability slot:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete availability slot' };
  }
}

/**
 * Set working hours from a weekly schedule
 */
export async function setWorkingHours(
  providerType: string,
  providerId: string,
  workingHours: WorkingHours
): Promise<CalendarApiResponse<boolean>> {
  try {
    const { error } = await supabase.rpc('set_working_hours', {
      p_provider_type: providerType,
      p_provider_id: providerId,
      p_working_hours: workingHours,
    });

    if (error) throw error;

    return { data: true };
  } catch (error) {
    console.error('Error setting working hours:', error);
    return { error: error instanceof Error ? error.message : 'Failed to set working hours' };
  }
}

/**
 * Create recurring availability for a specific day of week
 */
export async function createRecurringAvailability(
  providerType: string,
  providerId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  options?: {
    slotDurationMinutes?: number;
    effectiveFrom?: string;
    effectiveUntil?: string;
  }
): Promise<CalendarApiResponse<string>> {
  try {
    const { data, error } = await supabase.rpc('create_recurring_availability', {
      p_provider_type: providerType,
      p_provider_id: providerId,
      p_day_of_week: dayOfWeek,
      p_start_time: startTime,
      p_end_time: endTime,
      p_slot_duration_minutes: options?.slotDurationMinutes || 60,
      p_effective_from: options?.effectiveFrom || new Date().toISOString().split('T')[0],
      p_effective_until: options?.effectiveUntil,
    });

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Error creating recurring availability:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create recurring availability' };
  }
}

/**
 * Get daily availability with booking status
 */
export async function getDailyAvailability(
  providerType: string,
  providerId: string,
  date: string
): Promise<CalendarApiResponse<DailyAvailabilitySlot[]>> {
  try {
    const { data, error } = await supabase.rpc('get_daily_availability', {
      p_provider_type: providerType,
      p_provider_id: providerId,
      p_date: date,
    });

    if (error) throw error;

    return { data: data || [] };
  } catch (error) {
    console.error('Error fetching daily availability:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch daily availability' };
  }
}

/**
 * Get available slots for a date range
 */
export async function getAvailableSlots(
  providerType: string,
  providerId: string,
  startDate: string,
  endDate: string
): Promise<
  CalendarApiResponse<
    Array<{
      slot_date: string;
      start_time: string;
      end_time: string;
      is_available: boolean;
    }>
  >
> {
  try {
    const { data, error } = await supabase.rpc('get_available_slots', {
      p_provider_type: providerType,
      p_provider_id: providerId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;

    return { data: data || [] };
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch available slots' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCKED DATES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get blocked dates for a provider
 */
export async function getBlockedDates(
  providerType: string,
  providerId: string,
  options?: {
    fromDate?: string;
    toDate?: string;
  }
): Promise<CalendarApiResponse<BlockedDate[]>> {
  try {
    let query = supabase
      .from('blocked_dates')
      .select('*')
      .eq('provider_type', providerType)
      .eq('provider_id', providerId);

    if (options?.fromDate && options?.toDate) {
      query = query.or(
        `and(start_date.lte.${options.toDate},end_date.gte.${options.fromDate})`
      );
    }

    const { data, error } = await query.order('start_date', { ascending: true });

    if (error) throw error;

    return { data: data || [] };
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch blocked dates' };
  }
}

/**
 * Create a blocked date
 */
export async function createBlockedDate(
  input: CreateBlockedDateInput
): Promise<CalendarApiResponse<BlockedDate>> {
  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .insert({
        provider_type: input.provider_type,
        provider_id: input.provider_id,
        block_type: input.block_type,
        start_date: input.start_date,
        end_date: input.end_date,
        start_time: input.start_time,
        end_time: input.end_time,
        title: input.title,
        reason: input.reason,
        is_recurring_yearly: input.is_recurring_yearly || false,
      })
      .select()
      .single();

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Error creating blocked date:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create blocked date' };
  }
}

/**
 * Update a blocked date
 */
export async function updateBlockedDate(
  blockedDateId: string,
  input: UpdateBlockedDateInput
): Promise<CalendarApiResponse<BlockedDate>> {
  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .update({
        block_type: input.block_type,
        start_date: input.start_date,
        end_date: input.end_date,
        start_time: input.start_time,
        end_time: input.end_time,
        title: input.title,
        reason: input.reason,
        is_recurring_yearly: input.is_recurring_yearly,
        updated_at: new Date().toISOString(),
      })
      .eq('id', blockedDateId)
      .select()
      .single();

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Error updating blocked date:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update blocked date' };
  }
}

/**
 * Delete a blocked date
 */
export async function deleteBlockedDate(
  blockedDateId: string
): Promise<CalendarApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('id', blockedDateId);

    if (error) throw error;

    return { data: true };
  } catch (error) {
    console.error('Error deleting blocked date:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete blocked date' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const DAY_NAMES = ['ned', 'pon', 'uto', 'sri', 'cet', 'pet', 'sub'];
const DAY_NAMES_FULL = [
  'Nedjelja',
  'Ponedjeljak',
  'Utorak',
  'Srijeda',
  'Četvrtak',
  'Petak',
  'Subota',
];

/**
 * Convert day number to Croatian day name
 */
export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] || '';
}

/**
 * Get full Croatian day name
 */
export function getDayNameFull(dayOfWeek: number): string {
  return DAY_NAMES_FULL[dayOfWeek] || '';
}

/**
 * Format time from HH:MM to display format
 */
export function formatTime(time: string): string {
  return time.substring(0, 5);
}

/**
 * Check if a date is blocked
 */
export async function isDateBlocked(
  providerType: string,
  providerId: string,
  date: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('id')
      .eq('provider_type', providerType)
      .eq('provider_id', providerId)
      .lte('start_date', date)
      .gte('end_date', date)
      .limit(1);

    if (error) throw error;

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking blocked date:', error);
    return false;
  }
}

/**
 * Get working hours from availability slots
 */
export async function getWorkingHours(
  providerType: string,
  providerId: string
): Promise<CalendarApiResponse<WorkingHours>> {
  try {
    const { data, error } = await supabase
      .from('availability_slots')
      .select('day_of_week, start_time, end_time')
      .eq('provider_type', providerType)
      .eq('provider_id', providerId)
      .eq('slot_type', 'recurring')
      .eq('is_available', true);

    if (error) throw error;

    const workingHours: WorkingHours = {};
    data?.forEach((slot) => {
      if (slot.day_of_week !== null) {
        const dayName = getDayName(slot.day_of_week) as keyof WorkingHours;
        workingHours[dayName] = {
          start: slot.start_time.substring(0, 5),
          end: slot.end_time.substring(0, 5),
        };
      }
    });

    return { data: workingHours };
  } catch (error) {
    console.error('Error fetching working hours:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch working hours' };
  }
}
