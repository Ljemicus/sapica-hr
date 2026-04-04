import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { User } from '@/lib/types';

export async function getUser(id: string): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('id, email, name, role, avatar_url, phone, city, created_at').eq('id', id).single();
    if (error || !data) return null;
    return data as User;
  } catch {
    return null;
  }
}

type UserFields = 'full' | 'admin-list';

export async function getUsers(fields: UserFields = 'full'): Promise<User[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = await createClient();
    const selectClause = fields === 'admin-list'
      ? 'id, email, name, role, avatar_url, city, created_at'
      : '*';
    const { data, error } = await supabase.from('users').select(selectClause);
    if (error || !data) return [];
    return data as unknown as User[];
  } catch {
    return [];
  }
}

export async function updateUserProfile(
  id: string,
  updates: Partial<Omit<User, 'id' | 'created_at'>>
): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) return null;
    return data as User;
  } catch {
    return null;
  }
}

export async function getUsersByRole(role: string): Promise<User[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('id, email, name, role, avatar_url, phone, city, created_at').eq('role', role);
    if (error || !data) return [];
    return data as unknown as User[];
  } catch {
    return [];
  }
}
