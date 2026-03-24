import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OwnerDashboardContent } from './owner-dashboard-content';

export const metadata: Metadata = {
  title: 'Nadzorna ploča — Vlasnik',
};

export default async function OwnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/prijava');

  const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single();
  if (!userData || userData.role !== 'owner') redirect('/');

  const [petsRes, bookingsRes] = await Promise.all([
    supabase.from('pets').select('*').eq('owner_id', authUser.id).order('created_at', { ascending: false }),
    supabase.from('bookings').select('*, sitter:users!bookings_sitter_id_fkey(name, avatar_url), pet:pets(name, species)').eq('owner_id', authUser.id).order('created_at', { ascending: false }),
  ]);

  // Get bookings that are completed but don't have reviews yet
  const completedBookingIds = (bookingsRes.data || []).filter(b => b.status === 'completed').map(b => b.id);
  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('booking_id')
    .eq('reviewer_id', authUser.id)
    .in('booking_id', completedBookingIds.length > 0 ? completedBookingIds : ['none']);

  const reviewedBookingIds = new Set((existingReviews || []).map(r => r.booking_id));

  return (
    <OwnerDashboardContent
      user={userData}
      pets={petsRes.data || []}
      bookings={bookingsRes.data || []}
      reviewedBookingIds={Array.from(reviewedBookingIds)}
    />
  );
}
