import { NextResponse } from 'next/server';
import { getMockUser } from '@/lib/mock-auth';
import { mockReviews, mockBookings, mockUsers } from '@/lib/mock-data';
import { reviewSchema } from '@/lib/validations';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sitterId = searchParams.get('sitter_id');

  if (sitterId) {
    const reviews = mockReviews.filter(r => r.reviewee_id === sitterId);
    return NextResponse.json(reviews);
  }

  return NextResponse.json(mockReviews);
}

export async function POST(request: Request) {
  const user = await getMockUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const booking = mockBookings.find(b => b.id === parsed.data.booking_id);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (booking.status !== 'completed') return NextResponse.json({ error: 'Booking not completed' }, { status: 400 });
  if (booking.owner_id !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const reviewer = mockUsers.find(u => u.id === user.id)!;

  const review = {
    id: `rev-mock-${Date.now()}`,
    booking_id: parsed.data.booking_id,
    reviewer_id: user.id,
    reviewee_id: booking.sitter_id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    created_at: new Date().toISOString(),
    reviewer,
    booking,
  };

  mockReviews.push(review);
  return NextResponse.json(review, { status: 201 });
}
