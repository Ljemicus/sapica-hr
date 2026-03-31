import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getPetsByOwner, getBookings, getReviewedBookingIds, getWalksForUser, getUser } from '@/lib/db';
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

  const walks = await getWalksForUser(user.id);
  const activeOwnerWalks = walks.filter((walk) => walk.status === 'u_tijeku');

  const [ownerPets, activeSitters] = await Promise.all([
    getPetsByOwner(user.id, 'walk-label'),
    Promise.all([...new Set(activeOwnerWalks.map((walk) => walk.sitter_id))].map((sitterId) => getUser(sitterId))),
  ]);

  const petNamesById = new Map(ownerPets.map((pet) => [pet.id, pet.name]));
  const sitterNamesById = new Map(activeSitters.filter(Boolean).map((sitter) => [sitter!.id, sitter!.name]));

  const activeWalks = activeOwnerWalks
    .filter((walk) => petNamesById.has(walk.pet_id))
    .map((walk) => ({
      ...walk,
      sitterName: sitterNamesById.get(walk.sitter_id) || 'Nepoznato',
      petName: petNamesById.get(walk.pet_id) || 'Nepoznato',
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
