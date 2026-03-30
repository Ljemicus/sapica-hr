import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getBookings, createBooking, getSitter } from '@/lib/db';
import { bookingSchema } from '@/lib/validations';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = user.role === 'sitter' ? 'sitter' : 'owner';
  const bookings = await getBookings(user.id, role);
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { sitter_id, pet_id, service_type, start_date, end_date, note } = parsed.data;

  const sitterProfile = await getSitter(sitter_id);
  if (!sitterProfile) return NextResponse.json({ error: 'Sitter not found' }, { status: 404 });

  const pricePerDay = sitterProfile.prices[service_type as keyof typeof sitterProfile.prices] || 0;
  const start = new Date(start_date);
  const end = new Date(end_date);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const total_price = pricePerDay * days;

  const booking = await createBooking({
    owner_id: user.id,
    sitter_id,
    pet_id,
    service_type,
    start_date,
    end_date,
    total_price,
    note: note || null,
    status: 'pending',
  });

  if (!booking) return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  return NextResponse.json(booking, { status: 201 });
}
