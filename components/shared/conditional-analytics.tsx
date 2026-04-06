"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useAnalyticsConsent, useCookieConsent } from "@/contexts/cookie-consent-context";

interface ConditionalAnalyticsProps {
  plausibleDomain?: string;
}

export function ConditionalAnalytics({ plausibleDomain = "petpark.hr" }: ConditionalAnalyticsProps) {
  const { canRunAnalytics, isLoaded } = useAnalyticsConsent();

  // Handle Plausible script loading based on consent
  useEffect(() => {
    if (!isLoaded) return;

    // If analytics consent is granted, ensure Plausible is loaded
    if (canRunAnalytics) {
      // Plausible is already loaded via Script in layout, but we can enable it
      const plausibleScript = document.querySelector('script[data-domain="' + plausibleDomain + '"]');
      if (plausibleScript) {
        plausibleScript.removeAttribute("data-manual");
      }
    }
  }, [canRunAnalytics, isLoaded, plausibleDomain]);

  // Only render the script if consent is given
  if (!canRunAnalytics) return null;

  return (
    <Script
      defer
      data-domain={plausibleDomain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}

// Component for Google Analytics (if needed in future)
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const { canRunAnalytics } = useAnalyticsConsent();

  if (!canRunAnalytics) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}

// Component for Meta Pixel (if needed in future)
export function MetaPixel({ pixelId }: { pixelId: string }) {
  const { hasConsent } = useCookieConsent();
  const canRunMarketing = hasConsent("marketing");

  if (!canRunMarketing) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}
