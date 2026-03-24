import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Review } from '../types/database';

export function useReviews(sitterUserId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async (userId?: string) => {
    const targetId = userId ?? sitterUserId;
    if (!targetId) return;
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:users!reviews_reviewer_id_fkey(*)')
      .eq('reviewee_id', targetId)
      .order('created_at', { ascending: false });
    setReviews((data ?? []) as Review[]);
    setLoading(false);
  }, [sitterUserId]);

  const createReview = async (review: {
    booking_id: string;
    reviewer_id: string;
    reviewee_id: string;
    rating: number;
    text?: string;
  }) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select('*, reviewer:users!reviews_reviewer_id_fkey(*)')
      .single();
    if (data) setReviews(prev => [data as Review, ...prev]);
    return { data: data as Review | null, error: error?.message ?? null };
  };

  return { reviews, loading, fetchReviews, createReview };
}
