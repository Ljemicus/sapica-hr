import type { Metadata } from 'next';
import { EmergencyContent } from './emergency-content';

export const metadata: Metadata = {
  title: 'Hitna veterinarska pomoć — brojevi i savjeti',
  description: 'Hitna veterinarska pomoć u Hrvatskoj. Brojevi telefona hitnih veterinarskih klinika, savjeti za prvu pomoć ljubimcima u hitnim situacijama.',
  keywords: ['hitna veterinarska pomoć hrvatska', 'hitni veterinar zagreb', 'hitni veterinar split', 'prva pomoć za pse', 'prva pomoć za mačke', 'trovanje psa', 'hitna veterinarska služba'],
  openGraph: {
    title: 'Hitna veterinarska pomoć — brojevi i savjeti | PetPark',
    description: 'Hitna veterinarska pomoć u Hrvatskoj. Brojevi telefona, savjeti za prvu pomoć ljubimcima.',
    url: 'https://petpark.hr/hitno',
    type: 'website',
    locale: 'hr_HR',
    siteName: 'PetPark',
  },
};

export default function HitnoPage() {
  return <EmergencyContent />;
}
