import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPetPassport, mockPets } from '@/lib/mock-data';
import { PetPassportView } from './pet-passport';

export const metadata: Metadata = {
  title: 'Zdravstveni karton — Šapica',
};

export default async function PetPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = mockPets.find(p => p.id === id);
  if (!pet) notFound();

  const passport = getPetPassport(id);
  if (!passport) notFound();

  return (
    <PetPassportView pet={pet} passport={passport} />
  );
}
