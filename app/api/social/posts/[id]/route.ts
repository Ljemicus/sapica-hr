import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// DELETE /api/social/posts/[id] - Delete a post
export async function DELETE(
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

    // Check if user owns the post
    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the post (cascade will handle likes and comments)
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/social/posts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/social/posts/[id] - Update a post
export async function PATCH(
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

    // Check if user owns the post
    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { content, mediaUrls } = body;

    const updateData: Record<string, unknown> = {};
    if (content !== undefined) updateData.content = content;
    if (mediaUrls !== undefined) updateData.media_urls = mediaUrls;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedPost, error } = await supabase
      .from('social_posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:users(id, name, avatar_url),
        pet:pets(id, name, species, breed, photo_url)
      `)
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error('Error in PATCH /api/social/posts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
