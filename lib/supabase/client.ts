import { createBrowserClient } from '@supabase/ssr';

let warnedAboutMockSupabase = false;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Supabase client is not configured in production');
    }

    if (!warnedAboutMockSupabase) {
      warnedAboutMockSupabase = true;
      console.warn('⚠️ Supabase client not configured — using mock mode in non-production environment');
    }

    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
