import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getReviews, getReviewsBySitter, getBooking, createReview } from '@/lib/db';
import { reviewSchema } from '@/lib/validations';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sitterId = searchParams.get('sitter_id');

  if (sitterId) {
    const reviews = await getReviewsBySitter(sitterId);
    return NextResponse.json(reviews);
  }

  const reviews = await getReviews();
  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const booking = await getBooking(parsed.data.booking_id);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (booking.status !== 'completed') return NextResponse.json({ error: 'Booking not completed' }, { status: 400 });
  if (booking.owner_id !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const review = await createReview({
    booking_id: parsed.data.booking_id,
    reviewer_id: user.id,
    reviewee_id: booking.sitter_id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });

  if (!review) return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  return NextResponse.json(review, { status: 201 });
}
