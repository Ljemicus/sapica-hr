import type { Metadata } from 'next';
import { ProviderCalendarPage } from '@/components/shared/petpark/provider-calendar-page';

export const metadata: Metadata = {
  title: 'Kalendar i rezervacije | PetPark',
  description: 'Pregled termina, dostupnosti i nadolazećih PetPark rezervacija za pružatelje usluga.',
};

export default function KalendarPage() {
  return <ProviderCalendarPage />;
}
