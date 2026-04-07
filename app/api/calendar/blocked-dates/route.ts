// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Blocked Dates API Route
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schemas
const createBlockedDateSchema = z.object({
  provider_type: z.enum(['sitter', 'groomer', 'trainer']),
  provider_id: z.string().uuid(),
  block_type: z.enum(['time_off', 'vacation', 'holiday', 'sick_leave', 'personal', 'other']),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  title: z.string().optional(),
  reason: z.string().optional(),
  is_recurring_yearly: z.boolean().default(false),
});

const updateBlockedDateSchema = z.object({
  id: z.string().uuid(),
  block_type: z.enum(['time_off', 'vacation', 'holiday', 'sick_leave', 'personal', 'other']).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  title: z.string().optional(),
  reason: z.string().optional(),
  is_recurring_yearly: z.boolean().optional(),
});

// GET /api/calendar/blocked-dates
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
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    if (!providerType || !providerId) {
      return NextResponse.json(
        { error: 'Missing provider_type or provider_id' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('blocked_dates')
      .select('*')
      .eq('provider_type', providerType)
      .eq('provider_id', providerId);

    if (fromDate && toDate) {
      query = query.or(
        `and(start_date.lte.${toDate},end_date.gte.${fromDate})`
      );
    }

    query = query.order('start_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching blocked dates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blocked dates' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/calendar/blocked-dates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/calendar/blocked-dates
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createBlockedDateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Validate date range
    if (new Date(data.start_date) > new Date(data.end_date)) {
      return NextResponse.json(
        { error: 'start_date must be before or equal to end_date' },
        { status: 400 }
      );
    }

    // Validate time range if provided
    if (data.start_time && data.end_time) {
      const startMinutes = parseInt(data.start_time.split(':')[0]) * 60 + parseInt(data.start_time.split(':')[1]);
      const endMinutes = parseInt(data.end_time.split(':')[0]) * 60 + parseInt(data.end_time.split(':')[1]);
      
      if (startMinutes >= endMinutes) {
        return NextResponse.json(
          { error: 'start_time must be before end_time' },
          { status: 400 }
        );
      }
    }

    const { data: blockedDate, error } = await supabase
      .from('blocked_dates')
      .insert({
        provider_type: data.provider_type,
        provider_id: data.provider_id,
        block_type: data.block_type,
        start_date: data.start_date,
        end_date: data.end_date,
        start_time: data.start_time,
        end_time: data.end_time,
        title: data.title,
        reason: data.reason,
        is_recurring_yearly: data.is_recurring_yearly,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blocked date:', error);
      return NextResponse.json(
        { error: 'Failed to create blocked date' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: blockedDate }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/calendar/blocked-dates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/calendar/blocked-dates
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateBlockedDateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validation.data;

    // Get current blocked date to validate date range
    const { data: current } = await supabase
      .from('blocked_dates')
      .select('start_date, end_date, start_time, end_time')
      .eq('id', id)
      .single();

    if (!current) {
      return NextResponse.json(
        { error: 'Blocked date not found' },
        { status: 404 }
      );
    }

    const startDate = updateData.start_date || current.start_date;
    const endDate = updateData.end_date || current.end_date;
    const startTime = updateData.start_time || current.start_time;
    const endTime = updateData.end_time || current.end_time;

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: 'start_date must be before or equal to end_date' },
        { status: 400 }
      );
    }

    // Validate time range if provided
    if (startTime && endTime) {
      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
      
      if (startMinutes >= endMinutes) {
        return NextResponse.json(
          { error: 'start_time must be before end_time' },
          { status: 400 }
        );
      }
    }

    const { data: blockedDate, error } = await supabase
      .from('blocked_dates')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blocked date:', error);
      return NextResponse.json(
        { error: 'Failed to update blocked date' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: blockedDate });
  } catch (error) {
    console.error('Error in PATCH /api/calendar/blocked-dates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar/blocked-dates
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
        { error: 'Missing blocked date id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blocked date:', error);
      return NextResponse.json(
        { error: 'Failed to delete blocked date' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/calendar/blocked-dates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
