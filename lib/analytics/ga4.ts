/**
 * Google Analytics 4 (GA4) Implementation for PetPark
 * 
 * GDPR-compliant implementation with cookie consent handling.
 * 
 * Usage:
 *   import { trackEvent, trackPageView, initializeGA } from '@/lib/analytics/ga4'
 *   
 *   // Initialize (call once on app load)
 *   initializeGA('G-XXXXXXXXXX')
 *   
 *   // Track page view
 *   trackPageView('/dashboard')
 *   
 *   // Track custom event
 *   trackEvent('booking_completed', { 
 *     value: 99.99, 
 *     currency: 'EUR',
 *     booking_id: '12345'
 *   })
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// GA4 Measurement ID (from Google Analytics admin)
let MEASUREMENT_ID: string | null = null;

// Cookie consent state
let analyticsConsentGranted = false;

/**
 * Initialize Google Analytics 4
 * @param measurementId - GA4 Measurement ID (G-XXXXXXXXXX)
 * @param consentGranted - Whether user has granted analytics consent
 */
export function initializeGA(measurementId: string, consentGranted: boolean = false): void {
  MEASUREMENT_ID = measurementId;
  analyticsConsentGranted = consentGranted;

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  // Define gtag function
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  // Define gtag function first
  const gtag: (...args: any[]) => void = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag = gtag;

  // Load GA script if consent granted
  if (consentGranted) {
    loadGAScript();
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_path: window.location.pathname,
      anonymize_ip: true, // GDPR compliance
      allow_google_signals: false, // Disable personalized ads by default
      allow_ad_personalization_signals: false,
    });
  }
}

/**
 * Load Google Analytics script dynamically
 */
function loadGAScript(): void {
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    return; // Already loaded
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/**
 * Update consent state (call when user changes cookie preferences)
 * @param granted - Whether analytics consent is granted
 */
export function updateConsent(granted: boolean): void {
  analyticsConsentGranted = granted;
  
  if (granted && MEASUREMENT_ID) {
    // Initialize GA if not already initialized
    if (!window.gtag) {
      initializeGA(MEASUREMENT_ID, true);
    } else {
      // Update consent settings
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
  } else if (!granted && window.gtag) {
    // Revoke consent
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

/**
 * Track page view
 * @param path - Page path (e.g., '/dashboard', '/booking/confirmation')
 * @param title - Optional page title
 */
export function trackPageView(path: string, title?: string): void {
  if (!analyticsConsentGranted || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

/**
 * Track custom event
 * @param eventName - Event name (e.g., 'booking_completed', 'signup_success')
 * @param eventParams - Event parameters (max 25 parameters, 100 characters each)
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>): void {
  if (!analyticsConsentGranted || !window.gtag) return;

  window.gtag('event', eventName, eventParams);
}

// Predefined event tracking functions for common PetPark actions

/**
 * Track booking conversion
 * @param bookingId - Unique booking ID
 * @param amount - Booking amount in EUR
 * @param serviceType - Type of service (boarding, walking, etc.)
 */
export function trackBookingConversion(bookingId: string, amount: number, serviceType: string): void {
  trackEvent('booking_completed', {
    transaction_id: bookingId,
    value: amount,
    currency: 'EUR',
    items: [{
      item_id: bookingId,
      item_name: `Pet ${serviceType} Service`,
      price: amount,
      quantity: 1,
    }],
    service_type: serviceType,
  });
}

/**
 * Track signup funnel step
 * @param step - Funnel step ('started', 'email_entered', 'verified', 'completed')
 * @param userId - User ID (hashed/anonymized)
 */
export function trackSignupFunnel(step: 'started' | 'email_entered' | 'verified' | 'completed', userId?: string): void {
  trackEvent('signup_funnel', {
    funnel_step: step,
    user_id: userId ? hashUserId(userId) : undefined,
  });
}

/**
 * Track pet listing creation
 * @param petType - Type of pet ('dog', 'cat', 'other')
 * @param breed - Breed of pet (optional)
 * @param listingType - 'lost' or 'found'
 */
export function trackPetListing(petType: string, breed?: string, listingType: 'lost' | 'found' = 'lost'): void {
  trackEvent('pet_listing_created', {
    pet_type: petType,
    breed: breed,
    listing_type: listingType,
  });
}

/**
 * Track search activity
 * @param query - Search query
 * @param filters - Applied filters
 * @param resultCount - Number of results
 */
export function trackSearch(query: string, filters: Record<string, any>, resultCount: number): void {
  trackEvent('search_performed', {
    search_query: query,
    filters: JSON.stringify(filters),
    result_count: resultCount,
  });
}

/**
 * Track user engagement
 * @param action - Engagement action ('click', 'view', 'share', 'save')
 * @param contentType - Type of content ('breeder_profile', 'service', 'article')
 * @param contentId - Content identifier
 */
export function trackEngagement(action: string, contentType: string, contentId: string): void {
  trackEvent('user_engagement', {
    engagement_action: action,
    content_type: contentType,
    content_id: contentId,
  });
}

/**
 * Track error/exception
 * @param errorType - Type of error ('api_error', 'validation_error', 'payment_error')
 * @param errorMessage - Error message (truncated)
 * @param component - Component where error occurred
 */
export function trackError(errorType: string, errorMessage: string, component: string): void {
  // Truncate error message for privacy
  const truncatedMessage = errorMessage.length > 100 
    ? errorMessage.substring(0, 100) + '...' 
    : errorMessage;
  
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: truncatedMessage,
    component: component,
  });
}

// Helper functions

/**
 * Hash user ID for privacy (simple hash for demonstration)
 * In production, use a proper hashing algorithm
 */
function hashUserId(userId: string): string {
  // Simple hash for demonstration - replace with proper implementation
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Check if GA is initialized and consent granted
 */
export function isGAActive(): boolean {
  return analyticsConsentGranted && !!window.gtag;
}

/**
 * Get current consent state
 */
export function getConsentState(): boolean {
  return analyticsConsentGranted;
}

// Default export for convenience
export default {
  initializeGA,
  updateConsent,
  trackPageView,
  trackEvent,
  trackBookingConversion,
  trackSignupFunnel,
  trackPetListing,
  trackSearch,
  trackEngagement,
  trackError,
  isGAActive,
  getConsentState,
};