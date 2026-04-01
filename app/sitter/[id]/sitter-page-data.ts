import { getAvailability, getReviewsBySitter, getSitter } from '@/lib/db/marketplace';
import type { Availability, PublicSitterReview, Review, SitterProfile } from '@/lib/types';

export async function getSitterPageData(id: string): Promise<{
  profile: (SitterProfile & { user: NonNullable<SitterProfile['user']> }) | null;
  reviews: PublicSitterReview[];
  availability: Availability[];
}> {
  const profile = await getSitter(id);
  if (!profile) {
    return { profile: null, reviews: [], availability: [] };
  }

  const reviews = (await getReviewsBySitter(id)) as Review[];
  const availability = await getAvailability(id);

  return {
    profile: profile as SitterProfile & { user: NonNullable<SitterProfile['user']> },
    reviews: reviews.filter((review): review is PublicSitterReview => Boolean(review.reviewer && review.booking?.service_type)),
    availability,
  };
}
