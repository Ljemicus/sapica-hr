import type { Metadata } from 'next';
import { EmergencyContent } from './emergency-content';
import { getEmergencyVeterinarians } from '@/lib/db/veterinarians';

export const metadata: Metadata = {
  title: 'Hitna veterinarska pomoć — brojevi i savjeti',
  description: 'Hitna veterinarska pomoć u Hrvatskoj. Verificirani brojevi i kontakti hitnih veterinara te savjeti za prvu pomoć ljubimcima u hitnim situacijama.',
  keywords: ['hitna veterinarska pomoć hrvatska', 'hitni veterinar zagreb', 'hitni veterinar split', 'prva pomoć za pse', 'prva pomoć za mačke', 'trovanje psa', 'hitna veterinarska služba'],
  openGraph: {
    title: 'Hitna veterinarska pomoć — brojevi i savjeti | PetPark',
    description: 'Hitna veterinarska pomoć u Hrvatskoj. Verificirani brojevi i savjeti za prvu pomoć ljubimcima.',
    url: 'https://petpark.hr/hitno',
    type: 'website',
    locale: 'hr_HR',
    siteName: 'PetPark',
  },
};

export default async function HitnoPage() {
  const emergencyVeterinarians = await getEmergencyVeterinarians();

  return <EmergencyContent veterinarians={emergencyVeterinarians} />;
}
