import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: comment, error } = await supabase
    .from('forum_comments')
    .select('likes')
    .eq('id', id)
    .single();

  if (error || !comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  const { data: updated, error: updateError } = await supabase
    .from('forum_comments')
    .update({ likes: (comment.likes ?? 0) + 1 })
    .eq('id', id)
    .select('likes')
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: 'Failed to like comment' }, { status: 500 });
  }

  return NextResponse.json({ likes: updated.likes });
}
