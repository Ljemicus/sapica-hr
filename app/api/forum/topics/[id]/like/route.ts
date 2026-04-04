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

  // Get current likes
  const { data: topic, error } = await supabase
    .from('forum_topics')
    .select('likes')
    .eq('id', id)
    .single();

  if (error || !topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  // Simple increment (no dedup — a proper likes table would handle toggling)
  const { data: updated, error: updateError } = await supabase
    .from('forum_topics')
    .update({ likes: (topic.likes ?? 0) + 1 })
    .eq('id', id)
    .select('likes')
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: 'Failed to like topic' }, { status: 500 });
  }

  return NextResponse.json({ likes: updated.likes });
}
