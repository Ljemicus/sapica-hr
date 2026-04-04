import type { Metadata } from 'next';
import { getActiveAdoptionListings } from '@/lib/db/adoption-listings';
import { AdoptionBrowseContent } from './adoption-browse-content';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Udomljavanje — psi i mačke traže dom',
  description: 'Pregledajte pse, mačke i druge životinje za udomljavanje diljem Hrvatske. Prvo upoznajte ljubimca, a zatim udrugu koja o njemu brine.',
  keywords: ['udomljavanje pasa hrvatska', 'udomljavanje mačaka', 'udomljavanje životinja', 'azil za pse', 'udomljavanje zagreb', 'udomljavanje split'],
  openGraph: {
    title: 'Udomljavanje — psi i mačke traže dom | PetPark',
    description: 'Dajte dom onima koji to najviše zaslužuju. Pregledajte pse, mačke i druge životinje za udomljavanje diljem Hrvatske.',
    type: 'website',
    ...buildLocaleOpenGraph('/udomljavanje'),
  },
  alternates: buildLocaleAlternates('/udomljavanje'),
};

export default async function AdoptionPage() {
  const listings = await getActiveAdoptionListings();
  return <AdoptionBrowseContent listings={listings} />;
}
