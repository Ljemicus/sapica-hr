/**
 * Environment variable access with type safety
 */

import { getValidatedEnv, isDevelopment, isProduction, isTest, FEATURES } from './env-check';

// Re-export environment checking utilities
export { 
  getValidatedEnv, 
  isDevelopment, 
  isProduction, 
  isTest, 
  FEATURES 
};

// Type-safe environment variable access
export const env = {
  // Database
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // Authentication
  auth: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    secret: process.env.NEXTAUTH_SECRET || '',
  },
  
  // Payments
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  
  // Email
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'noreply@petpark.example.com',
  },
  
  // Analytics & Monitoring
  monitoring: {
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    analyticsApiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY || '',
  },
  
  // External APIs
  apis: {
    googleMaps: process.env.GOOGLE_MAPS_API_KEY || '',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
  },
  
  // Application
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    version: process.env.APP_VERSION || '1.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // Feature flags (computed)
  features: FEATURES,
  
  // Environment detection
  isDevelopment,
  isProduction,
  isTest,
} as const;

// Server-side only environment variables
export const serverEnv = {
  // These should only be accessed on the server
  get supabaseServiceRoleKey() {
    if (typeof window !== 'undefined') {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY can only be accessed on the server');
    }
    return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  },
  
  get stripeSecretKey() {
    if (typeof window !== 'undefined') {
      throw new Error('STRIPE_SECRET_KEY can only be accessed on the server');
    }
    return process.env.STRIPE_SECRET_KEY || '';
  },
  
  get stripeWebhookSecret() {
    if (typeof window !== 'undefined') {
      throw new Error('STRIPE_WEBHOOK_SECRET can only be accessed on the server');
    }
    return process.env.STRIPE_WEBHOOK_SECRET || '';
  },
  
  get resendApiKey() {
    if (typeof window !== 'undefined') {
      throw new Error('RESEND_API_KEY can only be accessed on the server');
    }
    return process.env.RESEND_API_KEY || '';
  },
  
  get cloudinaryApiSecret() {
    if (typeof window !== 'undefined') {
      throw new Error('CLOUDINARY_API_SECRET can only be accessed on the server');
    }
    return process.env.CLOUDINARY_API_SECRET || '';
  },
  
  get nextauthSecret() {
    if (typeof window !== 'undefined') {
      throw new Error('NEXTAUTH_SECRET can only be accessed on the server');
    }
    return process.env.NEXTAUTH_SECRET || '';
  },
};

// Runtime environment validation
export function assertEnv(): void {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Environment variable documentation
export const ENV_DOCS = `
# PetPark Environment Variables

## Required Variables
- \`NEXT_PUBLIC_SUPABASE_URL\`: Supabase project URL
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`: Supabase anonymous key
- \`NEXTAUTH_URL\`: NextAuth.js base URL
- \`NEXTAUTH_SECRET\`: NextAuth.js secret for encryption

## Optional Variables
### Database
- \`SUPABASE_SERVICE_ROLE_KEY\`: Supabase service role key (server only)

### Authentication
- \`NEXTAUTH_SECRET\`: NextAuth.js secret (server only)

### Payments
- \`STRIPE_SECRET_KEY\`: Stripe secret key (server only)
- \`STRIPE_WEBHOOK_SECRET\`: Stripe webhook secret (server only)
- \`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\`: Stripe publishable key

### Email
- \`RESEND_API_KEY\`: Resend.com API key (server only)
- \`EMAIL_FROM\`: Default sender email address

### Analytics & Monitoring
- \`NEXT_PUBLIC_SENTRY_DSN\`: Sentry DSN for error tracking
- \`NEXT_PUBLIC_ANALYTICS_API_KEY\`: Analytics service API key

### External APIs
- \`GOOGLE_MAPS_API_KEY\`: Google Maps JavaScript API key
- \`CLOUDINARY_CLOUD_NAME\`: Cloudinary cloud name
- \`CLOUDINARY_API_KEY\`: Cloudinary API key
- \`CLOUDINARY_API_SECRET\`: Cloudinary API secret (server only)

### Application
- \`NODE_ENV\`: Node.js environment (development/production/test)
- \`APP_URL\`: Application base URL
- \`APP_VERSION\`: Application version

## Development vs Production
- In development, missing optional variables will use defaults
- In production, missing required variables will throw errors
- Server-only variables are protected from client-side access

## Security Notes
- Never commit sensitive keys to version control
- Use \`.env.local\` for local development
- Use environment variable management in production (Vercel, Railway, etc.)
- Regularly rotate API keys and secrets
`;

// Export type for TypeScript
export type Env = typeof env;
export type ServerEnv = typeof serverEnv;