import { getGroomerAvailableDates, getGroomerReviews, getGroomer } from '@/lib/db/extensions';

export async function getGroomerPageData(id: string) {
  const groomer = await getGroomer(id);
  if (!groomer) {
    return { groomer: null, reviews: [], availableDates: new Set<string>() };
  }

  const reviews = await getGroomerReviews(id);
  const availableDatesList = await getGroomerAvailableDates(id);

  return {
    groomer,
    reviews,
    availableDates: new Set(availableDatesList),
  };
}
