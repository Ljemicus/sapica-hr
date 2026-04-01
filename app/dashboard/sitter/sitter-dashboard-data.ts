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

export async function getSitterDashboardData(): Promise<SitterDashboardProps> {
  const user = await getAuthUser();
  if (!user) redirect('/prijava');
  if (user.role !== 'sitter') redirect('/');

  const profile = await getSitter(user.id);
  const bookings = (await getBookings(user.id, 'sitter')) as SitterDashboardProps['bookings'];
  const reviews = await getReviewsBySitter(user.id, 'sitter-dashboard');
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
