import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { PublisherProfile, PublisherProfileType } from '@/lib/types';

export async function getPublisherProfile(userId: string): Promise<PublisherProfile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('publisher_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data as PublisherProfile;
  } catch {
    return null;
  }
}

export async function createPublisherProfile(
  userId: string,
  type: PublisherProfileType,
  displayName: string,
  extra?: Partial<Pick<PublisherProfile, 'bio' | 'city' | 'phone' | 'avatar_url'>>
): Promise<PublisherProfile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('publisher_profiles')
      .insert({
        user_id: userId,
        type,
        display_name: displayName,
        bio: extra?.bio ?? null,
        city: extra?.city ?? null,
        phone: extra?.phone ?? null,
        avatar_url: extra?.avatar_url ?? null,
        is_onboarded: false,
      })
      .select()
      .single();
    if (error || !data) return null;
    return data as PublisherProfile;
  } catch {
    return null;
  }
}

export async function updatePublisherProfile(
  userId: string,
  updates: Partial<Omit<PublisherProfile, 'id' | 'user_id' | 'created_at'>>
): Promise<PublisherProfile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('publisher_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    if (error || !data) return null;
    return data as PublisherProfile;
  } catch {
    return null;
  }
}

export async function markOnboarded(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('publisher_profiles')
      .update({ is_onboarded: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}
