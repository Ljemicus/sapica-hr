// Web Vitals monitoring for PetPark
import { trackWebVitals } from './funnel';
import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

// Core Web Vitals thresholds
const thresholds = {
  LCP: { good: 2500, poor: 4000 },    // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 },      // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 },     // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },    // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 },    // Time to First Byte (ms)
  INP: { good: 200, poor: 500 },      // Interaction to Next Paint (ms)
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const t = thresholds[name as keyof typeof thresholds];
  if (!t) return 'good';
  
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

// Initialize Web Vitals tracking
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  const reportMetric = (metric: { name: string; value: number; id: string }) => {
    const rating = getRating(metric.name, metric.value);
    
    trackWebVitals({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating,
    });

    // Send to Sentry if poor performance
    if (rating === 'poor' && typeof process.env.SENTRY_DSN !== 'undefined') {
      import('@sentry/nextjs').then(({ captureMessage }) => {
        captureMessage(`Poor ${metric.name}: ${Math.round(metric.value)}`, {
          level: 'warning',
          extra: { metric: metric.name, value: metric.value },
        });
      }).catch(() => {});
    }
  };

  // Register web-vitals listeners
  onLCP(reportMetric);
  onINP(reportMetric);
  onCLS(reportMetric);
  onFCP(reportMetric);
  onTTFB(reportMetric);
}
