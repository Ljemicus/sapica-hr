import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import {
  getAvailability,
  getBookings,
  getRecentUpdatesBySitter,
  getReviewsBySitter,
  getSitter,
} from '@/lib/db/marketplace';

export async function getSitterDashboardData() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava');
  if (user.role !== 'sitter') redirect('/');

  const profile = await getSitter(user.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = await getBookings(user.id, 'sitter') as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = await getReviewsBySitter(user.id, 'sitter-dashboard') as any[];
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
