import type { Metadata } from 'next';
import { AdoptionContent } from './adoption-content';

export const metadata: Metadata = {
  title: 'Udomite ljubimca — psi i mačke traže dom',
  description: 'Udomite psa, mačku ili malog ljubimca iz azila u Hrvatskoj. Pregledajte životinje za udomljavanje iz azila u Zagrebu, Splitu, Rijeci, Osijeku i Zadru.',
  keywords: ['udomljavanje pasa hrvatska', 'udomljavanje mačaka', 'udomljavanje životinja', 'azil za pse', 'udomljavanje zagreb', 'udomljavanje split'],
  openGraph: {
    title: 'Udomite ljubimca — psi i mačke traže dom | PetPark',
    description: 'Dajte dom onima koji to najviše zaslužuju. Pregledajte pse, mačke i male ljubimce za udomljavanje iz azila diljem Hrvatske.',
    url: 'https://petpark.hr/udomljavanje',
    type: 'website',
  },
};

export default function AdoptionPage() {
  return <AdoptionContent />;
}
