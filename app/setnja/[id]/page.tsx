import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWalk, getUser, getPet } from '@/lib/db';
import { WalkTracker } from './walk-tracker';

export const metadata: Metadata = {
  title: 'GPS Tracking šetnje — PetPark',
};

const DEMO_WALK_IDS = new Set([
  'walk1111-1111-1111-1111-111111111111',
  'walk2222-2222-2222-2222-222222222222',
  'walk3333-3333-3333-3333-333333333333',
  'walk4444-4444-4444-4444-444444444444',
  'walk5555-5555-5555-5555-555555555555',
]);

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
      isDemo={DEMO_WALK_IDS.has(id)}
    />
  );
}
