// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Availability API Route
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const createSlotSchema = z.object({
  provider_type: z.enum(['sitter', 'groomer', 'trainer']),
  provider_id: z.string().uuid(),
  slot_type: z.enum(['one_time', 'recurring']),
  specific_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  day_of_week: z.number().min(0).max(6).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  effective_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  effective_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  slot_duration_minutes: z.number().default(60),
  buffer_minutes: z.number().default(0),
  max_bookings_per_slot: z.number().default(1),
  notes: z.string().optional(),
});

const updateSlotSchema = z.object({
  id: z.string().uuid(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  is_available: z.boolean().optional(),
  notes: z.string().optional(),
  effective_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const workingHoursSchema = z.object({
  provider_type: z.enum(['sitter', 'groomer', 'trainer']),
  provider_id: z.string().uuid(),
  working_hours: z.record(
    z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ),
});

// GET /api/calendar/availability
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
    const slotType = searchParams.get('slot_type') as 'one_time' | 'recurring' | null;
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const specificDate = searchParams.get('specific_date');

    if (!providerType || !providerId) {
      return NextResponse.json(
        { error: 'Missing provider_type or provider_id' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('availability_slots')
      .select('*')
      .eq('provider_type', providerType)
      .eq('provider_id', providerId);

    if (slotType) {
      query = query.eq('slot_type', slotType);
    }

    if (specificDate) {
      // For one-time slots on a specific date
      query = query
        .eq('slot_type', 'one_time')
        .eq('specific_date', specificDate);
    } else if (fromDate && toDate) {
      // For date range queries
      query = query.or(
        `and(slot_type.eq.recurring,effective_from.lte.${toDate},or(effective_until.gte.${fromDate},effective_until.is.null)),and(slot_type.eq.one_time,specific_date.gte.${fromDate},specific_date.lte.${toDate})`
      );
    }

    query = query.order('start_time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching availability:', error);
      return NextResponse.json(
        { error: 'Failed to fetch availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/calendar/availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/availability
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createSlotSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Validate slot_type specific fields
    if (data.slot_type === 'one_time' && !data.specific_date) {
      return NextResponse.json(
        { error: 'specific_date is required for one_time slots' },
        { status: 400 }
      );
    }

    if (data.slot_type === 'recurring' && data.day_of_week === undefined) {
      return NextResponse.json(
        { error: 'day_of_week is required for recurring slots' },
        { status: 400 }
      );
    }

    const { data: slot, error } = await supabase
      .from('availability_slots')
      .insert({
        provider_type: data.provider_type,
        provider_id: data.provider_id,
        slot_type: data.slot_type,
        specific_date: data.specific_date,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        effective_from: data.effective_from || new Date().toISOString().split('T')[0],
        effective_until: data.effective_until,
        slot_duration_minutes: data.slot_duration_minutes,
        buffer_minutes: data.buffer_minutes,
        max_bookings_per_slot: data.max_bookings_per_slot,
        notes: data.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating availability slot:', error);
      return NextResponse.json(
        { error: 'Failed to create availability slot' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: slot }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/calendar/availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/calendar/availability
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateSlotSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validation.data;

    const { data: slot, error } = await supabase
      .from('availability_slots')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating availability slot:', error);
      return NextResponse.json(
        { error: 'Failed to update availability slot' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: slot });
  } catch (error) {
    console.error('Error in PATCH /api/calendar/availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/availability
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
        { error: 'Missing slot id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('availability_slots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting availability slot:', error);
      return NextResponse.json(
        { error: 'Failed to delete availability slot' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/calendar/availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/calendar/availability/working-hours
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = workingHoursSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const { error } = await supabase.rpc('set_working_hours', {
      p_provider_type: data.provider_type,
      p_provider_id: data.provider_id,
      p_working_hours: data.working_hours,
    });

    if (error) {
      console.error('Error setting working hours:', error);
      return NextResponse.json(
        { error: 'Failed to set working hours' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/calendar/availability/working-hours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
