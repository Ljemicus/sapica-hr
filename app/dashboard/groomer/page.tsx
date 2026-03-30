import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { GroomerDashboardContent } from './groomer-dashboard-content';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Groomer Dashboard — PetPark',
  description: 'Upravljajte terminima i rasporedima za grooming.',
};

export default async function GroomerDashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=/dashboard/groomer');

  // Check if user has a groomer profile
  const supabase = await createClient();
  const { data: groomer } = await supabase
    .from('groomers')
    .select('*')
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
  const { data: bookings } = await supabase
    .from('groomer_bookings')
    .select('*')
    .eq('groomer_id', groomer.id)
    .gte('date', today)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  // Fetch availability
  const { data: availability } = await supabase
    .from('groomer_availability')
    .select('*')
    .eq('groomer_id', groomer.id)
    .gte('date', today)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  return (
    <GroomerDashboardContent
      groomer={groomer}
      bookings={bookings || []}
      availability={availability || []}
    />
  );
}
