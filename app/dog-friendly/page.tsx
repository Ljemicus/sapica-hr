import type { Metadata } from 'next';
import { getDogFriendlyLocations } from '@/lib/db/dog-friendly';
import { DogFriendlyContent } from './dog-friendly-content';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Dog-Friendly lokacije u Hrvatskoj',
  description: 'Pronađite dog-friendly kafiće, restorane, plaže, parkove i hotele diljem Hrvatske. Kompletni vodič za vlasnike pasa — Zagreb, Split, Rijeka, Dubrovnik i više.',
  keywords: ['dog friendly lokacije hrvatska', 'kafići koji primaju pse', 'dog friendly plaže', 'dog friendly restorani', 'pas u kafiću hrvatska', 'pet friendly hrvatska'],
  openGraph: {
    title: 'Dog-Friendly lokacije u Hrvatskoj | PetPark',
    description: 'Pronađite dog-friendly kafiće, restorane, plaže, parkove i hotele diljem Hrvatske.',
    siteName: 'PetPark',
    type: 'website',
    ...buildLocaleOpenGraph('/dog-friendly'),
  },
  alternates: buildLocaleAlternates('/dog-friendly'),
};

export default async function DogFriendlyPage() {
  const locations = await getDogFriendlyLocations();
  return <DogFriendlyContent locations={locations} />;
}
