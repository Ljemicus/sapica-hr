import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { createRateLimitResponse, rateLimitRequest, RateLimits } from '@/lib/rate-limiter';
import { markNotificationRead } from '@/lib/petpark/booking-requests/activity';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rateLimit = await rateLimitRequest(request, { ...RateLimits.apiWrite, identifier: 'notifications:read' });
  if (!rateLimit.success) return createRateLimitResponse(rateLimit);

  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Prijavi se za označavanje obavijesti.' });

  const ok = await markNotificationRead(id, user.id);
  if (!ok) return apiError({ status: 404, code: 'NOTIFICATION_NOT_FOUND', message: 'Obavijest nije pronađena.' });

  return NextResponse.json({ ok: true, data: { id, read: true } });
}
