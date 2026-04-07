import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { ChallengeEntryWithDetails } from '@/lib/types';

// GET /api/social/challenges/[id]/entries - Get entries for a challenge
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sort') || 'votes'; // 'votes' or 'newest'

    const supabase = await createClient();

    let query = supabase
      .from('challenge_entries')
      .select(`
        *,
        post:social_posts(
          *,
          user:users(id, name, avatar_url),
          pet:pets(id, name, species, breed, photo_url)
        )
      `)
      .eq('challenge_id', id);

    if (sortBy === 'votes') {
      query = query.order('votes_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: entries, error } = await query;

    if (error) {
      console.error('Error fetching challenge entries:', error);
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    return NextResponse.json({ entries: entries as ChallengeEntryWithDetails[] });
  } catch (error) {
    console.error('Error in GET /api/social/challenges/[id]/entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/social/challenges/[id]/vote - Vote for an entry
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryId } = body;

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // Check if vote already exists
    const { data: existingVote, error: checkError } = await supabase
      .from('challenge_votes')
      .select('id')
      .eq('entry_id', entryId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking vote:', checkError);
      return NextResponse.json({ error: 'Failed to check vote status' }, { status: 500 });
    }

    if (existingVote) {
      // Remove vote
      const { error: deleteError } = await supabase
        .from('challenge_votes')
        .delete()
        .eq('id', existingVote.id);

      if (deleteError) {
        console.error('Error removing vote:', deleteError);
        return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
      }

      return NextResponse.json({ voted: false });
    } else {
      // Add vote
      const { error: insertError } = await supabase
        .from('challenge_votes')
        .insert({
          entry_id: entryId,
          user_id: user.id,
        });

      if (insertError) {
        console.error('Error adding vote:', insertError);
        return NextResponse.json({ error: 'Failed to add vote' }, { status: 500 });
      }

      return NextResponse.json({ voted: true });
    }
  } catch (error) {
    console.error('Error in POST /api/social/challenges/[id]/vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
