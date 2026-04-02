import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createGroomerBooking, getUserGroomerBookings } from '@/lib/db';
import { appLogger } from '@/lib/logger';
import type { GroomerBooking } from '@/lib/types';

type GroomerBookingsGetResponse = GroomerBooking[];

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bookings = await getUserGroomerBookings(user.id, 'history-list');
  return NextResponse.json<GroomerBookingsGetResponse>(bookings);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { groomer_id, service, date, start_time, end_time, price, pet_name, pet_type, note } = body;

    if (!groomer_id || !service || !date || !start_time || !end_time || !price) {
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

    const booking = await createGroomerBooking({
      groomer_id,
      user_id: user.id,
      service,
      date,
      start_time,
      end_time,
      price,
      status: 'pending',
      pet_name: pet_name || null,
      pet_type: pet_type || null,
      note: note || null,
    });

    if (!booking) {
      appLogger.warn('groomerBookings.create', 'slot conflict', { groomer_id, date, start_time });
      return NextResponse.json(
        { error: 'Termin je zauzet. Odaberite drugi termin.' },
        { status: 409 }
      );
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    appLogger.error('groomerBookings.create', 'unexpected error', { error: String(err) });
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
