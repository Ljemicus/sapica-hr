import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTrainer, getPrograms, getTrainerReviews, getAvailability } from '@/lib/db';
import { TrainerProfile } from './trainer-profile';

interface TrainerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TrainerPageProps): Promise<Metadata> {
  const { id } = await params;
  const trainer = await getTrainer(id);
  return {
    title: trainer ? `${trainer.name} — Trener pasa u ${trainer.city}` : 'Trener profil',
    description: trainer ? `Pogledajte profil trenera ${trainer.name}. Zakažite dresuru za svog psa.` : '',
  };
}

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { id } = await params;
  const trainer = await getTrainer(id);
  if (!trainer) return notFound();

  const programs = await getPrograms(id);
  const reviews = await getTrainerReviews(id);

  // Query real availability from Supabase, convert to boolean[] for next 14 days
  const availabilityRecords = await getAvailability(id);
  const availableDates = new Set(
    availabilityRecords.filter(a => a.available).map(a => a.date)
  );
  const today = new Date();
  const availability = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    return availableDates.has(dateStr);
  });

  return <TrainerProfile trainer={trainer} programs={programs} reviews={reviews} availability={availability} />;
}
