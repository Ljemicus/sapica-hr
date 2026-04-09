import { createServerClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for API routes.
 * Does NOT use cookies() - for public/anonymous queries only.
 * For authenticated requests in API routes, use Authorization header.
 */
export async function createApiClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op in API routes
        },
      },
    }
  );
}
