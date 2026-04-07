'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeGA, trackPageView } from '@/lib/analytics/ga4';
import CookieConsentBanner from './cookie-consent-banner';

interface AnalyticsProviderProps {
  children: React.ReactNode;
  measurementId?: string;
}

export default function AnalyticsProvider({ 
  children, 
  measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID 
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check cookie consent
    const savedConsent = localStorage.getItem('petpark_analytics_consent');
    const consentGranted = savedConsent === 'true';
    
    // Initialize GA if measurement ID is provided and consent granted
    if (measurementId && consentGranted) {
      initializeGA(measurementId, true);
    } else if (measurementId) {
      // Initialize without tracking (waiting for consent)
      initializeGA(measurementId, false);
    }
  }, [measurementId]);

  useEffect(() => {
    // Track page views when route changes
    if (pathname && measurementId) {
      const savedConsent = localStorage.getItem('petpark_analytics_consent');
      const consentGranted = savedConsent === 'true';
      
      if (consentGranted) {
        // Include search params in page view tracking
        const fullPath = searchParams.toString() 
          ? `${pathname}?${searchParams.toString()}`
          : pathname;
        
        trackPageView(fullPath);
      }
    }
  }, [pathname, searchParams, measurementId]);

  // Track specific events based on page content
  useEffect(() => {
    // Example: Track booking confirmation page
    if (pathname?.includes('/booking/confirmation')) {
      const savedConsent = localStorage.getItem('petpark_analytics_consent');
      const consentGranted = savedConsent === 'true';
      
      if (consentGranted && typeof window !== 'undefined' && window.gtag) {
        // Extract booking ID from URL or page data
        const bookingId = new URLSearchParams(window.location.search).get('booking_id');
        if (bookingId) {
          window.gtag('event', 'booking_confirmation_viewed', {
            booking_id: bookingId,
          });
        }
      }
    }
    
    // Example: Track signup page
    if (pathname?.includes('/signup')) {
      const savedConsent = localStorage.getItem('petpark_analytics_consent');
      const consentGranted = savedConsent === 'true';
      
      if (consentGranted && typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'signup_page_viewed');
      }
    }
  }, [pathname]);

  return (
    <>
      {children}
      {measurementId && <CookieConsentBanner measurementId={measurementId} />}
    </>
  );
}