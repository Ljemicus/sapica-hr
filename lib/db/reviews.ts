import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { mockReviews, getReviewsForSitter as mockGetReviewsForSitter } from '@/lib/mock-data';
import type { Review } from '@/lib/types';

export async function getReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured()) {
    return mockReviews;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:users!reviewer_id(*)')
      .order('created_at', { ascending: false });
    if (error || !data) return mockReviews;
    return data as Review[];
  } catch {
    return mockReviews;
  }
}

export async function getReviewsBySitter(sitterId: string): Promise<Review[]> {
  if (!isSupabaseConfigured()) {
    return mockGetReviewsForSitter(sitterId);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:users!reviewer_id(*)')
      .eq('reviewee_id', sitterId)
      .order('created_at', { ascending: false });
    if (error || !data) return mockGetReviewsForSitter(sitterId);
    return data as Review[];
  } catch {
    return mockGetReviewsForSitter(sitterId);
  }
}

export async function getReviewedBookingIds(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return mockReviews
      .filter((r) => r.reviewer_id === userId)
      .map((r) => r.booking_id);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('booking_id')
      .eq('reviewer_id', userId);
    if (error || !data) {
      return mockReviews.filter((r) => r.reviewer_id === userId).map((r) => r.booking_id);
    }
    return data.map((r) => r.booking_id);
  } catch {
    return mockReviews.filter((r) => r.reviewer_id === userId).map((r) => r.booking_id);
  }
}

export async function createReview(reviewData: {
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
}): Promise<Review | null> {
  if (!isSupabaseConfigured()) {
    const mockReview: Review = {
      ...reviewData,
      id: `mock-review-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    return mockReview;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select('*, reviewer:users!reviewer_id(*)')
      .single();
    if (error || !data) return null;
    return data as Review;
  } catch {
    return null;
  }
}
