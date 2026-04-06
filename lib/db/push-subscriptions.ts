import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { PushSubscriptionData } from '@/lib/push-client';

/**
 * Save push subscription to database
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionData
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        { onConflict: 'endpoint' }
      );

    if (error) {
      console.error('Failed to save push subscription:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return false;
  }
}

/**
 * Get all push subscriptions for a user
 */
export async function getUserPushSubscriptions(
  userId: string
): Promise<Array<{ endpoint: string; p256dh: string; auth: string }>> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

/**
 * Remove a push subscription
 */
export async function removePushSubscription(
  userId: string,
  endpoint?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const supabase = await createClient();
    
    let query = supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (endpoint) {
      query = query.eq('endpoint', endpoint);
    }
    
    const { error } = await query;

    if (error) {
      console.error('Failed to remove push subscription:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return false;
  }
}

/**
 * Send push notification to specific users
 * This is used by server-side code
 */
export async function sendPushToUser(
  userId: string,
  payload: {
    title: string;
    body: string;
    icon?: string;
    data?: { url?: string };
  }
): Promise<{ success: boolean; sent: number }> {
  if (!isSupabaseConfigured()) {
    return { success: false, sent: 0 };
  }

  try {
    const { sendPushToMultiple } = await import('@/lib/push-notifications');
    const subscriptions = await getUserPushSubscriptions(userId);

    if (!subscriptions.length) {
      return { success: true, sent: 0 };
    }

    const results = await sendPushToMultiple(
      subscriptions.map(sub => ({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      })),
      {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        data: payload.data,
      }
    );

    // Clean up expired subscriptions
    if (results.expired.length > 0) {
      const supabase = await createClient();
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', results.expired);
    }

    return { success: true, sent: results.success.length };
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return { success: false, sent: 0 };
  }
}
