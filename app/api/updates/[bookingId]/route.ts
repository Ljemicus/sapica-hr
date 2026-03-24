import { NextResponse } from 'next/server';
import { getUpdatesForBooking } from '@/lib/mock-data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  const updates = getUpdatesForBooking(bookingId);
  return NextResponse.json(updates);
}
