import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { PetOfTheWeekWithDetails } from '@/lib/types';

// GET /api/social/pet-of-week - Get current and past pets of the week
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentOnly = searchParams.get('current') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = await createClient();

    let query = supabase
      .from('pet_of_the_week')
      .select(`
        *,
        pet:pets(id, name, species, breed, photo_url),
        post:social_posts(id, content, media_urls)
      `)
      .order('week_start', { ascending: false })
      .limit(limit);

    if (currentOnly) {
      const now = new Date().toISOString();
      query = query.lte('week_start', now).gte('week_end', now);
    }

    const { data: petsOfWeek, error } = await query;

    if (error) {
      console.error('Error fetching pets of the week:', error);
      return NextResponse.json({ error: 'Failed to fetch pets of the week' }, { status: 500 });
    }

    return NextResponse.json({ petsOfWeek: petsOfWeek as PetOfTheWeekWithDetails[] });
  } catch (error) {
    console.error('Error in GET /api/social/pet-of-week:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/social/pet-of-week - Create a new pet of the week (admin only)
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
    const { petId, postId, weekStart, weekEnd, votesCount } = body;

    if (!petId || !weekStart || !weekEnd) {
      return NextResponse.json({ error: 'Pet ID, week start, and week end are required' }, { status: 400 });
    }

    const { data: petOfWeek, error } = await supabase
      .from('pet_of_the_week')
      .insert({
        pet_id: petId,
        post_id: postId || null,
        week_start: weekStart,
        week_end: weekEnd,
        votes_count: votesCount || 0,
      })
      .select(`
        *,
        pet:pets(id, name, species, breed, photo_url),
        post:social_posts(id, content, media_urls)
      `)
      .single();

    if (error) {
      console.error('Error creating pet of the week:', error);
      return NextResponse.json({ error: 'Failed to create pet of the week' }, { status: 500 });
    }

    return NextResponse.json({ petOfWeek: petOfWeek as PetOfTheWeekWithDetails }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/social/pet-of-week:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
