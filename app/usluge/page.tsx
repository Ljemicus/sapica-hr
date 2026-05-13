import type { Metadata } from 'next';
import { ServicesMarketplacePage } from '@/components/shared/petpark/services-marketplace';
import { getPublicServiceListings } from '@/lib/db/service-listings';

export const metadata: Metadata = {
  title: 'Usluge za ljubimce | PetPark',
  description: 'Pronađi provjerene PetPark usluge za čuvanje, šetnju, grooming, trening, izgubljene ljubimce i udomljavanje.',
};

export default async function UslugePage() {
  const realServices = await getPublicServiceListings();
  return <ServicesMarketplacePage realServices={realServices} />;
}
