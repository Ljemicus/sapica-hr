import type { Metadata } from 'next';
import { PetCardContent } from './pet-card-content';
import { getPetCardData } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Kartica ljubimca — PetPark',
  description: 'Djeljiva kartica ljubimca s osnovnim informacijama i hitnim kontaktima.',
};

export default async function PetCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = await getPetCardData(id);

  return <PetCardContent petId={id} pet={pet} />;
}
