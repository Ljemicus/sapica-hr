import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getOwnerBookingRequestSummaries } from '@/lib/petpark/booking-requests/read-owner';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Prijavi se za pregled svojih upita.' });

  const requests = await getOwnerBookingRequestSummaries(user.id);
  return NextResponse.json({ ok: true, data: { requests } });
}
