import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SitterDashboardContent } from './sitter-dashboard-content';

export const metadata: Metadata = {
  title: 'Nadzorna ploča — Sitter',
};

export default async function SitterDashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/prijava');

  const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single();
  if (!userData || userData.role !== 'sitter') redirect('/');

  const [profileRes, bookingsRes, reviewsRes, availabilityRes] = await Promise.all([
    supabase.from('sitter_profiles').select('*').eq('user_id', authUser.id).single(),
    supabase.from('bookings')
      .select('*, owner:users!bookings_owner_id_fkey(name, avatar_url, email), pet:pets(name, species, breed, special_needs)')
      .eq('sitter_id', authUser.id)
      .order('created_at', { ascending: false }),
    supabase.from('reviews')
      .select('*, reviewer:users!reviews_reviewer_id_fkey(name, avatar_url)')
      .eq('reviewee_id', authUser.id)
      .order('created_at', { ascending: false }),
    supabase.from('availability')
      .select('*')
      .eq('sitter_id', authUser.id)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date'),
  ]);

  return (
    <SitterDashboardContent
      user={userData}
      profile={profileRes.data}
      bookings={bookingsRes.data || []}
      reviews={reviewsRes.data || []}
      availability={availabilityRes.data || []}
    />
  );
}
