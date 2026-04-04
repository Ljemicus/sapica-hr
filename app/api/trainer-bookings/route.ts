import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createTrainerBooking } from '@/lib/db';
import { appLogger } from '@/lib/logger';
import { dispatchAlert } from '@/lib/alerting';
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
      appLogger.error('trainerBookings.create', 'DB write returned null', { trainer_id, user_id: user.id, date, start_time });
      dispatchAlert({
        severity: 'P1',
        service: 'trainerBookings.create',
        description: 'Trainer booking creation failed (DB write returned null)',
        value: `trainer=${trainer_id} user=${user.id}`,
        owner: 'bookings',
      }).catch(() => {});
      return NextResponse.json(
        { error: 'Termin je zauzet. Odaberite drugi termin.' },
        { status: 409 }
      );
    }

    return NextResponse.json<TrainerBooking>(booking, { status: 201 });
  } catch (err) {
    appLogger.error('trainerBookings.create', 'unexpected error', { error: String(err) });
    dispatchAlert({
      severity: 'P1',
      service: 'trainerBookings.create',
      description: 'Unhandled error in trainer booking creation',
      value: String(err),
      owner: 'bookings',
    }).catch(() => {});
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
