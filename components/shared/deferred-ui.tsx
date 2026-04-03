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

// Lazy-load chat widget — not needed during initial paint
const ChatWidget = dynamic(
  () => import('@/components/shared/chat-widget').then((mod) => mod.ChatWidget)
);

export function DeferredUI() {
  return (
    <>
      <ScrollToTop />
      <PushNotificationPrompt />
      <Toaster position="top-right" richColors />
      <CookieConsent />
      <ChatWidget />
    </>
  );
}
