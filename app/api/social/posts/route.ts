import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit, RateLimits, getClientIdentifier } from '@/lib/upstash-rate-limit';
import { sanitizeRichText } from '@/lib/sanitize';
import type { SocialPost, SocialPostWithDetails } from '@/lib/types';

// GET /api/social/posts - Get feed posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const petId = searchParams.get('petId');
    const userId = searchParams.get('userId');
    const challengeId = searchParams.get('challengeId');

    const supabase = await createClient();

    let query = supabase
      .from('social_posts')
      .select(`
        *,
        user:users(id, name, avatar_url),
        pet:pets(id, name, species, breed, photo_url)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (petId) {
      query = query.eq('pet_id', petId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (challengeId) {
      query = query.eq('challenge_id', challengeId);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    return NextResponse.json({ posts: posts as SocialPostWithDetails[] });
  } catch (error) {
    console.error('Error in GET /api/social/posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/social/posts - Create a new post
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const ip = getClientIdentifier(request);
    const rateLimitResult = await checkRateLimit(`${ip}:${user.id}`, RateLimits.socialPosts);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { content, mediaUrls, petId, aiTags, aiCaption, challengeId } = body;
    
    // Sanitize content
    content = sanitizeRichText(content);

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const postData = {
      user_id: user.id,
      content: content.trim(),
      media_urls: mediaUrls || [],
      pet_id: petId || null,
      ai_tags: aiTags || [],
      ai_caption: aiCaption || null,
      challenge_id: challengeId || null,
      is_challenge_entry: !!challengeId,
    };

    const { data: post, error } = await supabase
      .from('social_posts')
      .insert(postData)
      .select(`
        *,
        user:users(id, name, avatar_url),
        pet:pets(id, name, species, breed, photo_url)
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    // If this is a challenge entry, create the entry record
    if (challengeId) {
      const { error: entryError } = await supabase
        .from('challenge_entries')
        .insert({
          challenge_id: challengeId,
          post_id: post.id,
        });
      
      // Ignore duplicate entry errors
      if (entryError && !entryError.message.includes('duplicate')) {
        console.error('Error creating challenge entry:', entryError);
      }
    }

    return NextResponse.json({ post: post as SocialPostWithDetails }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/social/posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
