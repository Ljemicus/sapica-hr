'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // Report Web Vitals to console in development
    if (process.env.NODE_ENV === 'development') {
      // @ts-expect-error - web-vitals types
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        onCLS(console.log);
        onFID(console.log);
        onFCP(console.log);
        onLCP(console.log);
        onTTFB(console.log);
      });
    }

    // Prefetch critical pages
    const prefetchLinks = [
      '/pretraga',
      '/veterinari',
      '/njega',
      '/dresura',
    ];

    prefetchLinks.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });

    // Preconnect to critical domains
    const preconnectDomains = [
      'https://hmtlcgjcxhjecsbmmxol.supabase.co',
    ];

    preconnectDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  return null;
}
