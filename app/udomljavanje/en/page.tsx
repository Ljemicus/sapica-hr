import type { Metadata } from 'next';

import { getActiveAdoptionListings } from '@/lib/db/adoption-listings';
import { AdoptionBrowseContent } from '../adoption-browse-content';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Adoption — dogs and cats looking for a home',
  description: 'Browse dogs, cats and other pets available for adoption across Croatia. Meet the pet first, then learn about the rescue caring for them.',
  keywords: ['pet adoption croatia', 'dog adoption croatia', 'cat adoption croatia', 'adopt a dog croatia'],
  openGraph: {
    title: 'Adoption — dogs and cats looking for a home | PetPark',
    description: 'Give a home to pets that need it most. Browse dogs, cats and other pets available for adoption across Croatia.',
    type: 'website',
    ...buildLocaleOpenGraph('/udomljavanje/en'),
  },
  alternates: buildLocaleAlternates('/udomljavanje/en'),
};

export default async function AdoptionEnPage() {
  const listings = await getActiveAdoptionListings();
  return <AdoptionBrowseContent listings={listings} forcedLanguage="en" />;
}
