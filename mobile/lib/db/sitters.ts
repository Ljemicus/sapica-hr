import { supabase } from '../supabase';
import { Sitter, Review } from '../../types';

export async function getSitters(): Promise<Sitter[]> {
  const { data, error } = await supabase
    .from('sitter_profiles')
    .select('*, users!inner(name, avatar_url)')
    .order('rating_avg', { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.user_id,
    name: row.users.name,
    avatar: row.users.avatar_url || '',
    rating: Number(row.rating_avg) || 0,
    reviewCount: row.review_count || 0,
    city: row.city || '',
    services: row.services || [],
    pricePerHour: row.prices?.perHour || 0,
    description: row.bio || '',
    verified: row.verified || false,
  }));
}

export async function getSitter(id: string): Promise<Sitter | null> {
  const { data, error } = await supabase
    .from('sitter_profiles')
    .select('*, users!inner(name, avatar_url)')
    .eq('user_id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.user_id,
    name: data.users.name,
    avatar: data.users.avatar_url || '',
    rating: Number(data.rating_avg) || 0,
    reviewCount: data.review_count || 0,
    city: data.city || '',
    services: data.services || [],
    pricePerHour: data.prices?.perHour || 0,
    description: data.bio || '',
    verified: data.verified || false,
  };
}

export async function getSitterReviews(sitterId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:users!reviewer_id(name, avatar_url)')
    .eq('reviewee_id', sitterId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    userName: row.reviewer?.name || 'Korisnik',
    userAvatar: row.reviewer?.avatar_url || '',
    rating: row.rating,
    text: row.comment || '',
    date: new Date(row.created_at).toISOString().split('T')[0],
  }));
}
