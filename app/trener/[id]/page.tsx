import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { robotsMeta, shouldIndexTrainer } from '@/lib/seo/indexability';
import { getProviderTrainerById } from '@/lib/db/provider-trainers';
import { toPublicTrainer } from '@/lib/public-profiles';
import { TrainerProfileLoader } from './trainer-profile-loader';

interface TrainerPageProps {
  params: Promise<{ id: string }>;
}

async function createTrainerShell(id: string) {
  const trainer = await getProviderTrainerById(id);
  if (trainer) return toPublicTrainer(trainer, []);

  return {
    id,
    name: 'Profil trenera',
    city: 'Hrvatska',
    description: 'Podaci o treneru učitavaju se.',
    specializations: ['osnovna'],
    certificates: [],
    certified: false,
    rating: 0,
    reviewCount: 0,
    priceFrom: null,
    services: ['osnovna'],
    availability: [],
    profileImage: null,
    verified: false,
    category: 'trainer' as const,
    pricePerHour: 0,
    programs: [],
  };
}

export async function generateMetadata({ params }: TrainerPageProps): Promise<Metadata> {
  const { id } = await params;
  const trainer = await createTrainerShell(id);
  return {
    title: { absolute: `${trainer.name} | PetPark` },
    description: trainer.description || 'Profil trenera na PetParku.',
    alternates: { canonical: `/trener/${id}` },
    robots: robotsMeta(shouldIndexTrainer({
      id: trainer.id, name: trainer.name, city: trainer.city, specializations: trainer.specializations as any,
      price_per_hour: trainer.pricePerHour, certificates: trainer.certificates,
      rating: trainer.rating, review_count: trainer.reviewCount, certified: trainer.certified,
      bio: trainer.description || '',
    })),
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
