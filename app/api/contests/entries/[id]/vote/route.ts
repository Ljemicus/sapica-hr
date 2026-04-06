import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

// POST /api/contests/entries/[id]/vote — vote on entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    // Check if contest is in voting phase
    const { data: entry } = await supabase
      .from('contest_entries')
      .select('contest_id')
      .eq('id', id)
      .single();

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Get contest status separately
    const { data: contest } = await supabase
      .from('photo_contests')
      .select('status')
      .eq('id', entry.contest_id)
      .single();

    if (!contest || !['active', 'voting'].includes(contest.status)) {
      return NextResponse.json({ error: 'Voting not allowed' }, { status: 400 });
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('contest_votes')
      .select('id')
      .eq('entry_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    // Create vote
    const { error: voteError } = await supabase
      .from('contest_votes')
      .insert({ entry_id: id, user_id: user.id });

    if (voteError) {
      return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }

    // Update vote count
    const { error: updateError } = await supabase.rpc('increment_vote_count', {
      entry_id: id,
    });

    if (updateError) {
      // Fallback: direct update
      await supabase
        .from('contest_entries')
        .update({ votes_count: supabase.rpc('increment', { x: 1 }) })
        .eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
