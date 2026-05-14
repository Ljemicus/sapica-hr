import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { createRateLimitResponse, rateLimitRequest, RateLimits } from '@/lib/rate-limiter';
import { updateOwnedBookingRequestStatus } from '@/lib/petpark/booking-requests/db';
import { bookingRequestStatusActionSchema } from '@/lib/petpark/booking-requests/schema';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rateLimit = await rateLimitRequest(request, { ...RateLimits.apiWrite, identifier: 'booking-requests:status' });
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const parsed = bookingRequestStatusActionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({
      status: 400,
      code: 'INVALID_BOOKING_REQUEST_STATUS',
      message: 'Status može biti samo contacted ili closed.',
      details: parsed.error.flatten(),
    });
  }

  const result = await updateOwnedBookingRequestStatus(id, parsed.data.status);
  if (!result.ok) {
    return apiError({ status: result.statusCode, code: result.code, message: result.message });
  }

  return NextResponse.json({ ok: true, data: { id: result.id, status: result.status } });
}
