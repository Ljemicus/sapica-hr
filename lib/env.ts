// Environment configuration
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.NEXT_PUBLIC_APP_ENV === 'staging',
  isTest: process.env.NODE_ENV === 'test',
} as const;

// Feature flags based on environment
export const FEATURES = {
  enableAnalytics: ENV.isProduction,
  enableSentry: ENV.isProduction || ENV.isStaging,
  enableDebugLogs: ENV.isDevelopment || ENV.isStaging,
  enableMaintenanceMode: false, // Toggle for maintenance
} as const;

// API endpoints based on environment
export const API_ENDPOINTS = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
} as const;

// Validate required env vars
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
