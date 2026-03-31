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

type ReviewFields = 'full' | 'sitter-dashboard';

function pickMockReviewFields(reviews: Review[], fields: ReviewFields = 'full'): Review[] {
  if (fields === 'full') return reviews;

  return reviews.map((review) => ({
    id: review.id,
    booking_id: review.booking_id,
    reviewer_id: review.reviewer_id,
    reviewee_id: review.reviewee_id,
    rating: review.rating,
    comment: review.comment,
    created_at: review.created_at,
    reviewer: review.reviewer
      ? {
          id: review.reviewer.id,
          email: '',
          name: review.reviewer.name,
          role: 'owner',
          avatar_url: review.reviewer.avatar_url,
          phone: null,
          city: null,
          created_at: '',
        }
      : undefined,
  }));
}

export async function getReviewsBySitter(sitterId: string, fields: ReviewFields = 'full'): Promise<Review[]> {
  if (!isSupabaseConfigured()) {
    return pickMockReviewFields(mockGetReviewsForSitter(sitterId), fields);
  }
  try {
    const supabase = await createClient();
    const selectClause = fields === 'sitter-dashboard'
      ? 'id, booking_id, reviewer_id, reviewee_id, rating, comment, created_at, reviewer:users!reviewer_id(id, name, avatar_url)'
      : '*, reviewer:users!reviewer_id(*)';
    const { data, error } = await supabase
      .from('reviews')
      .select(selectClause)
      .eq('reviewee_id', sitterId)
      .order('created_at', { ascending: false });
    if (error || !data) return pickMockReviewFields(mockGetReviewsForSitter(sitterId), fields);
    return data as unknown as Review[];
  } catch {
    return pickMockReviewFields(mockGetReviewsForSitter(sitterId), fields);
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
