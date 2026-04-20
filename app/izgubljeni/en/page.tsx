import type { Metadata } from 'next';

import { LostPetsContent } from '../lost-pets-content';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Lost pets — report or find them',
  description: 'Help find lost pets in Croatia. Report a missing pet, browse active notices and share them quickly — every share helps.',
  keywords: ['lost dog croatia', 'lost cat croatia', 'missing pets croatia', 'found dog croatia'],
  openGraph: {
    title: 'Lost pets — report or find them | PetPark',
    description: 'Help find lost pets in Croatia. Every share can help bring them home.',
    type: 'website',
    ...buildLocaleOpenGraph('/izgubljeni/en'),
  },
  alternates: buildLocaleAlternates('/izgubljeni/en'),
};

export default function LostPetsEnPage() {
  return <LostPetsContent forcedLanguage="en" />;
}
