import type { Metadata } from 'next';

import AdoptionPage from '../page';
import { buildLocaleAlternates } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Adoption — dogs and cats looking for a home',
  description: 'Browse dogs, cats and other pets available for adoption across Croatia. Meet the pet first, then learn about the rescue caring for them.',
  keywords: ['pet adoption croatia', 'dog adoption croatia', 'cat adoption croatia', 'adopt a dog croatia'],
  openGraph: {
    title: 'Adoption — dogs and cats looking for a home | PetPark',
    description: 'Give a home to pets that need it most. Browse dogs, cats and other pets available for adoption across Croatia.',
    url: 'https://petpark.hr/udomljavanje/en',
    locale: 'en_US',
    type: 'website',
  },
  alternates: buildLocaleAlternates('/udomljavanje/en'),
};

export default AdoptionPage;
