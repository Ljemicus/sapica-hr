import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWalk, getUser, getPet } from '@/lib/db';
import { WalkTracker } from './walk-tracker';

export const metadata: Metadata = {
  title: 'GPS Tracking šetnje — PetPark',
};

export default async function WalkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const walk = await getWalk(id);
  if (!walk) notFound();

  const sitter = await getUser(walk.sitter_id);
  const pet = await getPet(walk.pet_id);

  return (
    <WalkTracker
      walk={walk}
      sitterName={sitter?.name || 'Nepoznat'}
      petName={pet?.name || 'Nepoznat'}
      petSpecies={pet?.species || 'dog'}
    />
  );
}
