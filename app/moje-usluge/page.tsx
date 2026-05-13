import type { Metadata } from 'next';
import { MyServicesPage } from '@/components/shared/petpark/my-services-page';
import { getOwnedServiceListingSummaries } from '@/lib/petpark/service-listings/read-owned';

export const metadata: Metadata = {
  title: 'Moje usluge | PetPark',
  description: 'Provider dashboard za upravljanje PetPark uslugama, rezervacijama, recenzijama i prihodima.',
};

export default async function MojeUslugeRoute() {
  const providerServices = await getOwnedServiceListingSummaries();

  return <MyServicesPage providerServices={providerServices} />;
}
