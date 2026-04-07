// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Google Calendar Sync API Route
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Google OAuth configuration
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

// Validation schemas
const syncConfigSchema = z.object({
  provider_type: z.enum(['sitter', 'groomer', 'trainer']).optional(),
  provider_id: z.string().uuid().optional(),
  google_calendar_id: z.string().optional(),
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  sync_direction: z.enum(['to_google', 'from_google', 'bidirectional']).default('bidirectional'),
  default_reminder_minutes: z.number().default(60),
  color_code: z.string().optional(),
});

const syncActionSchema = z.object({
  action: z.enum(['sync', 'import', 'export', 'disconnect']),
  provider_type: z.enum(['sitter', 'groomer', 'trainer']),
  provider_id: z.string().uuid(),
});

// GET /api/calendar/sync/google
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const providerType = searchParams.get('provider_type');
    const providerId = searchParams.get('provider_id');

    let query = supabase
      .from('calendar_sync_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('sync_enabled', true);

    if (providerType && providerId) {
      query = query.eq('provider_type', providerType).eq('provider_id', providerId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error fetching sync config:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sync configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/calendar/sync/google:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/sync/google
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = syncConfigSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

    const { data: syncConfig, error } = await supabase
      .from('calendar_sync_tokens')
      .upsert({
        user_id: user.id,
        provider_type: data.provider_type,
        provider_id: data.provider_id,
        google_calendar_id: data.google_calendar_id,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_expires_at: expiresAt,
        sync_direction: data.sync_direction,
        sync_enabled: true,
        default_reminder_minutes: data.default_reminder_minutes,
        color_code: data.color_code,
        last_sync_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving sync config:', error);
      return NextResponse.json(
        { error: 'Failed to save sync configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: syncConfig }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/calendar/sync/google:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/calendar/sync/google — Perform sync actions
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = syncActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { action, provider_type, provider_id } = validation.data;

    // Get sync configuration
    const { data: syncConfig } = await supabase
      .from('calendar_sync_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider_type', provider_type)
      .eq('provider_id', provider_id)
      .eq('sync_enabled', true)
      .single();

    if (!syncConfig && action !== 'disconnect') {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'sync':
        return await performBidirectionalSync(supabase, syncConfig, provider_type, provider_id);
      case 'import':
        return await importFromGoogle(supabase, syncConfig, provider_type, provider_id);
      case 'export':
        return await exportToGoogle(supabase, syncConfig, provider_type, provider_id);
      case 'disconnect':
        return await disconnectGoogleCalendar(supabase, user.id, provider_type, provider_id);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in PUT /api/calendar/sync/google:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/sync/google
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing sync config id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('calendar_sync_tokens')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting sync config:', error);
      return NextResponse.json(
        { error: 'Failed to delete sync configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/calendar/sync/google:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNC HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

async function ensureValidToken(syncConfig: Record<string, unknown>): Promise<string | null> {
  const expiresAt = new Date(syncConfig.token_expires_at as string);
  const now = new Date();

  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    return await refreshAccessToken(syncConfig.refresh_token as string);
  }

  return syncConfig.access_token as string;
}

async function performBidirectionalSync(
  supabase: ReturnType<typeof createClient>,
  syncConfig: Record<string, unknown>,
  providerType: string,
  providerId: string
) {
  const accessToken = await ensureValidToken(syncConfig);
  if (!accessToken) {
    return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 401 });
  }

  let imported = 0;
  let exported = 0;

  // Import from Google if needed
  if (syncConfig.sync_direction === 'from_google' || syncConfig.sync_direction === 'bidirectional') {
    const calendarId = (syncConfig.google_calendar_id as string) || 'primary';
    const timeMin = new Date().toISOString();

    const response = await fetch(
      `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      for (const event of data.items || []) {
        // Skip events created by PetPark
        if (event.extendedProperties?.private?.petpark_booking_id) continue;

        const { error } = await supabase.from('bookings').insert({
          provider_type: providerType,
          provider_id: providerId,
          title: event.summary || 'Google Calendar Event',
          description: event.description || '',
          start_time: event.start?.dateTime || event.start?.date,
          end_time: event.end?.dateTime || event.end?.date,
          client_name: 'Google Calendar Import',
          source: 'google_calendar',
          external_id: event.id,
          status: 'confirmed',
        });

        if (!error) imported++;
      }
    }
  }

  // Export to Google if needed
  if (syncConfig.sync_direction === 'to_google' || syncConfig.sync_direction === 'bidirectional') {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_type', providerType)
      .eq('provider_id', providerId)
      .gte('start_time', new Date().toISOString());

    for (const booking of bookings || []) {
      const eventData = {
        summary: booking.title,
        description: `${booking.description || ''}\n\nKlijent: ${booking.client_name}\n${booking.client_phone ? `Telefon: ${booking.client_phone}` : ''}\n${booking.pet_name ? `Ljubimac: ${booking.pet_name}` : ''}`,
        start: {
          dateTime: booking.start_time,
          timeZone: booking.timezone || 'Europe/Zagreb',
        },
        end: {
          dateTime: booking.end_time,
          timeZone: booking.timezone || 'Europe/Zagreb',
        },
        location: booking.location_address || undefined,
        extendedProperties: {
          private: {
            petpark_booking_id: booking.id,
            petpark_provider_type: booking.provider_type,
            petpark_provider_id: booking.provider_id,
          },
        },
      };

      const calendarId = (syncConfig.google_calendar_id as string) || 'primary';
      const url = booking.external_id
        ? `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events/${booking.external_id}`
        : `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events`;

      const response = await fetch(url, {
        method: booking.external_id ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const googleEvent = await response.json();
        await supabase
          .from('bookings')
          .update({ external_id: googleEvent.id })
          .eq('id', booking.id);
        exported++;
      }
    }
  }

  // Update last sync time
  await supabase
    .from('calendar_sync_tokens')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', syncConfig.id as string);

  return NextResponse.json({ data: { imported, exported } });
}

async function importFromGoogle(
  supabase: ReturnType<typeof createClient>,
  syncConfig: Record<string, unknown>,
  providerType: string,
  providerId: string
) {
  const accessToken = await ensureValidToken(syncConfig);
  if (!accessToken) {
    return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 401 });
  }

  const calendarId = (syncConfig.google_calendar_id as string) || 'primary';
  const timeMin = new Date().toISOString();

  const response = await fetch(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/${calendarId}/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch from Google Calendar' }, { status: 500 });
  }

  const data = await response.json();
  let imported = 0;

  for (const event of data.items || []) {
    if (event.extendedProperties?.private?.petpark_booking_id) continue;

    const { error } = await supabase.from('bookings').insert({
      provider_type: providerType,
      provider_id: providerId,
      title: event.summary || 'Google Calendar Event',
      description: event.description || '',
      start_time: event.start?.dateTime || event.start?.date,
      end_time: event.end?.dateTime || event.end?.date,
      client_name: 'Google Calendar Import',
      source: 'google_calendar',
      external_id: event.id,
      status: 'confirmed',
    });

    if (!error) imported++;
  }

  return NextResponse.json({ data: { imported } });
}

async function exportToGoogle(
  supabase: ReturnType<typeof createClient>,
  syncConfig: Record<string, unknown>,
  providerType: string,
  providerId: string
) {
  const accessToken = await ensureValidToken(syncConfig);
  if (!accessToken) {
    return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 401 });
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('provider_type', providerType)
    .eq('provider_id', providerId)
    .gte('start_time', new Date().toISOString());

  let exported = 0;
  const calendarId = (syncConfig.google_calendar_id as string) || 'primary';

  for (const booking of bookings || []) {
    const eventData = {
      summary: booking.title,
      description: `${booking.description || ''}\n\nKlijent: ${booking.client_name}`,
      start: {
        dateTime: booking.start_time,
        timeZone: booking.timezone || 'Europe/Zagreb',
      },
      end: {
        dateTime: booking.end_time,
        timeZone: booking.timezone || 'Europe/Zagreb',
      },
      extendedProperties: {
        private: {
          petpark_booking_id: booking.id,
        },
      },
    };

    const response = await fetch(
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

    if (response.ok) {
      const googleEvent = await response.json();
      await supabase
        .from('bookings')
        .update({ external_id: googleEvent.id })
        .eq('id', booking.id);
      exported++;
    }
  }

  return NextResponse.json({ data: { exported } });
}

async function disconnectGoogleCalendar(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  providerType?: string,
  providerId?: string
) {
  let query = supabase
    .from('calendar_sync_tokens')
    .delete()
    .eq('user_id', userId);

  if (providerType && providerId) {
    query = query.eq('provider_type', providerType).eq('provider_id', providerId);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
