import type { Metadata } from 'next';
import { AdoptionContent } from './adoption-content';

export const metadata: Metadata = {
  title: 'Udomljavanje ljubimaca',
  description: 'Udomite psa, mačku ili malog ljubimca iz azila u Hrvatskoj. Pregledajte životinje za udomljavanje iz azila u Zagrebu, Splitu, Rijeci, Osijeku i Zadru.',
  keywords: ['udomljavanje pasa hrvatska', 'udomljavanje mačaka', 'udomljavanje životinja', 'azil za pse', 'udomljavanje zagreb', 'udomljavanje split'],
  openGraph: {
    title: 'Udomljavanje ljubimaca | PetPark',
    description: 'Dajte dom onima koji to najviše zaslužuju. Pregledajte pse, mačke i male ljubimce za udomljavanje iz azila diljem Hrvatske.',
    type: 'website',
  },
};

export default function AdoptionPage() {
  return <AdoptionContent />;
}
