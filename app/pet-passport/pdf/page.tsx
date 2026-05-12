import type { Metadata } from 'next';
import { PetPassportPdfPage } from '@/components/shared/petpark/pet-passport-pdf-page';

export const metadata: Metadata = {
  title: 'Pet Passport PDF | PetPark',
  description: 'Pregled PDF/print verzije Pet Passport kartona ljubimca za sigurno dijeljenje i ispis.',
};

export default function PetPassportPdfRoute() {
  return <PetPassportPdfPage />;
}
