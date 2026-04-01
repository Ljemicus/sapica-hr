import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import {
  getAvailability,
  getBookings,
  getRecentUpdatesBySitter,
  getReviewsBySitter,
  getSitter,
} from '@/lib/db/marketplace';
import type { SitterDashboardProps } from './components/sitter-dashboard-types';
import type { SitterDashboardBooking, SitterDashboardReview } from '@/lib/types';

function isSitterDashboardBooking(value: Awaited<ReturnType<typeof getBookings>>[number]): value is SitterDashboardBooking {
  return Boolean(value.owner && value.pet);
}

function isSitterDashboardReview(value: Awaited<ReturnType<typeof getReviewsBySitter>>[number]): value is SitterDashboardReview {
  return Boolean(value.reviewer);
}

export async function getSitterDashboardData(): Promise<SitterDashboardProps> {
  const user = await getAuthUser();
  if (!user) redirect('/prijava');
  if (user.role !== 'sitter') redirect('/');

  const profile = await getSitter(user.id);
  const bookings = (await getBookings(user.id, 'sitter')).filter(isSitterDashboardBooking);
  const reviews = (await getReviewsBySitter(user.id, 'sitter-dashboard')).filter(isSitterDashboardReview);
  const availability = await getAvailability(user.id);
  const recentUpdates = await getRecentUpdatesBySitter(user.id);

  return {
    user,
    profile,
    bookings,
    reviews,
    availability,
    recentUpdates,
  };
}
