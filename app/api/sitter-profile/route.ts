import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { sitterProfileSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'sitter') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = sitterProfileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createClient();
  const data = {
    bio: parsed.data.bio,
    experience_years: parsed.data.experience_years,
    services: parsed.data.services,
    prices: parsed.data.prices,
    city: parsed.data.city,
    user_id: user.id,
  };

  const { data: existing } = await supabase.from('sitter_profiles').select('user_id').eq('user_id', user.id).maybeSingle();
  const query = existing
    ? supabase.from('sitter_profiles').update(data).eq('user_id', user.id)
    : supabase.from('sitter_profiles').insert(data);

  const { error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  return NextResponse.json({ success: true });
}
