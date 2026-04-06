import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError } from '@/lib/api-errors';

/**
 * POST /api/push/subscribe
 * Save a push subscription for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return apiError({ 
        status: 400, 
        code: 'INVALID_SUBSCRIPTION', 
        message: 'Invalid push subscription data' 
      });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      }, { onConflict: 'endpoint' });

    if (error) {
      return apiError({ 
        status: 500, 
        code: 'SUBSCRIPTION_SAVE_FAILED', 
        message: 'Failed to save push subscription' 
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return apiError({ 
      status: 500, 
      code: 'INTERNAL_ERROR', 
      message: 'Internal server error' 
    });
  }
}

/**
 * DELETE /api/push/subscribe
 * Remove a push subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (endpoint) {
      // Delete specific endpoint
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint)
        .eq('user_id', user.id);
    } else {
      // Delete all user subscriptions
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return apiError({ 
      status: 500, 
      code: 'INTERNAL_ERROR', 
      message: 'Internal server error' 
    });
  }
}
