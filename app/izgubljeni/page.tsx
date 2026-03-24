import type { Metadata } from 'next';
import { getLostPets } from '@/lib/mock-data';
import { LostPetsContent } from './lost-pets-content';

export const metadata: Metadata = {
  title: 'Izgubljeni ljubimci',
  description: 'Pomozite pronaći izgubljene ljubimce u Hrvatskoj. Podijelite oglas i pomozite da se ljubimac vrati kući.',
  openGraph: {
    title: 'Izgubljeni ljubimci — Šapica',
    description: 'Pomozite pronaći izgubljene ljubimce u Hrvatskoj. Svako dijeljenje pomaže!',
    type: 'website',
  },
};

export default function LostPetsPage() {
  const pets = getLostPets();

  return <LostPetsContent initialPets={pets} />;
}
