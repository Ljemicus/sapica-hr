/**
 * PetPark Service Worker
 * Handles push notifications and offline caching
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Cache configuration
const CACHE_NAME = 'petpark-v1';
const STATIC_ASSETS = [
  '/',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const notification = data.notification || data;

    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/icons/icon-192.png',
      badge: notification.badge || '/icons/icon-96.png',
      image: notification.image,
      tag: notification.tag,
      requireInteraction: notification.requireInteraction,
      actions: notification.actions,
      data: notification.data,
      vibrate: notification.vibrate || [100, 50, 100],
      renotify: notification.renotify ?? false,
    };

    event.waitUntil(
      self.registration.showNotification(notification.title, options)
    );
  } catch (error) {
    // Fallback for plain text notifications
    event.waitUntil(
      self.registration.showNotification('PetPark', {
        body: event.data.text(),
        icon: '/icons/icon-192.png',
      })
    );
  }
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action;

  // Handle custom actions
  if (action === 'reply' && notificationData.replyUrl) {
    event.waitUntil(
      self.clients.openWindow(notificationData.replyUrl)
    );
    return;
  }

  if (action === 'dismiss') {
    return; // Just close the notification
  }

  // Default behavior: open the URL from notification data or app root
  const urlToOpen = notificationData.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// Background sync for offline support (optional enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    // Re-sync pending messages when online
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages(): Promise<void> {
  // Implementation would fetch pending messages from IndexedDB and send them
  // This is a placeholder for future enhancement
  console.log('Syncing pending messages...');
}

// Fetch event - basic offline support
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request)
        .then((response) => {
          // Cache successful responses for static assets
          if (response.ok && event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          throw new Error('Network request failed');
        });
    })
  );
});

export {};
