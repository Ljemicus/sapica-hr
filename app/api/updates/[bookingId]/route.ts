import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getUpdatesByBooking } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  const updates = await getUpdatesByBooking(bookingId);
  return NextResponse.json(updates);
}
