import type { Metadata } from 'next';
import { ServiceDetailPage } from '@/components/shared/petpark/service-detail';

export const metadata: Metadata = {
  title: 'Čuvanje psa u kućnom okruženju | PetPark',
  description: 'Detalji PetPark usluge čuvanja psa, dostupnost, cijena, recenzije i rezervacija.',
};

export default function UslugeDetailPage() {
  return <ServiceDetailPage />;
}
