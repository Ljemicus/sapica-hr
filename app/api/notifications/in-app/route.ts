import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getNotificationsForProfile } from '@/lib/petpark/booking-requests/activity';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Prijavi se za pregled obavijesti.' });

  const notifications = await getNotificationsForProfile(user.id);
  return NextResponse.json({ ok: true, data: { notifications } });
}
