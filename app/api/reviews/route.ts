import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reviewSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Get the booking to find the sitter
  const { data: booking } = await supabase
    .from('bookings')
    .select('sitter_id, owner_id, status')
    .eq('id', parsed.data.booking_id)
    .single();

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (booking.status !== 'completed') return NextResponse.json({ error: 'Booking not completed' }, { status: 400 });
  if (booking.owner_id !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

  const { data: review, error } = await supabase.from('reviews').insert({
    booking_id: parsed.data.booking_id,
    reviewer_id: user.id,
    reviewee_id: booking.sitter_id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(review, { status: 201 });
}
