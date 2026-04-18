import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { robotsMeta } from '@/lib/seo/indexability';
import type { Trainer } from '@/lib/types';
import { TrainerProfileLoader } from './trainer-profile-loader';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface TrainerPageProps {
  params: Promise<{ id: string }>;
}

function createTrainerShell(id: string): Trainer {
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
  return {
    title: `Profil trenera ${id}`,
    description: 'Profil trenera na PetParku.',
    robots: robotsMeta(false),
  };
}

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { id } = await params;
  const trainer = createTrainerShell(id);

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
