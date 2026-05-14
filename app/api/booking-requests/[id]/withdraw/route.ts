import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { createRateLimitResponse, rateLimitRequest, RateLimits } from '@/lib/rate-limiter';
import { withdrawOwnedBookingRequest } from '@/lib/petpark/booking-requests/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rateLimit = await rateLimitRequest(request, { ...RateLimits.apiWrite, identifier: 'booking-requests:withdraw' });
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  const result = await withdrawOwnedBookingRequest(id);
  if (!result.ok) {
    return apiError({ status: result.statusCode, code: result.code, message: result.message });
  }

  return NextResponse.json({ ok: true, data: { id: result.id, status: result.status } });
}
