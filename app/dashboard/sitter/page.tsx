import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { SitterDashboardContent } from './sitter-dashboard-content';
import { getSitterDashboardData } from './sitter-dashboard-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nadzorna ploča — Sitter',
};

export default async function SitterDashboardPage() {
  noStore();
  const { user, profile, bookings, reviews, availability, recentUpdates } = await getSitterDashboardData();

  return (
    <SitterDashboardContent
      user={user}
      profile={profile}
      bookings={bookings}
      reviews={reviews}
      availability={availability}
      recentUpdates={recentUpdates}
    />
  );
}
