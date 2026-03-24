import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const service = searchParams.get('service');
  const minRating = searchParams.get('min_rating');

  const supabase = await createClient();

  let query = supabase
    .from('sitter_profiles')
    .select('*, user:users!sitter_profiles_user_id_fkey(id, name, email, avatar_url, city)');

  if (city) query = query.eq('city', city);
  if (service) query = query.contains('services', [service]);
  if (minRating) query = query.gte('rating_avg', parseFloat(minRating));

  query = query.order('rating_avg', { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
