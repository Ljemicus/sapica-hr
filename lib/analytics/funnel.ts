// Analytics funnel events for PetPark
// Track core user journey: signup → onboarding → booking → payment

export type FunnelStep = 
  | 'signup_start'
  | 'signup_complete'
  | 'onboarding_start'
  | 'onboarding_complete'
  | 'search_performed'
  | 'sitter_viewed'
  | 'booking_initiated'
  | 'booking_details_entered'
  | 'booking_submitted'
  | 'payment_initiated'
  | 'payment_complete'
  | 'review_submitted';

interface FunnelEvent {
  step: FunnelStep;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Send funnel event to analytics
export function trackFunnelEvent(
  step: FunnelStep,
  metadata?: Record<string, unknown>
): void {
  const event: FunnelEvent = {
    step,
    metadata,
    timestamp: new Date().toISOString(),
  };

  // Plausible Analytics
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible('Funnel', {
      props: {
        step,
        ...metadata,
      },
    });
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Funnel]', step, metadata);
  }

  // Send to custom endpoint if configured
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch('/api/analytics/funnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {
      // Silently fail - analytics shouldn't break the app
    });
  }
}

// Predefined funnel tracking helpers
export const funnel = {
  // Signup flow
  signupStart: (source: string) => trackFunnelEvent('signup_start', { source }),
  signupComplete: (userId: string, method: 'email' | 'google' | 'facebook') => 
    trackFunnelEvent('signup_complete', { userId, method }),

  // Onboarding flow
  onboardingStart: (userId: string) => trackFunnelEvent('onboarding_start', { userId }),
  onboardingComplete: (userId: string, petsAdded: number) => 
    trackFunnelEvent('onboarding_complete', { userId, petsAdded }),

  // Search/Discovery
  searchPerformed: (query: string, resultsCount: number) => 
    trackFunnelEvent('search_performed', { query, resultsCount }),
  sitterViewed: (sitterId: string, source: 'search' | 'ai_matching' | 'direct') => 
    trackFunnelEvent('sitter_viewed', { sitterId, source }),

  // Booking flow
  bookingInitiated: (sitterId: string, serviceType: string) => 
    trackFunnelEvent('booking_initiated', { sitterId, serviceType }),
  bookingDetailsEntered: (bookingId: string, duration: number, price: number) => 
    trackFunnelEvent('booking_details_entered', { bookingId, duration, price }),
  bookingSubmitted: (bookingId: string, totalPrice: number) => 
    trackFunnelEvent('booking_submitted', { bookingId, totalPrice }),

  // Payment flow
  paymentInitiated: (bookingId: string, amount: number) => 
    trackFunnelEvent('payment_initiated', { bookingId, amount }),
  paymentComplete: (bookingId: string, amount: number, method: string) => 
    trackFunnelEvent('payment_complete', { bookingId, amount, method }),

  // Post-booking
  reviewSubmitted: (bookingId: string, rating: number) => 
    trackFunnelEvent('review_submitted', { bookingId, rating }),
};

// Web Vitals tracking
export function trackWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric.name, metric.value, metric.rating);
  }

  // Send to analytics
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible('Web Vitals', {
      props: {
        metric: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
      },
    });
  }
}
