import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { SocialCommentWithUser } from '@/lib/types';

// GET /api/social/comments - Get comments for a post
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from('social_comments')
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json({ comments: comments as SocialCommentWithUser[] });
  } catch (error) {
    console.error('Error in GET /api/social/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/social/comments - Create a comment
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, content } = body;

    if (!postId || !content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Post ID and content are required' }, { status: 400 });
    }

    const { data: comment, error } = await supabase
      .from('social_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      })
      .select(`
        *,
        user:users(id, name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json({ comment: comment as SocialCommentWithUser }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/social/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
