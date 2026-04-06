'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export type NotificationPermission = 'granted' | 'denied' | 'default';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window;
}

/**
 * Get notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission as NotificationPermission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  } catch {
    return 'default';
  }
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration
): Promise<PushSubscriptionData | null> {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.warn('VAPID public key not configured');
      return null;
    }

    // Convert VAPID key to Uint8Array
    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    };

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as ArrayBuffer,
    });

    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
    };

    return subscriptionData;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
    return true;
  } catch (error) {
    console.error('Push unsubscription failed:', error);
    return false;
  }
}

/**
 * Save push subscription to database
 */
export async function savePushSubscription(
  subscription: PushSubscriptionData
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
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
 * Remove push subscription from database
 */
export async function removePushSubscription(endpoint: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

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
 * Hook for managing push notifications
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    setIsSupported(isPushNotificationSupported());
    setPermission(getNotificationPermission());
    
    // Check existing subscription
    const checkSubscription = async () => {
      if (!isPushNotificationSupported()) return;
      
      try {
        const reg = await navigator.serviceWorker.ready;
        setRegistration(reg);
        const subscription = await reg.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Failed to check push subscription:', error);
      }
    };
    
    checkSubscription();
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    
    setIsLoading(true);
    try {
      // Request permission
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      
      if (newPermission !== 'granted') {
        return false;
      }

      // Register service worker if not already registered
      let reg = registration;
      if (!reg) {
        reg = await registerServiceWorker();
        if (!reg) return false;
        setRegistration(reg);
      }

      // Subscribe to push
      const subscription = await subscribeToPush(reg);
      if (!subscription) return false;

      // Save to database
      const saved = await savePushSubscription(subscription);
      if (saved) {
        setIsSubscribed(true);
      }
      return saved;
    } catch (error) {
      console.error('Push subscription error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, registration]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!registration) return false;
    
    setIsLoading(true);
    try {
      // Get current subscription to find endpoint
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        // Remove from database
        await removePushSubscription(subscription.endpoint);
        // Unsubscribe from push
        await unsubscribeFromPush(registration);
      }
      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error('Push unsubscription error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [registration]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
