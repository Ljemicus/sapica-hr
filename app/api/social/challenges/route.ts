import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { SocialChallenge, ChallengeEntryWithDetails } from '@/lib/types';

// GET /api/social/challenges - Get all challenges
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const featuredOnly = searchParams.get('featured') === 'true';

    const supabase = await createClient();

    let query = supabase
      .from('social_challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true).gte('end_date', new Date().toISOString());
    }

    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }

    const { data: challenges, error } = await query;

    if (error) {
      console.error('Error fetching challenges:', error);
      return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }

    return NextResponse.json({ challenges: challenges as SocialChallenge[] });
  } catch (error) {
    console.error('Error in GET /api/social/challenges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/social/challenges - Create a new challenge (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, imageUrl, startDate, endDate, prizeDescription, isFeatured } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: 'Title, start date, and end date are required' }, { status: 400 });
    }

    const { data: challenge, error } = await supabase
      .from('social_challenges')
      .insert({
        title,
        description,
        image_url: imageUrl,
        start_date: startDate,
        end_date: endDate,
        prize_description: prizeDescription,
        is_featured: isFeatured || false,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating challenge:', error);
      return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }

    return NextResponse.json({ challenge: challenge as SocialChallenge }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/social/challenges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
