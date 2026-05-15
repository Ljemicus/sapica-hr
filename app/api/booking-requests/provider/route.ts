import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getOwnedBookingRequestSummaries } from '@/lib/petpark/booking-requests/db';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Prijavi se za pregled upita za svoje usluge.' });

  const requests = await getOwnedBookingRequestSummaries();
  return NextResponse.json({ ok: true, data: { requests } });
}
