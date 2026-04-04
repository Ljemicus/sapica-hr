import type { Metadata } from 'next';

import DogFriendlyPage from '../page';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Dog-friendly places in Croatia',
  description: 'Find dog-friendly cafés, restaurants, beaches, parks and hotels across Croatia. A practical guide for dog owners visiting Zagreb, Split, Rijeka and more.',
  keywords: ['dog friendly croatia', 'pet friendly croatia', 'dog friendly cafes croatia', 'dog friendly beaches croatia'],
  openGraph: {
    title: 'Dog-friendly places in Croatia | PetPark',
    description: 'Find dog-friendly cafés, restaurants, beaches, parks and hotels across Croatia.',
    siteName: 'PetPark',
    type: 'website',
    ...buildLocaleOpenGraph('/dog-friendly/en'),
  },
  alternates: buildLocaleAlternates('/dog-friendly/en'),
};

export default DogFriendlyPage;
