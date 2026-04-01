import type { Metadata } from 'next';
import { isSameDay } from 'date-fns';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getBookings } from '@/lib/db';
import { WalkSession } from './walk-session';

export const metadata: Metadata = {
  title: 'Šetnja — Sitter',
};

export default async function SitterWalkPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fdashboard%2Fsitter%2Fsetnja');
  if (user.role !== 'sitter') redirect('/');

  const bookings = await getBookings(user.id, 'sitter', 'walk-selector');
  const now = new Date();

  const activeBookings = bookings.filter(
    (booking) => booking.status === 'accepted' && new Date(booking.start_date) <= now && new Date(booking.end_date) >= now
  );

  const todayBookings = bookings.filter(
    (booking) => booking.status === 'accepted' && isSameDay(new Date(booking.start_date), now)
  );

  const availableBookings = activeBookings.length > 0 ? activeBookings : todayBookings;

  return <WalkSession userId={user.id} bookings={availableBookings} />;
}
