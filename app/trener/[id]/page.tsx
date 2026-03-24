import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTrainerById, getTrainingProgramsForTrainer, getTrainerReviews } from '@/lib/mock-data';
import { TrainerProfile } from './trainer-profile';

interface TrainerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TrainerPageProps): Promise<Metadata> {
  const { id } = await params;
  const trainer = getTrainerById(id);
  return {
    title: trainer ? `${trainer.name} — Trener pasa u ${trainer.city}` : 'Trener profil',
    description: trainer ? `Pogledajte profil trenera ${trainer.name}. Zakažite dresuru za svog psa.` : '',
  };
}

function generateMockAvailability(): boolean[] {
  const seed = Date.now();
  return Array.from({ length: 14 }, (_, i) => {
    const hash = ((seed + i * 2654435761) >>> 0) % 100;
    return hash < 60;
  });
}

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { id } = await params;
  const trainer = getTrainerById(id);
  if (!trainer) return notFound();

  const programs = getTrainingProgramsForTrainer(id);
  const reviews = getTrainerReviews(id);
  const availability = generateMockAvailability();

  return <TrainerProfile trainer={trainer} programs={programs} reviews={reviews} availability={availability} />;
}
