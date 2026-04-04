import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { TrainerDashboardContent } from './trainer-dashboard-content';
import { createClient } from '@/lib/supabase/server';
import { getPrograms, getTrainerAvailability, getTrainerBookings } from '@/lib/db';

export const metadata = {
  title: 'Trener Dashboard — PetPark',
  description: 'Upravljajte profilom i programima treniranja.',
};

export default async function TrainerDashboardPage() {
  noStore();
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fdashboard%2Ftrainer');

  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from('trainers')
    .select('id, name, city, specializations, price_per_hour, certificates, rating, review_count, bio, certified, user_id, phone, email, address')
    .eq('user_id', user.id)
    .single();

  if (!trainer) {
    redirect('/onboarding/provider');
  }

  const programs = await getPrograms(trainer.id);
  const availability = await getTrainerAvailability(trainer.id);
  const bookings = await getTrainerBookings(trainer.id);

  return <TrainerDashboardContent trainer={trainer} initialPrograms={programs} initialAvailability={availability} initialBookings={bookings} />;
}
