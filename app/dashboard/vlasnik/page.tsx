import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMockUser } from '@/lib/mock-auth';
import { getPetsForOwner, getBookingsForUser, getReviewsByUser, mockWalks, mockUsers, mockPets } from '@/lib/mock-data';
import { OwnerDashboardContent } from './owner-dashboard-content';

export const metadata: Metadata = {
  title: 'Nadzorna ploča — Vlasnik',
};

export default async function OwnerDashboardPage() {
  const user = await getMockUser();
  if (!user) redirect('/prijava');
  if (user.role !== 'owner') redirect('/');

  const pets = getPetsForOwner(user.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = getBookingsForUser(user.id, 'owner') as any[];

  const existingReviews = getReviewsByUser(user.id);
  const reviewedBookingIds = existingReviews.map(r => r.booking_id);

  const ownerPetIds = pets.map(p => p.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeWalks = (mockWalks.filter(w => ownerPetIds.includes(w.pet_id) && w.status === 'u_tijeku') as any[]).map(w => ({
    ...w,
    sitterName: mockUsers.find(u => u.id === w.sitter_id)?.name || 'Nepoznato',
    petName: mockPets.find(p => p.id === w.pet_id)?.name || 'Nepoznato',
  }));

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
