import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { appLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const { endpoint, p256dh, auth } = await request.json();

    if (!endpoint || !p256dh || !auth) {
      return apiError({ status: 400, code: 'INVALID_SUBSCRIPTION', message: 'Missing subscription data' });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint,
          p256dh,
          auth,
        },
        { onConflict: 'endpoint' }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    appLogger.error('notifications.subscribe', 'Push subscription error', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return apiError({ status: 500, code: 'SUBSCRIPTION_SAVE_FAILED', message: 'Internal server error' });
  }
}
