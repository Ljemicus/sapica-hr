import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { petSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = petSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: pet, error } = await supabase.from('pets').insert({
    owner_id: user.id,
    ...parsed.data,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(pet, { status: 201 });
}
