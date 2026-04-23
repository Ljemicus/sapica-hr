// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — iCal Feed Export API Route
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

// iCal date format: 20250407T120000Z
function formatICalDate(date: string | Date): string {
  const d = new Date(date);
  return format(d, "yyyyMMdd'T'HHmmss'Z'");
}

function formatICalDateOnly(date: string | Date): string {
  const d = new Date(date);
  return format(d, 'yyyyMMdd');
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function generateICalFeed(
  feedName: string,
  bookings: Array<Record<string, unknown>>,
  includeClientDetails: boolean,
  includeInternalNotes: boolean,
  _feedToken: string
): string {
  const now = formatICalDate(new Date());
  
  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PetPark//Calendar//HR',
    `X-WR-CALNAME:${escapeICalText(feedName)}`,
    'X-WR-TIMEZONE:Europe/Zagreb',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    '',
  ];

  for (const booking of bookings) {
    const startTime = booking.start_time as string;
    const endTime = booking.end_time as string;
    const isAllDay = !startTime.includes('T');
    
    let description = booking.description as string || '';
    
    if (includeClientDetails) {
      description += `\\n\\nKlijent: ${booking.client_name}`;
      if (booking.client_phone) {
        description += `\\nTelefon: ${booking.client_phone}`;
      }
      if (booking.client_email) {
        description += `\\nEmail: ${booking.client_email}`;
      }
      if (booking.pet_name) {
        description += `\\nLjubimac: ${booking.pet_name}`;
      }
    }
    
    if (includeInternalNotes && booking.internal_notes) {
      description += `\\n\\nBilješke: ${booking.internal_notes}`;
    }

    const eventLines = [
      'BEGIN:VEVENT',
      `UID:${booking.id}@petpark.hr`,
      `DTSTAMP:${now}`,
      isAllDay 
        ? `DTSTART;VALUE=DATE:${formatICalDateOnly(startTime)}`
        : `DTSTART:${formatICalDate(startTime)}`,
      isAllDay
        ? `DTEND;VALUE=DATE:${formatICalDateOnly(endTime)}`
        : `DTEND:${formatICalDate(endTime)}`,
      `SUMMARY:${escapeICalText(booking.title as string)}`,
    ];

    if (description) {
      eventLines.push(`DESCRIPTION:${escapeICalText(description)}`);
    }

    if (booking.location_address) {
      eventLines.push(`LOCATION:${escapeICalText(booking.location_address as string)}`);
    }

    // Add status
    const status = booking.status as string;
    if (status === 'cancelled') {
      eventLines.push('STATUS:CANCELLED');
    } else if (status === 'confirmed' || status === 'completed') {
      eventLines.push('STATUS:CONFIRMED');
    } else {
      eventLines.push('STATUS:TENTATIVE');
    }

    // Add URL back to PetPark
    eventLines.push(`URL;VALUE=URI:https://petpark.hr/dashboard/bookings/${booking.id}`);
    
    // Add reminder
    eventLines.push('BEGIN:VALARM');
    eventLines.push('ACTION:DISPLAY');
    eventLines.push('DESCRIPTION:Reminder');
    eventLines.push('TRIGGER:-PT1H');
    eventLines.push('END:VALARM');
    
    eventLines.push('END:VEVENT');
    eventLines.push('');

    icalContent = icalContent.concat(eventLines);
  }

  icalContent.push('END:VCALENDAR');

  return icalContent.join('\r\n');
}

// GET /api/calendar/ical/[userId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: _userId } = await params;
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse('Missing feed token', { status: 400 });
    }

    // Get feed configuration
    const { data: feed, error: feedError } = await supabase
      .from('ical_feeds')
      .select('*')
      .eq('feed_token', token)
      .single();

    if (feedError || !feed) {
      return new NextResponse('Invalid feed token', { status: 403 });
    }

    // Update access stats
    await supabase.rpc('update_ical_feed_access', {
      p_feed_token: token,
    });

    // Check if feed is public or user is authenticated
    if (!feed.is_public) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return new NextResponse('Authentication required', { status: 401 });
      }
    }

    // Get bookings based on feed filters
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('provider_type', feed.provider_type)
      .eq('provider_id', feed.provider_id)
      .in('status', feed.include_statuses);

    // Exclude specific services if configured
    if (feed.exclude_services && feed.exclude_services.length > 0) {
      // This requires a join with booking_services
      const { data: excludedBookingIds } = await supabase
        .from('booking_services')
        .select('booking_id')
        .in('service_type', feed.exclude_services);

      if (excludedBookingIds && excludedBookingIds.length > 0) {
        query = query.not(
          'id',
          'in',
          `(${excludedBookingIds.map((b) => b.booking_id).join(',')})`
        );
      }
    }

    // Get future bookings and past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    query = query.gte('start_time', thirtyDaysAgo.toISOString());
    query = query.order('start_time', { ascending: true });

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error('Error fetching bookings for iCal:', bookingsError);
      return new NextResponse('Failed to fetch bookings', { status: 500 });
    }

    // Generate iCal content
    const icalContent = generateICalFeed(
      feed.feed_name,
      bookings || [],
      feed.include_client_details,
      feed.include_internal_notes,
      token
    );

    // Return iCal response
    return new NextResponse(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="petpark-calendar-${feed.provider_type}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error generating iCal feed:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

// POST /api/calendar/ical/[userId] — Create or update iCal feed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      provider_type,
      provider_id,
      feed_name,
      is_public,
      include_statuses,
      exclude_services,
      include_client_details,
      include_internal_notes,
    } = body;

    // Generate new token
    const { data: newToken } = await supabase.rpc('generate_ical_token');

    const { data: feed, error } = await supabase
      .from('ical_feeds')
      .insert({
        provider_type,
        provider_id,
        feed_token: newToken,
        feed_name: feed_name || 'My PetPark Calendar',
        is_public: is_public || false,
        include_statuses: include_statuses || ['confirmed', 'completed'],
        exclude_services: exclude_services || [],
        include_client_details: include_client_details || false,
        include_internal_notes: include_internal_notes || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating iCal feed:', error);
      return NextResponse.json(
        { error: 'Failed to create iCal feed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: feed }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/calendar/ical:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/ical/[userId] — Delete iCal feed
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feedId = searchParams.get('feed_id');

    if (!feedId) {
      return NextResponse.json(
        { error: 'Missing feed_id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('ical_feeds')
      .delete()
      .eq('id', feedId);

    if (error) {
      console.error('Error deleting iCal feed:', error);
      return NextResponse.json(
        { error: 'Failed to delete iCal feed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/calendar/ical:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
