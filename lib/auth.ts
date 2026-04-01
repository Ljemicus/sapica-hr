import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { appLogger } from '@/lib/logger';
import type { User } from '@/lib/types';

export interface AuthUserMetadata {
  name?: string;
  full_name?: string;
  role?: User['role'];
  avatar_url?: string | null;
  city?: string | null;
}

export interface AuthIdentityUser {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: AuthUserMetadata | null;
}

export function isUserRole(value: unknown): value is User['role'] {
  return value === 'owner' || value === 'sitter' || value === 'admin';
}

export function parseAuthRole(value: unknown, fallback: User['role'] = 'owner'): User['role'] {
  return isUserRole(value) ? value : fallback;
}

export function buildUserFromAuth(authUser: AuthIdentityUser): User {
  const meta = authUser.user_metadata;

  return {
    id: authUser.id,
    email: authUser.email || '',
    name: meta?.name || meta?.full_name || authUser.email?.split('@')[0] || '',
    role: parseAuthRole(meta?.role),
    avatar_url: meta?.avatar_url || null,
    phone: null,
    city: meta?.city || null,
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
