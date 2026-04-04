import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    targetType?: 'topic' | 'comment';
    targetId?: string;
    action?: 'hide' | 'unhide' | 'lock' | 'unlock';
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { targetType, targetId, action } = body;
  if (!targetType || !targetId || !action) {
    return NextResponse.json({ error: 'targetType, targetId and action are required' }, { status: 400 });
  }

  const supabase = await createClient();

  if (targetType === 'topic') {
    const patch = action === 'hide'
      ? { status: 'hidden' }
      : action === 'unhide'
        ? { status: 'active' }
        : action === 'lock'
          ? { status: 'locked' }
          : { status: 'active' };

    const { data, error } = await supabase
      .from('forum_topics')
      .update(patch)
      .eq('id', targetId)
      .select('id, status')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to moderate topic' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, targetType, targetId, status: data.status });
  }

  const patch = action === 'hide' ? { status: 'hidden' } : { status: 'active' };
  const { data, error } = await supabase
    .from('forum_comments')
    .update(patch)
    .eq('id', targetId)
    .select('id, status')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to moderate comment' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, targetType, targetId, status: data.status });
}
