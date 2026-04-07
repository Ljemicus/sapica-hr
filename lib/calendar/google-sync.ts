// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Google Calendar Sync Library
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/client';
import type {
  CalendarSyncToken,
  CreateCalendarSyncInput,
  Booking,
  CalendarApiResponse,
} from '@/types/calendar';

const supabase = createClient();

// Google Calendar API configuration
const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE OAUTH
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get Google OAuth URL for calendar authorization
 */
export function getGoogleAuthUrl(
  providerType?: string,
  providerId?: string,
  redirectUri?: string
): string {
  const state = JSON.stringify({ providerType, providerId });
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri || `${window.location.origin}/api/calendar/sync/google/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state: btoa(state),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri?: string
): Promise<
  CalendarApiResponse<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>
> {
  try {
    const response = await fetch('/api/calendar/sync/google/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        redirect_uri: redirectUri || `${window.location.origin}/api/calendar/sync/google/callback`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Error exchanging code:', error);
    return { error: error instanceof Error ? error.message : 'Failed to exchange code' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNC TOKEN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Save calendar sync configuration
 */
export async function saveCalendarSync(
  input: CreateCalendarSyncInput
): Promise<CalendarApiResponse<CalendarSyncToken>> {
  try {
    const { data, error } = await supabase
      .from('calendar_sync_tokens')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        provider_type: input.provider_type,
        provider_id: input.provider_id,
        google_calendar_id: input.google_calendar_id,
        access_token: input.access_token,
        refresh_token: input.refresh_token,
        token_expires_at: input.token_expires_at,
        sync_direction: input.sync_direction || 'bidirectional',
        sync_enabled: true,
        default_reminder_minutes: input.default_reminder_minutes || 60,
        color_code: input.color_code,
      })
      .select()
      .single();

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Error saving calendar sync:', error);
    return { error: error instanceof Error ? error.message : 'Failed to save calendar sync' };
  }
}

/**
 * Get calendar sync configuration
 */
export async function getCalendarSync(
  providerType?: string,
  providerId?: string
): Promise<CalendarApiResponse<CalendarSyncToken | null>> {
  try {
    let query = supabase
      .from('calendar_sync_tokens')
      .select('*')
      .eq('sync_enabled', true);

    if (providerType && providerId) {
      query = query.eq('provider_type', providerType).eq('provider_id', providerId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    return { data };
  } catch (error) {
    console.error('Error fetching calendar sync:', error);
    return { error: error instanceof Error ? error.message : 'Failed to fetch calendar sync' };
  }
}

/**
 * Delete calendar sync configuration
 */
export async function deleteCalendarSync(
  syncId: string
): Promise<CalendarApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('calendar_sync_tokens')
      .delete()
      .eq('id', syncId);

    if (error) throw error;

    return { data: true };
  } catch (error) {
    console.error('Error deleting calendar sync:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete calendar sync' };
  }
}

/**
 * Toggle sync enabled status
 */
export async function toggleCalendarSync(
  syncId: string,
  enabled: boolean
): Promise<CalendarApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('calendar_sync_tokens')
      .update({ sync_enabled: enabled })
      .eq('id', syncId);

    if (error) throw error;

    return { data: true };
  } catch (error) {
    console.error('Error toggling calendar sync:', error);
    return { error: error instanceof Error ? error.message : 'Failed to toggle calendar sync' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOOGLE CALENDAR API HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('/api/calendar/sync/google/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Ensure access token is valid, refresh if needed
 */
async function ensureValidToken(
  syncToken: CalendarSyncToken
): Promise<string | null> {
  const expiresAt = new Date(syncToken.token_expires_at);
  const now = new Date();

  // If token expires in less than 5 minutes, refresh it
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const newToken = await refreshAccessToken(syncToken.refresh_token);
    if (newToken) {
      // Update token in database
      await supabase
        .from('calendar_sync_tokens')
        .update({
          access_token: newToken,
          token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        })
        .eq('id', syncToken.id);
      return newToken;
    }
    return null;
  }

  return syncToken.access_token;
}

/**
 * Convert PetPark booking to Google Calendar event
 */
function bookingToGoogleEvent(
  booking: Booking,
  options?: { colorCode?: string; reminderMinutes?: number }
): Record<string, unknown> {
  return {
    summary: booking.title,
    description: `
${booking.description || ''}

Klijent: ${booking.client_name}
${booking.client_phone ? `Telefon: ${booking.client_phone}` : ''}
${booking.pet_name ? `Ljubimac: ${booking.pet_name}` : ''}
${booking.internal_notes ? `Bilješke: ${booking.internal_notes}` : ''}

---
ID: ${booking.id}
Source: PetPark
    `.trim(),
    start: {
      dateTime: booking.start_time,
      timeZone: booking.timezone || 'Europe/Zagreb',
    },
    end: {
      dateTime: booking.end_time,
      timeZone: booking.timezone || 'Europe/Zagreb',
    },
    location: booking.location_address || undefined,
    colorId: options?.colorCode,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: options?.reminderMinutes || 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
    extendedProperties: {
      private: {
        petpark_booking_id: booking.id,
        petpark_provider_type: booking.provider_type,
        petpark_provider_id: booking.provider_id,
      },
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNC OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sync a booking to Google Calendar
 */
export async function syncBookingToGoogle(
  booking: Booking,
  syncToken: CalendarSyncToken
): Promise<CalendarApiResponse<{ googleEventId: string }>> {
  try {
    const accessToken = await ensureValidToken(syncToken);
    if (!accessToken) {
      return { error: 'Failed to refresh access token' };
    }

    const calendarId = syncToken.google_calendar_id || 'primary';
    const eventData = bookingToGoogleEvent(booking, {
      colorCode: syncToken.color_code || undefined,
      reminderMinutes: syncToken.default_reminder_minutes,
    });

    // Check if event already exists in Google Calendar
    const { data: existingEvents } = await supabase
      .from('bookings')
      .select('external_id')
      .eq('id', booking.id)
      .single();

    let response: Response;

    if (existingEvents?.external_id) {
      // Update existing event
      response = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events/${existingEvents.external_id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        }
      );
    } else {
      // Create new event
      response = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        }
      );
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to sync to Google Calendar');
    }

    const googleEvent = await response.json();

    // Update booking with Google Calendar event ID
    await supabase
      .from('bookings')
      .update({ external_id: googleEvent.id })
      .eq('id', booking.id);

    return { data: { googleEventId: googleEvent.id } };
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return { error: error instanceof Error ? error.message : 'Failed to sync' };
  }
}

/**
 * Delete a booking from Google Calendar
 */
export async function deleteBookingFromGoogle(
  bookingId: string,
  externalId: string,
  syncToken: CalendarSyncToken
): Promise<CalendarApiResponse<boolean>> {
  try {
    const accessToken = await ensureValidToken(syncToken);
    if (!accessToken) {
      return { error: 'Failed to refresh access token' };
    }

    const calendarId = syncToken.google_calendar_id || 'primary';

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events/${externalId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to delete from Google Calendar');
    }

    return { data: true };
  } catch (error) {
    console.error('Error deleting from Google Calendar:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete' };
  }
}

/**
 * Import events from Google Calendar
 */
export async function importFromGoogleCalendar(
  syncToken: CalendarSyncToken,
  options?: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  }
): Promise<CalendarApiResponse<Array<Partial<Booking>>>> {
  try {
    const accessToken = await ensureValidToken(syncToken);
    if (!accessToken) {
      return { error: 'Failed to refresh access token' };
    }

    const calendarId = syncToken.google_calendar_id || 'primary';
    const params = new URLSearchParams({
      maxResults: String(options?.maxResults || 100),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    if (options?.timeMin) params.set('timeMin', options.timeMin);
    if (options?.timeMax) params.set('timeMax', options.timeMax);
    if (syncToken.next_sync_token) params.set('syncToken', syncToken.next_sync_token);

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Google Calendar');
    }

    const data = await response.json();

    // Update sync token
    if (data.nextSyncToken) {
      await supabase
        .from('calendar_sync_tokens')
        .update({
          next_sync_token: data.nextSyncToken,
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', syncToken.id);
    }

    // Convert Google events to bookings
    const bookings: Array<Partial<Booking>> = (data.items || [])
      .filter((event: Record<string, unknown>) => {
        // Skip events created by PetPark to avoid duplicates
        const extendedProps = event.extendedProperties?.private || {};
        return !extendedProps.petpark_booking_id;
      })
      .map((event: Record<string, unknown>) => ({
        title: event.summary || 'Google Calendar Event',
        description: event.description || '',
        start_time: event.start?.dateTime || event.start?.date,
        end_time: event.end?.dateTime || event.end?.date,
        location_address: event.location || null,
        source: 'google_calendar' as const,
        external_id: event.id,
        status: 'confirmed' as const,
      }));

    return { data: bookings };
  } catch (error) {
    console.error('Error importing from Google Calendar:', error);
    return { error: error instanceof Error ? error.message : 'Failed to import' };
  }
}

/**
 * Perform bidirectional sync
 */
export async function performBidirectionalSync(
  syncToken: CalendarSyncToken,
  providerType: string,
  providerId: string
): Promise<CalendarApiResponse<{ imported: number; exported: number }>> {
  try {
    let imported = 0;
    let exported = 0;

    // Import from Google
    if (syncToken.sync_direction === 'from_google' || syncToken.sync_direction === 'bidirectional') {
      const { data: importedEvents } = await importFromGoogleCalendar(syncToken, {
        timeMin: new Date().toISOString(),
      });

      if (importedEvents) {
        for (const event of importedEvents) {
          // Create booking from Google event
          const { error } = await supabase.from('bookings').insert({
            ...event,
            provider_type: providerType,
            provider_id: providerId,
            client_name: 'Google Calendar Import',
          });

          if (!error) imported++;
        }
      }
    }

    // Export to Google
    if (syncToken.sync_direction === 'to_google' || syncToken.sync_direction === 'bidirectional') {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('provider_type', providerType)
        .eq('provider_id', providerId)
        .gte('start_time', new Date().toISOString());

      for (const booking of bookings || []) {
        const { error } = await syncBookingToGoogle(booking, syncToken);
        if (!error) exported++;
      }
    }

    return { data: { imported, exported } };
  } catch (error) {
    console.error('Error performing bidirectional sync:', error);
    return { error: error instanceof Error ? error.message : 'Failed to sync' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNC STATUS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get last sync status
 */
export async function getLastSyncStatus(
  syncId: string
): Promise<
  CalendarApiResponse<{
    lastSyncAt: string | null;
    nextSyncToken: string | null;
    syncEnabled: boolean;
  }>
> {
  try {
    const { data, error } = await supabase
      .from('calendar_sync_tokens')
      .select('last_sync_at, next_sync_token, sync_enabled')
      .eq('id', syncId)
      .single();

    if (error) throw error;

    return {
      data: {
        lastSyncAt: data.last_sync_at,
        nextSyncToken: data.next_sync_token,
        syncEnabled: data.sync_enabled,
      },
    };
  } catch (error) {
    console.error('Error getting sync status:', error);
    return { error: error instanceof Error ? error.message : 'Failed to get sync status' };
  }
}
