import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/db/helpers';

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase nije konfiguriran.' }, { status: 503 });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
