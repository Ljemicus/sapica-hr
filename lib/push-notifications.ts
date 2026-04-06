import webpush from 'web-push';
import { appLogger } from './logger';
import { dispatchAlert } from './alerting';

// VAPID keys should be generated and stored in environment variables
// Generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@petpark.hr';

// Initialize web-push with VAPID keys
if (typeof window === 'undefined' && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: {
    url?: string;
    [key: string]: unknown;
  };
}

/**
 * Send a push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  if (!VAPID_PRIVATE_KEY) {
    appLogger.warn('push', 'VAPID keys not configured, skipping push notification');
    return { success: false, error: 'VAPID not configured' };
  }

  try {
    const pushPayload = JSON.stringify({
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icons/icon-192.png',
        badge: payload.badge || '/icons/icon-96.png',
        image: payload.image,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction,
        actions: payload.actions,
        data: payload.data,
        vibrate: [100, 50, 100],
        renotify: false,
      },
    });

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      pushPayload
    );

    appLogger.info('push', 'Push notification sent successfully', { endpoint: subscription.endpoint.slice(0, 50) });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if subscription is expired (statusCode 410 Gone)
    if (errorMessage.includes('410') || errorMessage.includes('unsubscribed')) {
      return { success: false, error: 'subscription_expired' };
    }
    
    appLogger.error('push', 'Failed to send push notification', { error: errorMessage });
    dispatchAlert({
      severity: 'P3',
      service: 'push_notifications',
      description: 'Failed to send push notification',
      value: errorMessage.slice(0, 100),
      owner: 'platform',
    });
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Send push notifications to multiple subscriptions
 * Returns list of expired subscription endpoints for cleanup
 */
export async function sendPushToMultiple(
  subscriptions: PushSubscription[],
  payload: NotificationPayload
): Promise<{ success: string[]; expired: string[]; failed: string[] }> {
  const results = {
    success: [] as string[],
    expired: [] as string[],
    failed: [] as string[],
  };

  await Promise.all(
    subscriptions.map(async (sub) => {
      const result = await sendPushNotification(sub, payload);
      if (result.success) {
        results.success.push(sub.endpoint);
      } else if (result.error === 'subscription_expired') {
        results.expired.push(sub.endpoint);
      } else {
        results.failed.push(sub.endpoint);
      }
    })
  );

  return results;
}

/**
 * Notification types and their default payloads
 */
export const NotificationTemplates = {
  newMessage: (senderName: string): NotificationPayload => ({
    title: 'Nova poruka',
    body: `${senderName} vam je poslao/la poruku`,
    tag: 'new_message',
    data: { url: '/poruke' },
  }),

  bookingRequest: (ownerName: string, petName: string): NotificationPayload => ({
    title: 'Novi upit za čuvanje',
    body: `${ownerName} želi rezervirati čuvanje za ${petName}`,
    tag: 'booking_request',
    data: { url: '/dashboard' },
  }),

  bookingAccepted: (sitterName: string, petName: string): NotificationPayload => ({
    title: 'Rezervacija potvrđena',
    body: `${sitterName} je prihvatio/la rezervaciju za ${petName}`,
    tag: 'booking_accepted',
    data: { url: '/dashboard' },
  }),

  bookingUpdated: (petName: string, status: string): NotificationPayload => ({
    title: 'Ažuriranje rezervacije',
    body: `Status rezervacije za ${petName}: ${status}`,
    tag: 'booking_updated',
    data: { url: '/dashboard' },
  }),

  walkStarted: (sitterName: string, petName: string): NotificationPayload => ({
    title: 'Šetnja započela',
    body: `${sitterName} je krenuo/la u šetnju s ${petName}`,
    tag: 'walk_started',
    requireInteraction: true,
    data: { url: '/dashboard' },
  }),

  reviewRequest: (petName: string): NotificationPayload => ({
    title: 'Kako je prošla usluga?',
    body: `Ostavite recenziju za čuvanje ${petName}`,
    tag: 'review_request',
    data: { url: '/dashboard' },
  }),
};
