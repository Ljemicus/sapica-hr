import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBooking, getUpdatesByBooking, getUser, getPet } from '@/lib/db';
import { UpdatesFeed } from './updates-feed';

export const metadata: Metadata = {
  title: 'Ažuriranja — PetPark',
  robots: { index: false, follow: false },
};

const DEMO_BOOKING_IDS = new Set([
  'book1111-1111-1111-1111-111111111111',
  'book2222-2222-2222-2222-222222222222',
  'bookffff-ffff-ffff-ffff-ffffffffffff',
]);

export default async function UpdatesPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const booking = await getBooking(bookingId);
  if (!booking) notFound();

  const updates = await getUpdatesByBooking(bookingId);
  const sitter = await getUser(booking.sitter_id);
  const pet = await getPet(booking.pet_id);

  const startDate = booking.start_date;
  const endDate = booking.end_date;
  const now = new Date().getTime();
  const totalDays = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
  const currentDay = Math.min(totalDays, Math.max(1, Math.ceil((now - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))));

  return (
    <UpdatesFeed
      updates={updates}
      bookingId={bookingId}
      sitterName={sitter?.name || 'Nepoznat'}
      petName={pet?.name || 'Nepoznat'}
      currentDay={currentDay}
      totalDays={totalDays}
      sitterId={booking.sitter_id}
      isDemo={DEMO_BOOKING_IDS.has(bookingId)}
    />
  );
}
