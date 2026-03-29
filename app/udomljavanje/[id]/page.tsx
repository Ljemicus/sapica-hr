import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdoptionPetById, getShelterById, SPECIES_LABEL } from '@/lib/mock-adoption-data';
import { AdoptionDetailContent } from './adoption-detail-content';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pet = getAdoptionPetById(id);
  if (!pet) return { title: 'Ljubimac nije pronađen' };
  const shelter = getShelterById(pet.shelter_id);

  return {
    title: `${pet.name} — ${SPECIES_LABEL[pet.species]} za udomljavanje`,
    description: `Udomite ${pet.name}, ${pet.breed.toLowerCase()} iz ${shelter?.name || pet.city}. ${pet.description.slice(0, 120)}`,
    openGraph: {
      title: `${pet.name} traži dom | PetPark`,
      description: pet.description.slice(0, 200),
      type: 'article',
    },
  };
}

export default async function AdoptionDetailPage({ params }: Props) {
  const { id } = await params;
  const pet = getAdoptionPetById(id);
  if (!pet) notFound();

  return <AdoptionDetailContent petId={id} />;
}
