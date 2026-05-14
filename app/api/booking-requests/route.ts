import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getPublicServiceListingBySlug } from '@/lib/db/service-listings';
import { createRateLimitResponse, rateLimitRequest, RateLimits } from '@/lib/rate-limiter';
import { createBookingRequest } from '@/lib/petpark/booking-requests/db';
import { bookingRequestInputSchema } from '@/lib/petpark/booking-requests/schema';

export async function POST(request: Request) {
  const rateLimit = await rateLimitRequest(request, { ...RateLimits.apiWrite, identifier: 'booking-requests:create' });
  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const parsed = bookingRequestInputSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({
      status: 400,
      code: 'INVALID_BOOKING_REQUEST',
      message: 'Provjeri podatke prije slanja upita.',
      details: parsed.error.flatten(),
    });
  }

  const service = await getPublicServiceListingBySlug(parsed.data.providerSlug);
  if (!service) {
    return apiError({ status: 404, code: 'SERVICE_LISTING_NOT_FOUND', message: 'Usluga nije dostupna za upit.' });
  }

  const bookingRequest = await createBookingRequest({
    ...parsed.data,
    providerSlug: service.slug,
    providerName: service.provider,
    providerCity: service.location.split(',').pop()?.trim() || service.location,
    providerDistrict: service.location.includes(',') ? service.location.split(',')[0]?.trim() : '',
    serviceLabel: service.title,
    priceSnapshot: service.price,
    responseTimeSnapshot: service.responseTime,
  });
  if (!bookingRequest) {
    return apiError({ status: 500, code: 'BOOKING_REQUEST_CREATE_FAILED', message: 'Upit trenutno nije moguće poslati.' });
  }

  return NextResponse.json({ ok: true, data: { id: bookingRequest.id, status: bookingRequest.status } }, { status: 201 });
}
