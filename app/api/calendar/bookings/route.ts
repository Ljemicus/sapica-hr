// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Bookings API Route
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const createBookingSchema = z.object({
  provider_type: z.enum(['sitter', 'groomer', 'trainer']),
  provider_id: z.string().uuid(),
  client_name: z.string().min(1),
  client_email: z.string().email().optional(),
  client_phone: z.string().optional(),
  pet_name: z.string().optional(),
  pet_type: z.enum(['dog', 'cat', 'other']).optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  timezone: z.string().default('Europe/Zagreb'),
  price: z.number().optional(),
  currency: z.string().default('EUR'),
  location_type: z.enum(['provider', 'client', 'other']).default('provider'),
  location_address: z.string().optional(),
  internal_notes: z.string().optional(),
  client_notes: z.string().optional(),
  services: z.array(
    z.object({
      service_id: z.string().uuid().optional(),
      service_type: z.string(),
      service_name: z.string(),
      duration_minutes: z.number().default(60),
      price: z.number().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    })
  ).optional(),
});

const updateBookingSchema = createBookingSchema.partial().extend({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
});

// GET /api/calendar/bookings
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
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const status = searchParams.get('status');
    const includeServices = searchParams.get('include_services') === 'true';

    if (!providerType || !providerId) {
      return NextResponse.json(
        { error: 'Missing provider_type or provider_id' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('bookings')
      .select(includeServices ? '*, services:booking_services(*)' : '*')
      .eq('provider_type', providerType)
      .eq('provider_id', providerId);

    if (startDate) {
      query = query.gte('start_time', startDate);
    }

    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    query = query.order('start_time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/calendar/bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/bookings
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check for conflicts
    const { data: hasConflict, error: conflictError } = await supabase.rpc(
      'check_booking_conflict',
      {
        p_provider_type: data.provider_type,
        p_provider_id: data.provider_id,
        p_start_time: data.start_time,
        p_end_time: data.end_time,
        p_exclude_booking_id: null,
      }
    );

    if (conflictError) {
      console.error('Error checking conflicts:', conflictError);
      return NextResponse.json(
        { error: 'Failed to check for conflicts' },
        { status: 500 }
      );
    }

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      );
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        provider_type: data.provider_type,
        provider_id: data.provider_id,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        pet_name: data.pet_name,
        pet_type: data.pet_type,
        title: data.title,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        timezone: data.timezone,
        price: data.price,
        currency: data.currency,
        location_type: data.location_type,
        location_address: data.location_address,
        internal_notes: data.internal_notes,
        client_notes: data.client_notes,
        source: 'manual',
        created_by: user.id,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Create services if provided
    if (data.services && data.services.length > 0) {
      const servicesData = data.services.map((service) => ({
        booking_id: booking.id,
        service_id: service.service_id,
        service_type: service.service_type,
        service_name: service.service_name,
        duration_minutes: service.duration_minutes,
        price: service.price,
        metadata: service.metadata || {},
      }));

      const { error: servicesError } = await supabase
        .from('booking_services')
        .insert(servicesData);

      if (servicesError) {
        console.error('Error creating services:', servicesError);
        // Don't fail the whole request, just log the error
      }
    }

    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/calendar/bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/calendar/bookings
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing booking id' },
        { status: 400 }
      );
    }

    const validation = updateBookingSchema.safeParse(updateData);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check for conflicts if updating times
    if (data.start_time && data.end_time) {
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('provider_type, provider_id')
        .eq('id', id)
        .single();

      if (existingBooking) {
        const { data: hasConflict } = await supabase.rpc(
          'check_booking_conflict',
          {
            p_provider_type: existingBooking.provider_type,
            p_provider_id: existingBooking.provider_id,
            p_start_time: data.start_time,
            p_end_time: data.end_time,
            p_exclude_booking_id: id,
          }
        );

        if (hasConflict) {
          return NextResponse.json(
            { error: 'Time slot is already booked' },
            { status: 409 }
          );
        }
      }
    }

    // Update booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        pet_name: data.pet_name,
        pet_type: data.pet_type,
        title: data.title,
        description: data.description,
        status: data.status,
        start_time: data.start_time,
        end_time: data.end_time,
        price: data.price,
        location_type: data.location_type,
        location_address: data.location_address,
        internal_notes: data.internal_notes,
        client_notes: data.client_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: booking });
  } catch (error) {
    console.error('Error in PATCH /api/calendar/bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/bookings
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
        { error: 'Missing booking id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting booking:', error);
      return NextResponse.json(
        { error: 'Failed to delete booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/calendar/bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
