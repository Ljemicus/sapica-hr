'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { setSentryUser } from '@/lib/error-tracking';
import type { UserRole } from '@/lib/types';
import type { AuthUser } from '@/lib/auth';

function isSupabaseConfiguredClient(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && url.length > 0 && !url.includes('placeholder') && key && key.length > 0 && !key.includes('placeholder'));
}

interface ProfileRow {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
}

interface ProfileRoleRow {
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

function isUserRole(value: unknown): value is UserRole {
  return value === 'owner' || value === 'sitter' || value === 'admin';
}

function normalizeRoles(values: unknown[]): UserRole[] {
  const roles = values.filter(isUserRole);
  return Array.from(new Set(roles));
}

function getPrimaryRole(roles: UserRole[]): UserRole {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('sitter')) return 'sitter';
  return 'owner';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUserProfile = useCallback(async (authUser: SupabaseUser): Promise<AuthUser> => {
    const [{ data: profileData }, { data: rolesData }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url, phone, city, created_at')
        .eq('id', authUser.id)
        .maybeSingle(),
      supabase
        .from('profile_roles')
        .select('role')
        .eq('profile_id', authUser.id),
    ]);

    const roles = normalizeRoles(((rolesData ?? []) as ProfileRoleRow[]).map((row) => row.role));
    const primaryRole = getPrimaryRole(roles);
    const profile = profileData as ProfileRow | null;

    const resolvedUser: AuthUser = {
      id: authUser.id,
      email: profile?.email || authUser.email || '',
      name: profile?.display_name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
      role: primaryRole,
      roles,
      isAdmin: roles.includes('admin'),
      avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
      phone: profile?.phone || null,
      city: profile?.city || authUser.user_metadata?.city || null,
      created_at: profile?.created_at || authUser.created_at,
      profileFound: Boolean(profile),
      profileMissing: !profile || roles.length === 0,
    };

    setSentryUser({
      id: resolvedUser.id,
      email: resolvedUser.email,
      name: resolvedUser.name,
    });

    return resolvedUser;
  }, [supabase]);

  useEffect(() => {
    if (!isSupabaseConfiguredClient()) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setSupabaseUser(s?.user ?? null);
      if (s?.user) {
        const profile = await fetchUserProfile(s.user);
        setUser(profile);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setSupabaseUser(s?.user ?? null);
        if (s?.user) {
          const profile = await fetchUserProfile(s.user);
          setUser(profile);
        } else {
          setSentryUser(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchUserProfile]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfiguredClient()) {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      await supabase.auth.signOut();
    }
    setSentryUser(null);
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, supabaseUser, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
