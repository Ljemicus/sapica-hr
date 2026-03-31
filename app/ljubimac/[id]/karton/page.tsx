import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPet, getPassport } from '@/lib/db';
import { PetPassportView } from './pet-passport';

export const metadata: Metadata = {
  title: 'Zdravstveni karton — PetPark',
};

const DEMO_PET_IDS = new Set([
  'pet11111-1111-1111-1111-111111111111',
  'pet22222-2222-2222-2222-222222222222',
  'pet33333-3333-3333-3333-333333333333',
  'pet44444-4444-4444-4444-444444444444',
  'pet55555-5555-5555-5555-555555555555',
  'pet66666-6666-6666-6666-666666666666',
  'pet77777-7777-7777-7777-777777777777',
  'pet88888-8888-8888-8888-888888888888',
]);

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
    <PetPassportView
      pet={pet}
      passport={passport || emptyPassport}
      isDemo={DEMO_PET_IDS.has(id)}
    />
  );
}
