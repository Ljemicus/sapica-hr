import type { Metadata } from 'next';
import { PetCardContent } from './pet-card-content';

export const metadata: Metadata = {
  title: 'Kartica ljubimca — PetPark',
  description: 'Djeljiva kartica ljubimca s osnovnim informacijama i hitnim kontaktima.',
};

export default async function PetCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PetCardContent petId={id} />;
}
