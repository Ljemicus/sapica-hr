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
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fdashboard%2Fgroomer');

  // Check if user has a groomer profile
  const supabase = await createClient();
  const { data: groomer } = await supabase
    .from('groomers')
    .select('id, name, city, services, prices, rating, reviews, bio, verified, specialization, user_id, phone, email, address, working_hours')
    .eq('user_id', user.id)
    .single();

  if (!groomer) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Nemate groomer profil</h1>
        <p className="text-muted-foreground">Ova stranica je za registrirane groomere na PetPark platformi.</p>
      </div>
    );
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
