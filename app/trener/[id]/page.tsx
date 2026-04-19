import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { robotsMeta } from '@/lib/seo/indexability';
import type { Trainer } from '@/lib/types';
import { getProviderTrainerById } from '@/lib/db/provider-trainers';
import { TrainerProfileLoader } from './trainer-profile-loader';

interface TrainerPageProps {
  params: Promise<{ id: string }>;
}

async function createTrainerShell(id: string): Promise<Trainer> {
  const trainer = await getProviderTrainerById(id);
  if (trainer) return trainer;

  return {
    id,
    name: 'Profil trenera',
    city: 'Hrvatska',
    specializations: ['osnovna'],
    price_per_hour: 0,
    certificates: [],
    rating: 0,
    review_count: 0,
    bio: 'Podaci o treneru učitavaju se.',
    certified: false,
    address: '',
    phone: '',
    email: '',
  };
}

export async function generateMetadata({ params }: TrainerPageProps): Promise<Metadata> {
  const { id } = await params;
  const trainer = await createTrainerShell(id);
  return {
    title: { absolute: `${trainer.name} | PetPark` },
    description: trainer.bio || 'Profil trenera na PetParku.',
    alternates: { canonical: `/trener/${id}` },
    robots: robotsMeta(false),
  };
}

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { id } = await params;
  const trainer = await createTrainerShell(id);

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Školovanje pasa', href: '/dresura' },
        { label: trainer.name, href: `/trener/${id}` },
      ]} />
      <TrainerProfileLoader id={id} initialTrainer={trainer} />
    </>
  );
}
