import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { mockUsers, getUserById } from '@/lib/mock-data';
import type { User } from '@/lib/types';

export async function getUser(id: string): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return getUserById(id) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error || !data) return getUserById(id) ?? null;
    return data as User;
  } catch {
    return getUserById(id) ?? null;
  }
}

export async function getUsers(): Promise<User[]> {
  if (!isSupabaseConfigured()) {
    return mockUsers;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data) return mockUsers;
    return data as User[];
  } catch {
    return mockUsers;
  }
}

export async function getUsersByRole(role: string): Promise<User[]> {
  if (!isSupabaseConfigured()) {
    return mockUsers.filter((u) => u.role === role);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('*').eq('role', role);
    if (error || !data) return mockUsers.filter((u) => u.role === role);
    return data as User[];
  } catch {
    return mockUsers.filter((u) => u.role === role);
  }
}
