import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

// GET /api/contests/[id]/entries — list entries
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'votes'; // votes | newest

    const supabase = await createClient();

    let query = supabase
      .from('contest_entries')
      .select('*, user:users(id, name, avatar_url), pet:pets(id, name, species)')
      .eq('contest_id', id)
      .eq('is_approved', true)
      .eq('is_disqualified', false);

    if (sort === 'votes') {
      query = query.order('votes_count', { ascending: false });
    } else {
      query = query.order('submitted_at', { ascending: false });
    }

    const { data: entries, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/contests/[id]/entries — submit entry
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
    const body = await request.json();
    const supabase = await createClient();

    // Check contest is active
    const { data: contest } = await supabase
      .from('photo_contests')
      .select('status, max_entries_per_user')
      .eq('id', id)
      .single();

    if (!contest || contest.status !== 'active') {
      return NextResponse.json({ error: 'Contest not active' }, { status: 400 });
    }

    // Check user's entry count
    const { count } = await supabase
      .from('contest_entries')
      .select('*', { count: 'exact', head: true })
      .eq('contest_id', id)
      .eq('user_id', user.id);

    if (count && count >= contest.max_entries_per_user) {
      return NextResponse.json({ error: 'Max entries reached' }, { status: 400 });
    }

    const { data: entry, error } = await supabase
      .from('contest_entries')
      .insert({
        contest_id: id,
        user_id: user.id,
        ...body,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to submit entry' }, { status: 500 });
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
