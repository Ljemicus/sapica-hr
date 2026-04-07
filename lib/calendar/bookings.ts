// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Booking Library Functions
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/client';
import type {
  Booking,
  BookingService,
  CreateBookingInput,
  UpdateBookingInput,
  CalendarApiResponse,
  ConflictCheckResult,
  BookingStatistics,
} from '@/types/calendar';

const supabase = createClient();

// ═══════════════════════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a new booking with services
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<CalendarApiResponse<Booking>> {
  try {
    // First, check for conflicts
    const { data: conflictData, error: conflictError } = await supabase.rpc(
      'check_booking_conflict',
      {
        p_provider_type: input.provider_type,
        p_provider_id: input.provider_id,
        p_start_time: input.start_time,
        p_end_time: input.end_time,
        p_exclude_booking_id: null,
      }
    );

    if (conflictError) throw conflictError;
    if (conflictData) {
      return { error: 'Time slot is already booked' };
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        provider_type: input.provider_type,
        provider_id: input.provider_id,
        client_name: input.client_name,
        client_email: input.client_email,
        client_phone: input.client_phone,
        pet_name: input.pet_name,
        pet_type: input.pet_type,
        title: input.title,
        description: input.description,
        start_time: input.start_time,
        end_time: input.end_time,
        timezone: input.timezone || 'Europe/Zagreb',
        price: input.price,
        currency: input.currency || 'EUR',
        location_type: input.location_type || 'provider',
        location_address: input.location_address,
        internal_notes: input.internal_notes,
        client_notes: input.client_notes,
        source: 'manual',
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Create associated services if provided
    if (input.services && input.services.length > 0) {
      const servicesData = input.services.map((service) => ({
        booking_id: booking.id,
        service_id: service.service_id,
        service_type: service.service_type,
        service_name: service.service_name,
        duration_minutes: service.duration_minutes || 60,
        price: service.price,
        metadata: service.metadata || {},
      }));

      const { error: servicesError } = await supabase
        .from('booking_services')
        .insert(servicesData);

      if (servicesError) throw servicesError;
    }

    return { data: booking };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create booking' };
  }
}

/**
 * Get bookings for a provider within a date range
 */
export async function getBookings(
  providerType: string,
  providerId: string,
  startDate: string,
  endDate: string,
  options?: {
    status?: string[];
    includeServices?: boolean;
  }
): Promise<CalendarApiResponse<Booking[]>> {
  try {
    let query = supabase
      .from('bookings')
      .select(
        options?.includeServices
          ? `*, services:booking_services(*)`
          : '*'
      )
      .eq('provider_type', providerType)
      .eq('provider_id', providerId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });

    if (options?.status && options.status.length > 0) {
      query = query.in('status', options.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: (data || []) as unknown as Booking[] };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch bookings' };
  }
}

/**
 * Get a single booking by ID with all details
 */
export async function getBookingById(
  bookingId: string
): Promise<CalendarApiResponse<Booking>> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services:booking_services(*),
        client:client_id(name, avatar_url),
        pet:pet_id(name, photo_url)
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch booking' };
  }
}

/**
 * Update a booking
 */
export async function updateBooking(
  bookingId: string,
  input: UpdateBookingInput
): Promise<CalendarApiResponse<Booking>> {
  try {
    // Check for time conflicts if updating times
    if (input.start_time && input.end_time) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('provider_type, provider_id')
        .eq('id', bookingId)
        .single();

      if (booking) {
        const { data: conflictData } = await supabase.rpc(
          'check_booking_conflict',
          {
            p_provider_type: booking.provider_type,
            p_provider_id: booking.provider_id,
            p_start_time: input.start_time,
            p_end_time: input.end_time,
            p_exclude_booking_id: bookingId,
          }
        );

        if (conflictData) {
          return { error: 'Time slot is already booked' };
        }
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        client_name: input.client_name,
        client_email: input.client_email,
        client_phone: input.client_phone,
        pet_name: input.pet_name,
        pet_type: input.pet_type,
        title: input.title,
        description: input.description,
        status: input.status,
        start_time: input.start_time,
        end_time: input.end_time,
        price: input.price,
        location_type: input.location_type,
        location_address: input.location_address,
        internal_notes: input.internal_notes,
        client_notes: input.client_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;

    // Update services if provided
    if (input.services) {
      // Delete existing services
      await supabase.from('booking_services').delete().eq('booking_id', bookingId);

      // Insert new services
      if (input.services.length > 0) {
        const servicesData = input.services.map((service) => ({
          booking_id: bookingId,
          service_id: service.service_id,
          service_type: service.service_type,
          service_name: service.service_name,
          duration_minutes: service.duration_minutes || 60,
          price: service.price,
          metadata: service.metadata || {},
        }));

        await supabase.from('booking_services').insert(servicesData);
      }
    }

    return { data };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update booking' };
  }
}

/**
 * Delete a booking
 */
export async function deleteBooking(
  bookingId: string
): Promise<CalendarApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) throw error;

    return { data: true };
  } catch (error) {
    console.error('Error deleting booking:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete booking' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Confirm a booking
 */
export async function confirmBooking(
  bookingId: string
): Promise<CalendarApiResponse<Booking>> {
  return updateBooking(bookingId, { status: 'confirmed' });
}

/**
 * Complete a booking
 */
export async function completeBooking(
  bookingId: string
): Promise<CalendarApiResponse<Booking>> {
  return updateBooking(bookingId, { status: 'completed' });
}

/**
 * Cancel a booking with reason
 */
export async function cancelBooking(
  bookingId: string,
  cancelledBy: 'provider' | 'client',
  reason?: string
): Promise<CalendarApiResponse<boolean>> {
  try {
    const { data, error } = await supabase.rpc('cancel_booking', {
      p_booking_id: bookingId,
      p_cancelled_by: cancelledBy,
      p_reason: reason,
    });

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { error: error instanceof Error ? error.message : 'Failed to cancel booking' };
  }
}

/**
 * Reschedule a booking
 */
export async function rescheduleBooking(
  bookingId: string,
  newStartTime: string,
  newEndTime: string,
  reason?: string
): Promise<CalendarApiResponse<boolean>> {
  try {
    const { data, error } = await supabase.rpc('reschedule_booking', {
      p_booking_id: bookingId,
      p_new_start_time: newStartTime,
      p_new_end_time: newEndTime,
      p_reason: reason,
    });

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    return { error: error instanceof Error ? error.message : 'Failed to reschedule booking' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check for booking conflicts
 */
export async function checkBookingConflict(
  providerType: string,
  providerId: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<CalendarApiResponse<ConflictCheckResult>> {
  try {
    const { data: hasConflict, error } = await supabase.rpc(
      'check_booking_conflict',
      {
        p_provider_type: providerType,
        p_provider_id: providerId,
        p_start_time: startTime,
        p_end_time: endTime,
        p_exclude_booking_id: excludeBookingId || null,
      }
    );

    if (error) throw error;

    // If there's a conflict, get the conflicting bookings
    let conflictingBookings: ConflictCheckResult['conflicting_bookings'] = [];
    if (hasConflict) {
      const { data } = await supabase
        .from('bookings')
        .select('id, title, start_time, end_time')
        .eq('provider_type', providerType)
        .eq('provider_id', providerId)
        .in('status', ['pending', 'confirmed'])
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)
        .neq('id', excludeBookingId || '');

      conflictingBookings = data || [];
    }

    return {
      data: {
        has_conflict: hasConflict || false,
        conflicting_bookings: conflictingBookings,
      },
    };
  } catch (error) {
    console.error('Error checking conflicts:', error);
    return { error: error instanceof Error ? error.message : 'Failed to check conflicts' };
  }
}

/**
 * Get booking statistics
 */
export async function getBookingStatistics(
  providerType: string,
  providerId: string,
  startDate: string,
  endDate: string
): Promise<CalendarApiResponse<BookingStatistics>> {
  try {
    const { data, error } = await supabase.rpc('get_booking_statistics', {
      p_provider_type: providerType,
      p_provider_id: providerId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch statistics' };
  }
}

/**
 * Get calendar-formatted bookings for FullCalendar
 */
export async function getCalendarBookings(
  providerType: string,
  providerId: string,
  startDate: string,
  endDate: string
): Promise<
  CalendarApiResponse<
    Array<{
      id: string;
      title: string;
      start_time: string;
      end_time: string;
      status: string;
      client_name: string;
      pet_name: string;
      services: Array<{
        name: string;
        type: string;
        duration: number;
      }>;
      color: string;
    }>
  >
> {
  try {
    const { data, error } = await supabase.rpc('get_calendar_bookings', {
      p_provider_type: providerType,
      p_provider_id: providerId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;

    return { data: data || [] };
  } catch (error) {
    console.error('Error fetching calendar bookings:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch calendar bookings' };
  }
}

/**
 * Mark reminders as sent
 */
export async function markReminderSent(
  bookingId: string,
  reminderType: '24h' | '1h'
): Promise<CalendarApiResponse<boolean>> {
  try {
    const updateField = reminderType === '24h' ? 'reminder_sent_24h' : 'reminder_sent_1h';

    const { error } = await supabase
      .from('bookings')
      .update({ [updateField]: true })
      .eq('id', bookingId);

    if (error) throw error;

    return { data: true };
  } catch (error) {
    console.error('Error marking reminder:', error);
    return { error: error instanceof Error ? error.message : 'Failed to mark reminder' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REALTIME SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Subscribe to booking changes for a provider
 */
export function subscribeToBookings(
  providerType: string,
  providerId: string,
  callback: (payload: { eventType: string; new: Booking; old: Booking }) => void
) {
  return supabase
    .channel(`bookings:${providerType}:${providerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `provider_type=eq.${providerType}&provider_id=eq.${providerId}`,
      },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: payload.new as Booking,
          old: payload.old as Booking,
        });
      }
    )
    .subscribe();
}
