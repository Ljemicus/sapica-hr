import type { Metadata } from 'next';
import { PetPassportDashboardPage } from '@/components/shared/petpark/pet-passport-dashboard-page';

export const metadata: Metadata = {
  title: 'Pet Passport | PetPark',
  description: 'Digitalni karton ljubimca s cijepljenjima, alergijama, terapijama i QR dijeljenjem za PetPark vlasnike.',
};

export default function PetPassportPage() {
  return <PetPassportDashboardPage />;
}
