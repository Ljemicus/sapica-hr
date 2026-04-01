import { getAvailability, getReviewsBySitter, getSitter } from '@/lib/db/marketplace';

export async function getSitterPageData(id: string) {
  const profile = await getSitter(id);
  if (!profile) {
    return { profile: null, reviews: [], availability: [] };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = await getReviewsBySitter(id) as any[];
  const availability = await getAvailability(id);

  return {
    profile,
    reviews,
    availability,
  };
}
