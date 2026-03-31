import type { User } from '@/lib/types';

export async function syncUserProfile(params: {
  supabase: any;
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
  supabase: any;
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
