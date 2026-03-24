import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { messageSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: message, error } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: parsed.data.receiver_id,
    booking_id: parsed.data.booking_id || null,
    content: parsed.data.content,
    read: false,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(message, { status: 201 });
}
