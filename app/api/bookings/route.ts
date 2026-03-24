import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { bookingSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { sitter_id, pet_id, service_type, start_date, end_date, note } = parsed.data;

  // Get price from sitter profile
  const { data: sitterProfile } = await supabase
    .from('sitter_profiles')
    .select('prices')
    .eq('user_id', sitter_id)
    .single();

  if (!sitterProfile) return NextResponse.json({ error: 'Sitter not found' }, { status: 404 });

  const pricePerDay = sitterProfile.prices[service_type] || 0;
  const start = new Date(start_date);
  const end = new Date(end_date);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const total_price = pricePerDay * days;

  const { data: booking, error } = await supabase.from('bookings').insert({
    owner_id: user.id,
    sitter_id,
    pet_id,
    service_type,
    start_date,
    end_date,
    total_price,
    note: note || null,
    status: 'pending',
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(booking, { status: 201 });
}
