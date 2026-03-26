// Mock push notification sustav

export type NotificationPermission = 'granted' | 'denied' | 'default';

let mockPermission: NotificationPermission = 'default';

/**
 * Mock requestPermission — simulira browser Notification API.
 */
export async function mockRequestPermission(): Promise<NotificationPermission> {
  // Simuliraj delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  mockPermission = 'granted';
  return mockPermission;
}

/**
 * Mock subscribe — simulira push subscription.
 */
export async function mockSubscribe(): Promise<{ endpoint: string; keys: { p256dh: string; auth: string } }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    endpoint: `https://fcm.googleapis.com/fcm/send/mock-${Date.now()}`,
    keys: {
      p256dh: btoa(Math.random().toString()),
      auth: btoa(Math.random().toString()),
    },
  };
}

/** Dohvati trenutni permission status */
export function getPermissionStatus(): NotificationPermission {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission as NotificationPermission;
  }
  return mockPermission;
}
