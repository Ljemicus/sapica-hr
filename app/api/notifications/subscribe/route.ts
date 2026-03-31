import { NextRequest, NextResponse } from 'next/server';
import { appLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, p256dh, auth } = await request.json();

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Missing subscription data' }, { status: 400 });
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
