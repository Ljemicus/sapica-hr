import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { ReactionType } from '@/lib/types/social';

const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '❤️',
  paw: '🐾',
  laugh: '😂',
  wow: '😮',
  love: '🥰',
};

const VALID_REACTIONS: ReactionType[] = ['like', 'paw', 'laugh', 'wow', 'love'];

// POST /api/social/reactions - Add or update reaction
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, reactionType } = body;

    if (!postId || !reactionType) {
      return NextResponse.json({ error: 'Post ID and reaction type are required' }, { status: 400 });
    }

    if (!VALID_REACTIONS.includes(reactionType as ReactionType)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    // Check if reaction already exists
    const { data: existingReaction, error: checkError } = await supabase
      .from('social_reactions')
      .select('id, reaction_type')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking reaction:', checkError);
      return NextResponse.json({ error: 'Failed to check reaction status' }, { status: 500 });
    }

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Same reaction clicked - remove it (toggle off)
        const { error: deleteError } = await supabase
          .from('social_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) {
          console.error('Error removing reaction:', deleteError);
          return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
        }

        return NextResponse.json({ reaction: null });
      } else {
        // Different reaction - update it
        const { error: updateError } = await supabase
          .from('social_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id);

        if (updateError) {
          console.error('Error updating reaction:', updateError);
          return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 });
        }

        return NextResponse.json({ reaction: reactionType, emoji: REACTION_EMOJIS[reactionType as ReactionType] });
      }
    } else {
      // New reaction
      const { error: insertError } = await supabase
        .from('social_reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType,
        });

      if (insertError) {
        console.error('Error adding reaction:', insertError);
        return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
      }

      return NextResponse.json({ reaction: reactionType, emoji: REACTION_EMOJIS[reactionType as ReactionType] });
    }
  } catch (error) {
    console.error('Error in POST /api/social/reactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/social/reactions - Get user's reactions for posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postIds = searchParams.get('postIds')?.split(',') || [];

    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ reactions: {} });
    }

    if (postIds.length === 0) {
      return NextResponse.json({ reactions: {} });
    }

    const { data: reactions, error } = await supabase
      .from('social_reactions')
      .select('post_id, reaction_type')
      .eq('user_id', user.id)
      .in('post_id', postIds);

    if (error) {
      console.error('Error fetching reactions:', error);
      return NextResponse.json({ reactions: {} });
    }

    const reactionMap: Record<string, ReactionType> = {};
    reactions?.forEach(r => {
      reactionMap[r.post_id] = r.reaction_type;
    });

    return NextResponse.json({ reactions: reactionMap });
  } catch (error) {
    console.error('Error in GET /api/social/reactions:', error);
    return NextResponse.json({ reactions: {} });
  }
}
