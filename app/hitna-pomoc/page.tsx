import { Metadata } from 'next';
import { EmergencyVetContent } from './emergency-vet-content';
import { getAllVeterinarians } from '@/lib/db/veterinarians';

export const metadata: Metadata = {
  title: 'Hitna veterinarska pomoć | PetPark',
  description: 'Verificirane 24/7 veterinarske stanice i dežurne ambulante u Hrvatskoj. Pozovite odmah u hitnim slučajevima.',
  openGraph: {
    title: 'Hitna veterinarska pomoć | PetPark',
    description: 'Verificirane 24/7 veterinarske stanice i dežurne ambulante u Hrvatskoj.',
  },
};

export default async function EmergencyVetPage() {
  const veterinarians = await getAllVeterinarians();
  
  // TODO: Get user city from session/cookies for personalization
  const userCity = undefined;

  return <EmergencyVetContent veterinarians={veterinarians} userCity={userCity} />;
}
