import type { Metadata } from 'next';
import { ServicesMarketplacePage } from '@/components/shared/petpark/services-marketplace';

export const metadata: Metadata = {
  title: 'Usluge za ljubimce | PetPark',
  description: 'Pronađi provjerene PetPark usluge za čuvanje, šetnju, grooming, trening, izgubljene ljubimce i udomljavanje.',
};

export default function UslugePage() {
  return <ServicesMarketplacePage />;
}
