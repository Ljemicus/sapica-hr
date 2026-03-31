import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { userId, verified } = (body || {}) as { userId?: string; verified?: boolean };
  if (!userId || typeof verified !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('sitter_profiles').update({ verified }).eq('user_id', userId);
  if (error) return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 });
  return NextResponse.json({ success: true });
}
