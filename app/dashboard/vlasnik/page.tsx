import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getPetsByOwner, getBookings, getReviewedBookingIds, getWalksForUser, getUser, getPet } from '@/lib/db';
import { OwnerDashboardContent } from './owner-dashboard-content';

export const metadata: Metadata = {
  title: 'Nadzorna ploča — Vlasnik',
};

export default async function OwnerDashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava');
  if (user.role !== 'owner') redirect('/');

  const pets = await getPetsByOwner(user.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = await getBookings(user.id, 'owner') as any[];

  const reviewedBookingIds = await getReviewedBookingIds(user.id);

  // Get active walks for owner's pets
  const ownerPetIds = pets.map(p => p.id);
  const walks = await getWalksForUser(user.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeWalks: any[] = [];
  for (const w of walks) {
    if (ownerPetIds.includes(w.pet_id) && w.status === 'u_tijeku') {
      const sitterUser = await getUser(w.sitter_id);
      const petData = await getPet(w.pet_id);
      activeWalks.push({
        ...w,
        sitterName: sitterUser?.name || 'Nepoznato',
        petName: petData?.name || 'Nepoznato',
      });
    }
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
