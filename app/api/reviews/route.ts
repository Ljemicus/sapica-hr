import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getReviews, getReviewsBySitter, getBooking, createReview } from '@/lib/db';
import { reviewSchema } from '@/lib/validations';
import type { Review } from '@/lib/types';

type ReviewsGetResponse = Review[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sitterId = searchParams.get('sitter_id');

  if (sitterId) {
    const reviews = await getReviewsBySitter(sitterId);
    return NextResponse.json<ReviewsGetResponse>(reviews);
  }

  const reviews = await getReviews();
  return NextResponse.json<ReviewsGetResponse>(reviews);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravan review payload.', details: parsed.error.flatten() });

  const booking = await getBooking(parsed.data.booking_id);
  if (!booking) return apiError({ status: 404, code: 'BOOKING_NOT_FOUND', message: 'Booking not found' });
  if (booking.status !== 'completed') return apiError({ status: 400, code: 'BOOKING_NOT_COMPLETED', message: 'Booking not completed' });
  if (booking.owner_id !== user.id) return apiError({ status: 403, code: 'FORBIDDEN', message: 'Not authorized' });

  const review = await createReview({
    booking_id: parsed.data.booking_id,
    reviewer_id: user.id,
    reviewee_id: booking.sitter?.id || '',
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });

  if (!review) return apiError({ status: 500, code: 'REVIEW_CREATE_FAILED', message: 'Failed to create review' });
  return NextResponse.json(review, { status: 201 });
}
