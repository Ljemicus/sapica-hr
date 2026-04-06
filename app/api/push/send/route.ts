import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError } from '@/lib/api-errors';
import { sendPushToMultiple, type NotificationPayload } from '@/lib/push-notifications';
import { appLogger } from '@/lib/logger';
import { canSendNotification } from '@/lib/db/notifications';

interface SendPushRequest {
  userIds: string[];
  payload: NotificationPayload;
}

/**
 * POST /api/push/send
 * Send push notifications to specific users (admin/service only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    // Check if user is admin or has service role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return apiError({ status: 403, code: 'FORBIDDEN', message: 'Insufficient permissions' });
    }

    const body: SendPushRequest = await request.json();
    const { userIds, payload } = body;

    if (!userIds?.length || !payload) {
      return apiError({ 
        status: 400, 
        code: 'INVALID_REQUEST', 
        message: 'Missing userIds or payload' 
      });
    }

    // Get all push subscriptions for the specified users
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, user_id')
      .in('user_id', userIds);

    if (error || !subscriptions?.length) {
      return NextResponse.json({ 
        success: true, 
        sent: 0, 
        message: 'No active subscriptions found' 
      });
    }

    // Filter out users who have disabled push notifications
    const enabledUserIds = await Promise.all(
      userIds.map(async (userId) => {
        const canSend = await canSendNotification(userId, 'push');
        return canSend ? userId : null;
      })
    );
    
    const allowedUserIds = enabledUserIds.filter((id): id is string => id !== null);
    
    const filteredSubscriptions = subscriptions.filter(
      sub => allowedUserIds.includes(sub.user_id)
    );

    if (!filteredSubscriptions.length) {
      return NextResponse.json({ 
        success: true, 
        sent: 0, 
        message: 'All users have push notifications disabled' 
      });
    }

    // Send notifications
    const results = await sendPushToMultiple(
      filteredSubscriptions.map(sub => ({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      })),
      payload
    );

    // Clean up expired subscriptions
    if (results.expired.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', results.expired);
      
      appLogger.info('push', 'Cleaned up expired subscriptions', { count: results.expired.length });
    }

    return NextResponse.json({
      success: true,
      sent: results.success.length,
      expired: results.expired.length,
      failed: results.failed.length,
    });
  } catch (error) {
    appLogger.error('push', 'Failed to send push notifications', { error: String(error) });
    return apiError({ 
      status: 500, 
      code: 'INTERNAL_ERROR', 
      message: 'Failed to send push notifications' 
    });
  }
}
