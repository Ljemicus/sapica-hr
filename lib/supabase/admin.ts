import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // Return mock client during build/SSG when env vars aren't available
    if (process.env.NODE_ENV === 'production' && !process.env.CI) {
      return createClient('https://placeholder.supabase.co', 'placeholder', {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
    throw new Error('Supabase admin environment variables are not configured');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
