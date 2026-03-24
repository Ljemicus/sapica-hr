import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTrainerById, getTrainingProgramsForTrainer } from '@/lib/mock-data';
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

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { id } = await params;
  const trainer = getTrainerById(id);
  if (!trainer) return notFound();
  const programs = getTrainingProgramsForTrainer(id);
  return <TrainerProfile trainer={trainer} programs={programs} />;
}
