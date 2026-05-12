import type { Metadata } from 'next';
import { MyServicesPage } from '@/components/shared/petpark/my-services-page';

export const metadata: Metadata = {
  title: 'Moje usluge | PetPark',
  description: 'Provider dashboard za upravljanje PetPark uslugama, rezervacijama, recenzijama i prihodima.',
};

export default function MojeUslugeRoute() {
  return <MyServicesPage />;
}
