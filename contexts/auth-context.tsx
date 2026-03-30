'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { getMockUserIdClient, clearMockUserClient } from '@/lib/mock-auth-client';
import type { User } from '@/lib/types';

function isSupabaseConfiguredClient(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && url.length > 0 && !url.includes('placeholder') && key && key.length > 0 && !key.includes('placeholder'));
}

interface AuthContextType {
  user: User | null;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUserProfile = useCallback(async (authUser: SupabaseUser): Promise<User | null> => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (data) return data as User;

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
  }, [supabase]);

  const loadMockUser = useCallback(async () => {
    const mockUserId = getMockUserIdClient();
    if (mockUserId) {
      // Fetch mock user data from API
      try {
        const res = await fetch(`/api/auth/me`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // Ignore - user stays null
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfiguredClient()) {
      // Mock auth mode: čitaj user iz cookie-a
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadMockUser().then(() => {}).catch(() => {});
      return;
    }

    // Supabase auth mode
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
      async (event, s) => {
        setSession(s);
        setSupabaseUser(s?.user ?? null);
        if (s?.user) {
          const profile = await fetchUserProfile(s.user);
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchUserProfile, loadMockUser]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfiguredClient()) {
      await supabase.auth.signOut();
    } else {
      clearMockUserClient();
    }
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
