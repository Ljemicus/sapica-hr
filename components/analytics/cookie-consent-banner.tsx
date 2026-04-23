'use client';

import { useMemo, useState } from 'react';
import { updateConsent } from '@/lib/analytics/ga4';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CookieConsentBannerProps {
  measurementId?: string;
}

export default function CookieConsentBanner({ measurementId }: CookieConsentBannerProps) {
  const initialConsent = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('petpark_analytics_consent');
  }, []);

  const [showBanner, setShowBanner] = useState(initialConsent === null);
  const savedConsent = initialConsent;

  if (savedConsent !== null && measurementId) {
    updateConsent(savedConsent === 'true');
  }

  const handleAccept = () => {
    localStorage.setItem('petpark_analytics_consent', 'true');
    setShowBanner(false);
    
    if (measurementId) {
      updateConsent(true);
    }
    
    // Track the consent acceptance (only after consent is given)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cookie_consent_accepted');
    }
  };

  const handleReject = () => {
    localStorage.setItem('petpark_analytics_consent', 'false');
    setShowBanner(false);
    
    if (measurementId) {
      updateConsent(false);
    }
    
    // We don't track rejection for privacy reasons
  };

  const handleCustomize = () => {
    // In a real implementation, this would open a modal with detailed options
    // For now, we'll just show/hide advanced options
    const details = document.getElementById('cookie-details');
    if (details) {
      details.classList.toggle('hidden');
    }
  };

  const handleClose = () => {
    setShowBanner(false);
    // Don't save preference if user closes without deciding
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🍪 Cookie Preferences
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        PetPark uses cookies to improve your experience, analyze traffic, and personalize content.
        We respect your privacy and only use analytics cookies with your consent.
      </p>

      <div id="cookie-details" className="hidden mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cookie Details</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <li>
            <strong>Essential Cookies:</strong> Always active. Required for site functionality.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how visitors interact with the site.
            These collect anonymous data about page views, clicks, and navigation patterns.
          </li>
          <li>
            <strong>Marketing Cookies:</strong> Currently disabled. We don&apos;t use advertising or tracking cookies.
          </li>
        </ul>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          For more details, see our{' '}
          <a 
            href="/privacy-policy" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleAccept}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Accept All
        </Button>
        
        <Button
          onClick={handleReject}
          variant="outline"
          className="flex-1"
        >
          Reject All
        </Button>
        
        <Button
          onClick={handleCustomize}
          variant="ghost"
          className="flex-1"
        >
          Customize
        </Button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        By continuing to use our site, you consent to our use of essential cookies.
        You can change your preferences at any time in your account settings.
      </p>
    </div>
  );
}