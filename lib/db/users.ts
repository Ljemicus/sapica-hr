import { createClient } from '@/lib/supabase/server';
import type { User } from '@/lib/types';

export async function getUser(id: string): Promise<User | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error || !data) return null;
    return data as User;
  } catch {
    return null;
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data) return [];
    return data as User[];
  } catch {
    return [];
  }
}

export async function getUsersByRole(role: string): Promise<User[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('*').eq('role', role);
    if (error || !data) return [];
    return data as User[];
  } catch {
    return [];
  }
}
