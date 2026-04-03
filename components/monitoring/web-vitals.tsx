'use client';

import { useReportWebVitals } from 'next/web-vitals';

const CORE_VITALS = new Set(['LCP', 'FCP', 'CLS', 'INP', 'TTFB']);

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (!CORE_VITALS.has(metric.name)) return;

    if (typeof window.plausible === 'function') {
      window.plausible('Web Vital', {
        props: {
          name: metric.name,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          rating: metric.rating ?? 'unknown',
          path: window.location.pathname,
        },
      });
    }
  });

  return null;
}
