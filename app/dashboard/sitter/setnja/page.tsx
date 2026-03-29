import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getBookings } from '@/lib/db';
import { WalkSession } from './walk-session';

export const metadata: Metadata = {
  title: 'Šetnja — Sitter',
};

export default async function SitterWalkPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava');
  if (user.role !== 'sitter') redirect('/');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings = await getBookings(user.id, 'sitter') as any[];
  const activeBookings = bookings.filter(
    (b) => b.status === 'accepted' && new Date(b.start_date) <= new Date() && new Date(b.end_date) >= new Date()
  );

  // Also include upcoming accepted bookings for today
  const todayBookings = bookings.filter(
    (b) => b.status === 'accepted'
  );

  const availableBookings = todayBookings.length > 0 ? todayBookings : activeBookings;

  return <WalkSession userId={user.id} bookings={availableBookings} />;
}
