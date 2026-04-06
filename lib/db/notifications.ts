import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';

export type NotificationType = 'email' | 'push' | 'sms';

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  bookings_enabled: boolean;
  messages_enabled: boolean;
  promotions_enabled: boolean;
  lost_pets_enabled: boolean;
  updated_at: string;
}

/**
 * Check if a user can receive a specific type of notification
 */
export async function canSendNotification(
  userId: string,
  type: NotificationType,
  category?: 'bookings' | 'messages' | 'promotions' | 'lost_pets'
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true; // Default to allowing if no config
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      // Default to true if no preferences set
      return true;
    }

    // Check main notification type
    switch (type) {
      case 'email':
        if (!data.email_enabled) return false;
        break;
      case 'push':
        if (!data.push_enabled) return false;
        break;
      case 'sms':
        if (!data.sms_enabled) return false;
        break;
    }

    // Check category-specific preference
    if (category) {
      switch (category) {
        case 'bookings':
          if (!data.bookings_enabled) return false;
          break;
        case 'messages':
          if (!data.messages_enabled) return false;
          break;
        case 'promotions':
          if (!data.promotions_enabled) return false;
          break;
        case 'lost_pets':
          if (!data.lost_pets_enabled) return false;
          break;
      }
    }

    return true;
  } catch {
    return true; // Default to allowing on error
  }
}

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return null;
    return data as NotificationPreferences | null;
  } catch {
    return null;
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
 * Remove expired push subscriptions
 */
export async function removeExpiredSubscriptions(
  endpoints: string[]
): Promise<void> {
  if (!isSupabaseConfigured() || !endpoints.length) {
    return;
  }

  try {
    const supabase = await createClient();
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', endpoints);
  } catch {
    // Ignore errors
  }
}
