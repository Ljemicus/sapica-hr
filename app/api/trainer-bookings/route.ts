import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createTrainerBooking } from '@/lib/db';
import { appLogger } from '@/lib/logger';
import type { TrainerBooking } from '@/lib/types';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { trainer_id, program_id, date, start_time, end_time, pet_name, note } = body;

    if (!trainer_id || !date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(bookingDate.getTime()) || bookingDate < today) {
      return NextResponse.json(
        { error: 'Datum termina ne može biti u prošlosti.' },
        { status: 400 }
      );
    }

    const booking = await createTrainerBooking({
      trainer_id,
      user_id: user.id,
      program_id: program_id || null,
      date,
      start_time,
      end_time,
      status: 'pending',
      pet_name: pet_name || null,
      note: note || null,
    });

    if (!booking) {
      appLogger.warn('trainerBookings.create', 'slot conflict', { trainer_id, date, start_time });
      return NextResponse.json(
        { error: 'Termin je zauzet. Odaberite drugi termin.' },
        { status: 409 }
      );
    }

    return NextResponse.json<TrainerBooking>(booking, { status: 201 });
  } catch (err) {
    appLogger.error('trainerBookings.create', 'unexpected error', { error: String(err) });
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
