import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { appLogger } from '@/lib/logger';
import type { User, UserRole } from '@/lib/types';

export interface AuthUserMetadata {
  name?: string;
  full_name?: string;
  avatar_url?: string | null;
  city?: string | null;
}

export interface AuthIdentityUser {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: AuthUserMetadata | null;
}

export interface AuthUser extends User {
  roles: UserRole[];
  isAdmin: boolean;
  profileFound: boolean;
  profileMissing: boolean;
}

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
};

type LegacyUserRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
};

type ProfileRoleRow = {
  role: string;
};

function isExpectedDynamicUsageError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return message.includes('Dynamic server usage');
}

export function isUserRole(value: unknown): value is UserRole {
  return value === 'owner' || value === 'sitter' || value === 'admin';
}

export function normalizeRoles(values: unknown[]): UserRole[] {
  const roles = values.filter(isUserRole);
  return Array.from(new Set(roles));
}

export function getPrimaryRole(roles: UserRole[]): UserRole {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('sitter')) return 'sitter';
  return 'owner';
}

export function buildUserFromAuth(authUser: AuthIdentityUser, roles: UserRole[] = ['owner']): AuthUser {
  const meta = authUser.user_metadata;
  const normalizedRoles = normalizeRoles(roles.length > 0 ? roles : ['owner']);
  const primaryRole = getPrimaryRole(normalizedRoles);

  return {
    id: authUser.id,
    email: authUser.email || '',
    name: meta?.name || meta?.full_name || authUser.email?.split('@')[0] || '',
    role: primaryRole,
    roles: normalizedRoles,
    isAdmin: normalizedRoles.includes('admin'),
    avatar_url: meta?.avatar_url || null,
    phone: null,
    city: meta?.city || null,
    created_at: authUser.created_at,
    profileFound: false,
    profileMissing: true,
  };
}

function isLegacyFallbackEnabled(): boolean {
  return process.env.AUTH_LEGACY_FALLBACK === 'true';
}

async function createRequestScopedSupabase() {
  const headerStore = await headers();
  const authHeader = headerStore.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  return bearerToken
    ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
      )
    : await createClient();
}

async function getProfileRoles(supabase: Awaited<ReturnType<typeof createRequestScopedSupabase>>, userId: string): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from('profile_roles')
    .select('role')
    .eq('profile_id', userId);

  if (error) {
    appLogger.warn('auth', 'Failed to load profile roles', { userId, message: error.message });
    return [];
  }

  return normalizeRoles(((data ?? []) as ProfileRoleRow[]).map((row) => row.role));
}

async function getProfile(supabase: Awaited<ReturnType<typeof createRequestScopedSupabase>>, userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, avatar_url, phone, city, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    appLogger.warn('auth', 'Failed to load profile row', { userId, message: error.message });
    return null;
  }

  return (data as ProfileRow | null) ?? null;
}

async function getLegacyUser(supabase: Awaited<ReturnType<typeof createRequestScopedSupabase>>, userId: string): Promise<LegacyUserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, role, avatar_url, phone, city, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    appLogger.warn('auth', 'Failed to load legacy user row during cutover', { userId, message: error.message });
    return null;
  }

  return (data as LegacyUserRow | null) ?? null;
}

function logCutoverDiff(params: {
  userId: string;
  canonical: AuthUser;
  legacy: LegacyUserRow | null;
}) {
  const { userId, canonical, legacy } = params;
  const mismatch = !legacy ||
    legacy.email !== canonical.email ||
    legacy.name !== canonical.name ||
    legacy.role !== canonical.role ||
    (legacy.avatar_url || null) !== canonical.avatar_url ||
    (legacy.city || null) !== canonical.city;

  appLogger.info('auth.cutover', 'Auth cutover dual-read comparison', {
    userId,
    mismatch,
    canonicalRole: canonical.role,
    canonicalRoles: canonical.roles,
    canonicalProfileFound: canonical.profileFound,
    canonicalProfileMissing: canonical.profileMissing,
    legacyRole: legacy?.role ?? null,
    legacyPresent: Boolean(legacy),
  });
}

/**
 * Server-side canonical auth resolver.
 * Identity comes from Supabase Auth, profile from `public.profiles`, roles from `public.profile_roles`.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createRequestScopedSupabase();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      appLogger.warn('auth', 'Supabase auth.getUser failed', { message: error.message });
      return null;
    }

    const authUser = data.user;
    if (!authUser) return null;

    const [profile, roles, legacyUser] = await Promise.all([
      getProfile(supabase, authUser.id),
      getProfileRoles(supabase, authUser.id),
      isLegacyFallbackEnabled() ? getLegacyUser(supabase, authUser.id) : Promise.resolve(null),
    ]);

    const normalizedRoles = normalizeRoles(roles);
    const primaryRole = getPrimaryRole(normalizedRoles);

    let canonicalUser: AuthUser;

    if (!profile) {
      canonicalUser = buildUserFromAuth(authUser, normalizedRoles.length > 0 ? normalizedRoles : ['owner']);
      appLogger.warn('auth', 'Profile missing for authenticated user', {
        userId: authUser.id,
        roles: normalizedRoles,
      });
    } else {
      canonicalUser = {
        id: profile.id,
        email: profile.email,
        name: profile.display_name || authUser.email?.split('@')[0] || '',
        role: primaryRole,
        roles: normalizedRoles,
        isAdmin: normalizedRoles.includes('admin'),
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        city: profile.city,
        created_at: profile.created_at,
        profileFound: true,
        profileMissing: normalizedRoles.length === 0,
      };
    }

    if (isLegacyFallbackEnabled()) {
      logCutoverDiff({
        userId: authUser.id,
        canonical: canonicalUser,
        legacy: legacyUser,
      });

      if (!canonicalUser.profileFound && legacyUser) {
        return {
          ...canonicalUser,
          email: canonicalUser.email || legacyUser.email,
          name: canonicalUser.name || legacyUser.name,
          role: legacyUser.role,
          roles: normalizeRoles([legacyUser.role, ...canonicalUser.roles]),
          isAdmin: canonicalUser.isAdmin,
          avatar_url: canonicalUser.avatar_url || legacyUser.avatar_url,
          phone: canonicalUser.phone || legacyUser.phone,
          city: canonicalUser.city || legacyUser.city,
          created_at: canonicalUser.created_at || legacyUser.created_at,
        };
      }
    }

    return canonicalUser;
  } catch (error) {
    if (!isExpectedDynamicUsageError(error)) {
      appLogger.warn('auth', 'Failed to resolve authenticated user', {
        message: error instanceof Error ? error.message : 'unknown',
      });
    }
    return null;
  }
}
