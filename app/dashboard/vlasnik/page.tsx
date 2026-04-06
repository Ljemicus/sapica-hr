import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OwnerDashboardContent } from './owner-dashboard-content';
import { getOwnerDashboardData } from './owner-dashboard-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nadzorna ploča — Vlasnik',
};

export default async function OwnerDashboardPage() {
  noStore();
  const { user, pets, bookings, reviewedBookingIds, activeWalks } = await getOwnerDashboardData();

  // Redirect to onboarding for first-time users (no pets yet)
  // After completing or skipping onboarding, users won't be redirected again
  // because the wizard stores progress in localStorage
  if (pets.length === 0) {
    redirect('/dashboard/vlasnik/onboarding');
  }

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
