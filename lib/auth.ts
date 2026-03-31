import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { appLogger } from '@/lib/logger';
import type { User } from '@/lib/types';

export function buildUserFromAuth(authUser: {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: Record<string, unknown> | null;
}): User {
  const meta = authUser.user_metadata;

  return {
    id: authUser.id,
    email: authUser.email || '',
    name: (meta?.name as string | undefined) || (meta?.full_name as string | undefined) || authUser.email?.split('@')[0] || '',
    role: ((meta?.role as User['role'] | undefined) || 'owner'),
    avatar_url: (meta?.avatar_url as string | null | undefined) || null,
    phone: null,
    city: (meta?.city as string | null | undefined) || null,
    created_at: authUser.created_at,
  };
}

/**
 * Server-side: get the currently authenticated user via Supabase Auth.
 */
export async function getAuthUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return null;

    // public.users is the canonical profile source when available
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (data) return data as User;

    appLogger.warn('auth', 'Falling back to auth metadata because public.users profile is missing', {
      userId: authUser.id,
    });
    return buildUserFromAuth(authUser);
  } catch {
    appLogger.error('auth', 'Failed to resolve authenticated user');
    return null;
  }
}
