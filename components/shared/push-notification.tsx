'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationPrompt() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    // Check if already subscribed or dismissed
    const dismissed = localStorage.getItem('push-notification-dismissed');
    if (dismissed) return;

    // Check current permission
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return;

    // Show prompt after a short delay
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleSubscribe = async () => {
    setSubscribing(true);

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.info('Obavijesti su onemogućene. Možete ih uključiti u postavkama preglednika.');
        setShow(false);
        return;
      }

      // Get VAPID public key from environment (optional - for demo we skip actual subscription)
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        // No VAPID key configured - just register SW and enable notifications
        toast.success('Obavijesti su uključene!');
        setShow(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const subJson = subscription.toJSON();

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth,
        }),
      });

      if (!response.ok) throw new Error('Failed to save subscription');

      toast.success('Obavijesti su uključene!');
    } catch {
      toast.error('Greška pri uključivanju obavijesti.');
    } finally {
      setSubscribing(false);
      setShow(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('push-notification-dismissed', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">Uključite obavijesti</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Primajte obavijesti o novim porukama, rezervacijama i ažuriranjima o vašem ljubimcu.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleSubscribe}
                disabled={subscribing}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8"
              >
                {subscribing ? 'Uključujem...' : 'Uključi'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs h-8 text-gray-500"
              >
                Ne sada
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
