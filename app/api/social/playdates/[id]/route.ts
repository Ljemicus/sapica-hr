import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { PlaydateRequestWithDetails } from '@/lib/types';

// PATCH /api/social/playdates/[id] - Update playdate request status
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

    // Get the playdate request
    const { data: playdateRequest, error: fetchError } = await supabase
      .from('playdate_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !playdateRequest) {
      return NextResponse.json({ error: 'Playdate request not found' }, { status: 404 });
    }

    // Check if user is participant
    if (playdateRequest.requester_user_id !== user.id && playdateRequest.target_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['accepted', 'rejected', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Only target can accept/reject, only requester can cancel
    if (status === 'accepted' || status === 'rejected') {
      if (playdateRequest.target_user_id !== user.id) {
        return NextResponse.json({ error: 'Only the recipient can accept or reject' }, { status: 403 });
      }
    }

    if (status === 'cancelled') {
      if (playdateRequest.requester_user_id !== user.id) {
        return NextResponse.json({ error: 'Only the requester can cancel' }, { status: 403 });
      }
    }

    const { data: updatedRequest, error } = await supabase
      .from('playdate_requests')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        requester_pet:pets!playdate_requests_requester_pet_id_fkey(id, name, species, breed, photo_url),
        target_pet:pets!playdate_requests_target_pet_id_fkey(id, name, species, breed, photo_url),
        requester_user:users!playdate_requests_requester_user_id_fkey(id, name, avatar_url),
        target_user:users!playdate_requests_target_user_id_fkey(id, name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error updating playdate request:', error);
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }

    return NextResponse.json({ request: updatedRequest as PlaydateRequestWithDetails });
  } catch (error) {
    console.error('Error in PATCH /api/social/playdates/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
