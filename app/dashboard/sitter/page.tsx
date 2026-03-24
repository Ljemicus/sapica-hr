import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getSitterProfile, getBookingsForUser, getReviewsForSitter, mockAvailability } from '@/lib/mock-data';
import { SitterDashboardContent } from './sitter-dashboard-content';

export const metadata: Metadata = {
  title: 'Nadzorna ploča — Sitter',
};

export default async function SitterDashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava');
  if (user.role !== 'sitter') redirect('/');

  const profile = getSitterProfile(user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = getBookingsForUser(user.id, 'sitter') as any[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = getReviewsForSitter(user.id) as any[];

  const today = new Date().toISOString().split('T')[0];
  const availability = mockAvailability
    .filter(a => a.sitter_id === user.id && a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <SitterDashboardContent
      user={user}
      profile={profile}
      bookings={bookings}
      reviews={reviews}
      availability={availability}
    />
  );
}
