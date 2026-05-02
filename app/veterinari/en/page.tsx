import type { Metadata } from 'next';

import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { VeterinariPageShell } from '../veterinari-page-shell';

export const metadata: Metadata = {
  title: 'Veterinary stations and clinics in Croatia',
  description: 'Overview of veterinary stations and clinics in Croatia with addresses and contact details.',
  keywords: ['veterinarian croatia', 'veterinary clinic croatia', 'veterinary station croatia', 'petpark veterinarians'],
  openGraph: {
    title: 'Veterinary stations and clinics in Croatia | PetPark',
    description: 'Overview of veterinary stations and clinics in Croatia with addresses and contact details.',
    type: 'website',
    ...buildLocaleOpenGraph('/veterinari/en'),
  },
  alternates: buildLocaleAlternates('/veterinari/en'),
};

export default function VeterinariEnPage() {
  return <VeterinariPageShell locale="en" />;
}
