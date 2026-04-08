'use client';

import { useReportWebVitals } from 'next/web-vitals';
import * as Sentry from '@sentry/nextjs';

const CORE_VITALS = new Set(['LCP', 'FCP', 'CLS', 'INP', 'TTFB']);

// Thresholds for Core Web Vitals (Google standards)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' | 'unknown' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value >= threshold.poor) return 'poor';
  return 'needs-improvement';
}

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (!CORE_VITALS.has(metric.name)) return;

    const value = metric.name === 'CLS' ? metric.value * 1000 : metric.value;
    const rating = metric.rating ?? getRating(metric.name, metric.value);
    const path = window.location.pathname;

    // Send to Plausible
    if (typeof window.plausible === 'function') {
      window.plausible('Web Vital', {
        props: {
          name: metric.name,
          value: Math.round(value),
          rating,
          path,
        },
      });
    }

    // Send to Sentry as transaction metric
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${Math.round(value)}ms (${rating})`,
      level: rating === 'poor' ? 'warning' : 'info',
      data: {
        name: metric.name,
        value: metric.value,
        rating,
        path,
        id: metric.id,
      },
    });

    // Log poor vitals to console in development
    if (process.env.NODE_ENV === 'development' && rating === 'poor') {
      console.warn(`[Web Vitals] Poor ${metric.name}: ${Math.round(value)}ms`, {
        path,
        rating,
        value: metric.value,
      });
    }

    // Note: Sentry metrics API may vary by version
    // Using breadcrumbs instead for compatibility
  });

  return null;
}
