import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { dates, available } = body;

  if (!Array.isArray(dates)) {
    return NextResponse.json({ error: 'dates must be an array' }, { status: 400 });
  }

  const records = dates.map((date: string) => ({
    sitter_id: user.id,
    date,
    available: available ?? true,
  }));

  const { error } = await supabase.from('availability').upsert(records, {
    onConflict: 'sitter_id,date',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sitterId = searchParams.get('sitter_id');
  if (!sitterId) return NextResponse.json({ error: 'sitter_id required' }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('sitter_id', sitterId)
    .eq('available', true)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
