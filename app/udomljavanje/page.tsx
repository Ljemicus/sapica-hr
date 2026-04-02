import type { Metadata } from 'next';
import { getActiveAdoptionListings } from '@/lib/db/adoption-listings';
import { AdoptionBrowseContent } from './adoption-browse-content';

export const metadata: Metadata = {
  title: 'Udomite ljubimca — psi i mačke traže dom',
  description: 'Udomite psa, mačku ili malog ljubimca u Hrvatskoj. Pregledajte životinje za udomljavanje diljem Hrvatske.',
  keywords: ['udomljavanje pasa hrvatska', 'udomljavanje mačaka', 'udomljavanje životinja', 'azil za pse', 'udomljavanje zagreb', 'udomljavanje split'],
  openGraph: {
    title: 'Udomite ljubimca — psi i mačke traže dom | PetPark',
    description: 'Dajte dom onima koji to najviše zaslužuju. Pregledajte pse, mačke i male ljubimce za udomljavanje diljem Hrvatske.',
    url: 'https://petpark.hr/udomljavanje',
    type: 'website',
  },
  alternates: {
    canonical: 'https://petpark.hr/udomljavanje',
  },
};

export default async function AdoptionPage() {
  const listings = await getActiveAdoptionListings();
  return <AdoptionBrowseContent listings={listings} />;
}
