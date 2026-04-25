import type { NextConfig } from "next";

const allowedStyleHashes = [
  "'unsafe-hashes'",
  "'sha256-t6oewASd7J1vBg5mQtX4hl8bg8FeegYFM3scKLIhYUc='",
  "'sha256-LwoYSIU7H7ALhCK8JF+HKTq2AdcpkrZ9eK1pLP9iv6U='",
  "'sha256-68ahHyH65aqS202beKyu22MkdAEr0fBCN3eHnbYX+wg='",
  "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
  "'sha256-CIxDM5jnsGiKqXs2v7NKCY5MzdR9gu6TtiMJrDw29AY='",
];

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' https://plausible.io",
  ["style-src 'self'", ...allowedStyleHashes].join(' '),
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
      // NOTE: /zajednica/feed is excluded — it's the social feed page
      { source: '/zajednica/:slug((?!feed).*)', destination: '/blog/:slug', permanent: true },
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
    optimizeCss: true,
  },
};

export default nextConfig;
