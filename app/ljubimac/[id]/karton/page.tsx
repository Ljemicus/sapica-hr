import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPet, getPassport } from '@/lib/db';
import { PetPassportView } from './pet-passport';

export const metadata: Metadata = {
  title: 'Zdravstveni karton — PetPark',
};

export default async function PetPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pet = await getPet(id);
  if (!pet) notFound();

  const passport = await getPassport(id);

  // If no passport exists yet, create an empty one for display
  const emptyPassport = {
    pet_id: id,
    vaccinations: [],
    allergies: [],
    medications: [],
    vet_info: { name: '', phone: '', address: '', emergency: false },
    notes: '',
  };

  return (
    <PetPassportView pet={pet} passport={passport || emptyPassport} />
  );
}
