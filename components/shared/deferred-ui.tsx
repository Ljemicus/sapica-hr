'use client';

import dynamic from 'next/dynamic';

const ScrollToTop = dynamic(
  () => import('@/components/shared/scroll-to-top').then((mod) => mod.ScrollToTop)
);

const Toaster = dynamic(
  () => import('@/components/ui/sonner').then((mod) => mod.Toaster)
);

const PushNotificationPrompt = dynamic(
  () => import('@/components/shared/push-notification').then((mod) => mod.PushNotificationPrompt)
);

const CookieConsent = dynamic(
  () => import('@/components/shared/cookie-consent').then((mod) => mod.CookieConsent)
);

const FloatingChat = dynamic(
  () => import('@/components/shared/floating-chat').then((mod) => mod.FloatingChat)
);

export function DeferredUI() {
  return (
    <>
      <ScrollToTop />
      <PushNotificationPrompt />
      <Toaster position="top-right" richColors />
      <FloatingChat />
      <CookieConsent />
    </>
  );
}
