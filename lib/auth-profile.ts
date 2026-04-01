import type { User } from '@/lib/types';

interface UpsertResult {
  error: { message?: string } | null;
}

interface ProfileTableClient {
  upsert: (
    values: Record<string, unknown>,
    options?: { onConflict?: string }
  ) => Promise<UpsertResult>;
}

export interface AuthProfileSupabaseLike {
  from: (table: 'users' | 'sitter_profiles') => ProfileTableClient;
}

export async function syncUserProfile(params: {
  supabase: AuthProfileSupabaseLike;
  user: Pick<User, 'id' | 'email' | 'name' | 'role' | 'avatar_url' | 'city'>;
}) {
  const { supabase, user } = params;

  const { error } = await supabase.from('users').upsert(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      city: user.city,
    },
    { onConflict: 'id' }
  );

  return error || null;
}

export async function ensureSitterProfile(params: {
  supabase: AuthProfileSupabaseLike;
  userId: string;
  city: string | null;
}) {
  const { supabase, userId, city } = params;

  const { error } = await supabase.from('sitter_profiles').upsert(
    {
      user_id: userId,
      city,
    },
    { onConflict: 'user_id' }
  );

  return error || null;
}
