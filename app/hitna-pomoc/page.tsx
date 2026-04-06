import { Metadata } from 'next';
import { EmergencyVetContent } from './emergency-vet-content';

export const metadata: Metadata = {
  title: 'Hitna veterinarska pomoć | PetPark',
  description: '24/7 veterinarske stanice i dežurne ambulante u Hrvatskoj. Pronađite najbližu hitnu pomoć za vašeg ljubimca.',
  openGraph: {
    title: 'Hitna veterinarska pomoć | PetPark',
    description: '24/7 veterinarske stanice i dežurne ambulante u Hrvatskoj.',
  },
};

export default async function EmergencyVetPage() {
  return <EmergencyVetContent />;
}
