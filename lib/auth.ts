import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { getUserById } from '@/lib/mock-data';
import type { User } from '@/lib/types';

/**
 * Server-side: get the currently authenticated user.
 * - Ako je Supabase konfiguriran → koristi Supabase Auth
 * - Ako nije → koristi mock auth (cookie-based demo login)
 */
export async function getAuthUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return getMockAuthUser();
  }

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    // Try to get profile from public.users table
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (data) return data as User;

    // Fallback: construct from auth metadata
    const meta = authUser.user_metadata;
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: meta?.name || meta?.full_name || authUser.email?.split('@')[0] || '',
      role: meta?.role || 'owner',
      avatar_url: meta?.avatar_url || null,
      phone: null,
      city: meta?.city || null,
      created_at: authUser.created_at,
    };
  } catch {
    return getMockAuthUser();
  }
}

/**
 * Mock auth: čita user ID iz cookie-a mock_user_id
 */
async function getMockAuthUser(): Promise<User | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const mockUserId = cookieStore.get('mock_user_id')?.value;
    if (!mockUserId) return null;
    return getUserById(mockUserId) ?? null;
  } catch {
    return null;
  }
}
