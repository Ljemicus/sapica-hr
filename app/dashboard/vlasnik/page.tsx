import type { Metadata } from 'next';
import { OwnerDashboardContent } from './owner-dashboard-content';
import { getOwnerDashboardData } from './owner-dashboard-data';

export const metadata: Metadata = {
  title: 'Nadzorna ploča — Vlasnik',
};

export default async function OwnerDashboardPage() {
  const { user, pets, bookings, reviewedBookingIds, activeWalks } = await getOwnerDashboardData();

  return (
    <OwnerDashboardContent
      user={user}
      pets={pets}
      bookings={bookings}
      reviewedBookingIds={reviewedBookingIds}
      activeWalks={activeWalks}
    />
  );
}
