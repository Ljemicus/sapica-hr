import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWalkById, getUserById, mockPets } from '@/lib/mock-data';
import { WalkTracker } from './walk-tracker';

export const metadata: Metadata = {
  title: 'GPS Tracking šetnje — Šapica',
};

export default async function WalkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const walk = getWalkById(id);
  if (!walk) notFound();

  const sitter = getUserById(walk.sitter_id);
  const pet = mockPets.find(p => p.id === walk.pet_id);

  return (
    <WalkTracker
      walk={walk}
      sitterName={sitter?.name || 'Nepoznat'}
      petName={pet?.name || 'Nepoznat'}
      petSpecies={pet?.species || 'dog'}
    />
  );
}
