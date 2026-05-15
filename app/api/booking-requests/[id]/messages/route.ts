import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { createRateLimitResponse, rateLimitRequest, RateLimits } from '@/lib/rate-limiter';
import { createBookingRequestMessage, getBookingRequestMessages } from '@/lib/petpark/booking-requests/conversation';

const messageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Prijavi se za pregled razgovora.' });

  const { id } = await params;
  const result = await getBookingRequestMessages(id, user.id, user.role);
  if (!result.ok) return apiError({ status: result.statusCode, code: result.code, message: result.message });

  return NextResponse.json({ ok: true, data: { role: result.role, messages: result.messages } });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Prijavi se za slanje poruke.' });

  const rateLimit = await rateLimitRequest(request, { ...RateLimits.messages, identifier: 'booking-request-messages' }, user.id);
  if (!rateLimit.success) return createRateLimitResponse(rateLimit);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'INVALID_MESSAGE', message: 'Poruka mora imati 1 do 2000 znakova.', details: parsed.error.flatten() });
  }

  const { id } = await params;
  const result = await createBookingRequestMessage({ requestId: id, profileId: user.id, userRole: user.role, body: parsed.data.body });
  if (!result.ok) return apiError({ status: result.statusCode, code: result.code, message: result.message });

  return NextResponse.json({ ok: true, data: { message: result.message } }, { status: 201 });
}
