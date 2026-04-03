import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/auth';
import { TrainerDashboardContent } from './trainer-dashboard-content';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Trener Dashboard — PetPark',
  description: 'Upravljajte profilom i programima treniranja.',
};

export default async function TrainerDashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fdashboard%2Ftrainer');

  const supabase = await createClient();
  const { data: trainer } = await supabase
    .from('trainers')
    .select('id, name, city, specializations, price_per_hour, certificates, rating, review_count, bio, certified, user_id, phone, email, address')
    .eq('user_id', user.id)
    .single();

  if (!trainer) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Nemate trener profil</h1>
        <p className="text-muted-foreground mb-6">Kreirajte svoj profil kako biste mogli upravljati programima i primati klijente.</p>
        <Link
          href="/onboarding/provider"
          className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 transition-colors"
        >
          Kreiraj profil
        </Link>
      </div>
    );
  }

  return <TrainerDashboardContent trainer={trainer} />;
}
