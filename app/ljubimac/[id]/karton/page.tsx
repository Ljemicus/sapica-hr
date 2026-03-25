import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPet, getPassport } from '@/lib/db';
import { PetPassportView } from './pet-passport';

export const metadata: Metadata = {
  title: 'Zdravstveni karton — Šapica',
};

export default async function PetPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = await getPet(id);
  if (!pet) notFound();

  const passport = await getPassport(id);
  if (!passport) notFound();

  return (
    <PetPassportView pet={pet} passport={passport} />
  );
}
