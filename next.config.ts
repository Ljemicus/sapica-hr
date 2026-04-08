import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://plausible.io https://api.resend.com https://api.stripe.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  "form-action 'self' https://checkout.stripe.com",
  "upgrade-insecure-requests",
].join('; ');

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/treneri', destination: '/dresura', permanent: true },
      { source: '/groomeri', destination: '/njega', permanent: true },
      { source: '/sitters', destination: '/pretraga', permanent: true },
      { source: '/groomers', destination: '/njega', permanent: true },
      { source: '/trainers', destination: '/dresura', permanent: true },
      // Duplicate content cleanup — canonical is /blog and /njega
      { source: '/zajednica/:slug', destination: '/blog/:slug', permanent: true },
      { source: '/grooming', destination: '/njega', permanent: true },
    ];
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Link', value: '<https://hmtlcgjcxhjecsbmmxol.supabase.co>; rel=preconnect' },
        { key: 'Link', value: '<https://res.cloudinary.com>; rel=preconnect' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        { key: 'Content-Security-Policy', value: csp },
      ],
    }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },
};

const withSentry = withSentryConfig(nextConfig, {
  // For all available options, see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  
  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
  
  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",
  
  // Source maps configuration
  sourcemaps: {
    disable: false,
  },
  
  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
});

export default withSentry;
