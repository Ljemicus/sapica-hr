import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/db/helpers';

export async function POST() {
  if (!isSupabaseConfigured()) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('mock_user_id', '', { path: '/', maxAge: 0 });
    return response;
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
