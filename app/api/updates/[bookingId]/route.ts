import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getBooking, getUpdatesByBooking } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bookingId } = await params;
  const booking = await getBooking(bookingId);

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const canAccess =
    user.role === 'admin' ||
    booking.owner_id === user.id ||
    booking.sitter_id === user.id;

  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updates = await getUpdatesByBooking(bookingId);
  return NextResponse.json(updates);
}
