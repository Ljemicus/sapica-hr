/**
 * Reviews data layer.
 * Public sitter reviews disabled — returns empty results.
 * Will be re-enabled when verified review data is available.
 */
import type { Review, SitterDashboardReview } from '@/lib/types';

export async function getReviews(): Promise<Review[]> {
  return [];
}

export async function getReviewsBySitter(sitterId: string, fields: 'sitter-dashboard'): Promise<SitterDashboardReview[]>;
export async function getReviewsBySitter(sitterId: string, fields?: 'full'): Promise<Review[]>;
export async function getReviewsBySitter(_sitterId: string, _fields: 'full' | 'sitter-dashboard' = 'full'): Promise<Review[] | SitterDashboardReview[]> {
  return [];
}

export async function getReviewedBookingIds(_userId: string): Promise<string[]> {
  return [];
}

export async function createReview(_reviewData: {
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
}): Promise<Review | null> {
  return null;
}
