import {
  getProviderGroomerAvailableDates,
  getProviderGroomerById,
  getProviderGroomerReviews,
} from '@/lib/db/provider-groomers';

export async function getGroomerPageData(id: string) {
  const groomer = await getProviderGroomerById(id);
  if (!groomer) {
    return { groomer: null, reviews: [], availableDates: new Set<string>() };
  }

  const reviews = await getProviderGroomerReviews(id);
  const availableDatesList = await getProviderGroomerAvailableDates(id);

  return {
    groomer,
    reviews,
    availableDates: new Set(availableDatesList),
  };
}
