import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { PlaydateRequestWithDetails } from '@/lib/types';

// GET /api/social/playdates - Get playdate requests for current user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'sent' or 'received'

    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('playdate_requests')
      .select(`
        *,
        requester_pet:pets(id, name, species, breed, photo_url),
        target_pet:pets(id, name, species, breed, photo_url),
        requester_user:users!playdate_requests_requester_user_id_fkey(id, name, avatar_url),
        target_user:users!playdate_requests_target_user_id_fkey(id, name, avatar_url)
      `);

    if (type === 'sent') {
      query = query.eq('requester_user_id', user.id);
    } else if (type === 'received') {
      query = query.eq('target_user_id', user.id);
    } else {
      query = query.or(`requester_user_id.eq.${user.id},target_user_id.eq.${user.id}`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching playdate requests:', error);
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }

    return NextResponse.json({ requests: requests as PlaydateRequestWithDetails[] });
  } catch (error) {
    console.error('Error in GET /api/social/playdates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/social/playdates - Create a playdate request
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetPetId, requesterPetId, message, proposedDate, proposedLocation } = body;

    if (!targetPetId || !requesterPetId) {
      return NextResponse.json({ error: 'Target pet and requester pet are required' }, { status: 400 });
    }

    // Get target pet owner
    const { data: targetPet, error: petError } = await supabase
      .from('pets')
      .select('owner_id')
      .eq('id', targetPetId)
      .single();

    if (petError || !targetPet) {
      return NextResponse.json({ error: 'Target pet not found' }, { status: 404 });
    }

    // Cannot request playdate with own pet
    if (targetPet.owner_id === user.id) {
      return NextResponse.json({ error: 'Cannot request playdate with your own pet' }, { status: 400 });
    }

    const { data: playdateRequest, error } = await supabase
      .from('playdate_requests')
      .insert({
        requester_pet_id: requesterPetId,
        target_pet_id: targetPetId,
        requester_user_id: user.id,
        target_user_id: targetPet.owner_id,
        message: message || null,
        proposed_date: proposedDate || null,
        proposed_location: proposedLocation || null,
      })
      .select(`
        *,
        requester_pet:pets!playdate_requests_requester_pet_id_fkey(id, name, species, breed, photo_url),
        target_pet:pets!playdate_requests_target_pet_id_fkey(id, name, species, breed, photo_url),
        requester_user:users!playdate_requests_requester_user_id_fkey(id, name, avatar_url),
        target_user:users!playdate_requests_target_user_id_fkey(id, name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating playdate request:', error);
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }

    return NextResponse.json({ request: playdateRequest as PlaydateRequestWithDetails }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/social/playdates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
