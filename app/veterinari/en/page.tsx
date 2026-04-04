import type { Metadata } from 'next';

import VeterinariPage from '../page';
import { buildLocaleAlternates } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Veterinary stations and clinics in Croatia',
  description: 'Official directory of veterinary stations and clinics in Croatia with addresses and contact details.',
  keywords: ['veterinarian croatia', 'veterinary clinic croatia', 'veterinary station croatia', 'petpark veterinarians'],
  openGraph: {
    title: 'Veterinary stations and clinics in Croatia | PetPark',
    description: 'Official directory of veterinary stations and clinics in Croatia with addresses and contact details.',
    url: 'https://petpark.hr/veterinari/en',
    locale: 'en_US',
    type: 'website',
  },
  alternates: buildLocaleAlternates('/veterinari/en'),
};

export default VeterinariPage;
