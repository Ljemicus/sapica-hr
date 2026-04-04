import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getBookings, getPetsByOwner, getReviewedBookingIds, getUser, getWalksForUser } from '@/lib/db/marketplace';
import type { OwnerDashboardBooking, OwnerDashboardProps } from './components/owner-dashboard-types';

function isOwnerDashboardBooking(value: Awaited<ReturnType<typeof getBookings>>[number]): value is OwnerDashboardBooking {
  return Boolean(value.sitter && value.pet);
}

export async function getOwnerDashboardData(): Promise<OwnerDashboardProps> {
  const user = await getAuthUser();
  if (!user) redirect('/prijava');
  if (user.role !== 'owner') redirect('/dashboard/sitter');

  const pets = await getPetsByOwner(user.id);
  const bookings = (await getBookings(user.id, 'owner')).filter(isOwnerDashboardBooking);
  const reviewedBookingIds = await getReviewedBookingIds(user.id);

  const walks = await getWalksForUser(user.id);
  const activeOwnerWalks = walks.filter((walk) => walk.status === 'u_tijeku');

  const activeSitters = await Promise.all(
    [...new Set(activeOwnerWalks.map((walk) => walk.sitter_id))].map((sitterId) => getUser(sitterId)),
  );

  const petNamesById = new Map(pets.map((pet) => [pet.id, pet.name]));
  const sitterNamesById = new Map(activeSitters.filter(Boolean).map((sitter) => [sitter!.id, sitter!.name]));

  const activeWalks = activeOwnerWalks
    .filter((walk) => petNamesById.has(walk.pet_id))
    .map((walk) => ({
      ...walk,
      sitterName: sitterNamesById.get(walk.sitter_id) || 'Nepoznato',
      petName: petNamesById.get(walk.pet_id) || 'Nepoznato',
    }));

  return {
    user,
    pets,
    bookings,
    reviewedBookingIds,
    activeWalks,
  };
}
