import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { GroomerDashboardContent } from './groomer-dashboard-content';
import { createClient } from '@/lib/supabase/server';
import { getGroomerBookings } from '@/lib/db';

export const metadata = {
  title: 'Groomer Dashboard — PetPark',
  description: 'Upravljajte terminima i rasporedima za grooming.',
};

export default async function GroomerDashboardPage() {
  noStore();
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fdashboard%2Fgroomer');

  // Check if user has a groomer profile
  const supabase = await createClient();
  const { data: groomer } = await supabase
    .from('groomers')
    .select('id, name, city, services, prices, rating, review_count, bio, verified, specialization, user_id, phone, email, address, working_hours')
    .eq('user_id', user.id)
    .single();

  // Check if groomer profile exists
  if (!groomer) {
    redirect('/dashboard/groomer/onboarding');
  }

  // Check if groomer profile is incomplete (missing key fields)
  const isIncomplete = !groomer.bio || !groomer.address || !groomer.services || groomer.services.length === 0;
  if (isIncomplete) {
    redirect('/dashboard/groomer/onboarding');
  }

  // Fetch bookings
  const today = new Date().toISOString().split('T')[0];
  const bookings = await getGroomerBookings(groomer.id, { fromDate: today, fields: 'dashboard-list' });

  // Fetch availability
  const { data: availability } = await supabase
    .from('groomer_availability')
    .select('id, groomer_id, date, start_time, end_time, slot_duration_minutes, is_available')
    .eq('groomer_id', groomer.id)
    .gte('date', today)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  return (
    <GroomerDashboardContent
      groomer={groomer}
      bookings={bookings}
      availability={availability || []}
    />
  );
}
