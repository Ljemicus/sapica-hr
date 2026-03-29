import type { Metadata } from 'next';
import { DogFriendlyContent } from './dog-friendly-content';

export const metadata: Metadata = {
  title: 'Dog-Friendly lokacije u Hrvatskoj',
  description: 'Pronađite dog-friendly kafiće, restorane, plaže, parkove i hotele diljem Hrvatske. Kompletni vodič za vlasnike pasa — Zagreb, Split, Rijeka, Dubrovnik i više.',
  keywords: ['dog friendly lokacije hrvatska', 'kafići koji primaju pse', 'dog friendly plaže', 'dog friendly restorani', 'pas u kafiću hrvatska', 'pet friendly hrvatska'],
  openGraph: {
    title: 'Dog-Friendly lokacije u Hrvatskoj | PetPark',
    description: 'Pronađite dog-friendly kafiće, restorane, plaže, parkove i hotele diljem Hrvatske.',
    url: 'https://petpark.hr/dog-friendly',
    siteName: 'PetPark',
    locale: 'hr_HR',
    type: 'website',
  },
};

export default function DogFriendlyPage() {
  return <DogFriendlyContent />;
}
