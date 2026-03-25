import { createClient } from '@/lib/supabase/server';
import type { Review } from '@/lib/types';

export async function getReviews(): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:users!reviewer_id(*)')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Review[];
  } catch {
    return [];
  }
}

export async function getReviewsBySitter(sitterId: string): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:users!reviewer_id(*)')
      .eq('reviewee_id', sitterId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Review[];
  } catch {
    return [];
  }
}
