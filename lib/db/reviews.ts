import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { mockReviews, getReviewsForSitter as mockGetReviewsForSitter } from '@/lib/mock-data';
import type { Review, SitterDashboardReview } from '@/lib/types';

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
    if (error || !data) return [];
    return data as Review[];
  } catch {
    return [];
  }
}

type ReviewFields = 'full' | 'sitter-dashboard';

function pickMockReviewFields(reviews: Review[], fields: 'sitter-dashboard'): SitterDashboardReview[];
function pickMockReviewFields(reviews: Review[], fields?: 'full'): Review[];
function pickMockReviewFields(reviews: Review[], fields: ReviewFields = 'full'): Review[] | SitterDashboardReview[] {
  if (fields === 'full') return reviews;

  return reviews
    .filter((review): review is SitterDashboardReview => Boolean(review.reviewer))
    .map((review) => ({
      ...review,
      reviewer: {
        ...review.reviewer,
        email: review.reviewer.email || '',
        role: review.reviewer.role || 'owner',
        phone: review.reviewer.phone || null,
        city: review.reviewer.city || null,
        created_at: review.reviewer.created_at || '',
      },
    }));
}

export async function getReviewsBySitter(sitterId: string, fields: 'sitter-dashboard'): Promise<SitterDashboardReview[]>;
export async function getReviewsBySitter(sitterId: string, fields?: 'full'): Promise<Review[]>;
export async function getReviewsBySitter(sitterId: string, fields: ReviewFields = 'full'): Promise<Review[] | SitterDashboardReview[]> {
  if (!isSupabaseConfigured()) {
    const sitterReviews = mockGetReviewsForSitter(sitterId);
    return fields === 'sitter-dashboard'
      ? pickMockReviewFields(sitterReviews, 'sitter-dashboard')
      : pickMockReviewFields(sitterReviews, 'full');
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
    if (error || !data) return [];
    return fields === 'sitter-dashboard' ? (data as unknown as SitterDashboardReview[]) : (data as unknown as Review[]);
  } catch {
    return [];
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
      return [];
    }
    return data.map((r) => r.booking_id);
  } catch {
    return [];
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
    return null;
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
