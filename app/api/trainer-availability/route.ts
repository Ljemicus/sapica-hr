import { NextResponse } from 'next/server';
import { getTrainerAvailability, setTrainerAvailability, deleteTrainerAvailability } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { TrainerAvailabilitySlot } from '@/lib/types';

type TrainerAvailabilityGetResponse = TrainerAvailabilitySlot[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trainerId = searchParams.get('trainer_id');
  const fromDate = searchParams.get('from_date') || undefined;
  const toDate = searchParams.get('to_date') || undefined;

  if (!trainerId) {
    return NextResponse.json({ error: 'trainer_id is required' }, { status: 400 });
  }

  const slots = await getTrainerAvailability(trainerId, fromDate, toDate);
  return NextResponse.json<TrainerAvailabilityGetResponse>(slots);
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { trainer_id, slots } = body;

    if (!trainer_id || !slots || !Array.isArray(slots)) {
      return NextResponse.json(
        { error: 'trainer_id and slots[] are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const supabase = await createClient();
    const { data: trainer } = await supabase
      .from('trainers')
      .select('id')
      .eq('id', trainer_id)
      .eq('user_id', user.id)
      .single();

    if (!trainer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate slots
    for (const slot of slots) {
      if (!slot.date || !slot.start_time || !slot.end_time) {
        return NextResponse.json(
          { error: 'Each slot must have date, start_time, and end_time' },
          { status: 400 }
        );
      }
    }

    if (slots.length > 200) {
      return NextResponse.json(
        { error: 'Maximum 200 slots per request' },
        { status: 400 }
      );
    }

    const result = await setTrainerAvailability(trainer_id, slots);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { trainer_id, slot_ids } = body;

    if (!trainer_id || !slot_ids || !Array.isArray(slot_ids) || slot_ids.length === 0) {
      return NextResponse.json(
        { error: 'trainer_id and slot_ids[] are required' },
        { status: 400 }
      );
    }

    if (slot_ids.length > 200) {
      return NextResponse.json(
        { error: 'Maximum 200 slot_ids per request' },
        { status: 400 }
      );
    }

    // Verify ownership
    const supabase = await createClient();
    const { data: trainer } = await supabase
      .from('trainers')
      .select('id')
      .eq('id', trainer_id)
      .eq('user_id', user.id)
      .single();

    if (!trainer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ok = await deleteTrainerAvailability(trainer_id, slot_ids);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to delete slots' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
