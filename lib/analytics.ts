'use client';

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, string | number | boolean | null> }) => void;
  }
}

export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean | null>
) {
  if (typeof window === 'undefined' || typeof window.plausible !== 'function') {
    return;
  }

  window.plausible(eventName, props ? { props } : undefined);
}
