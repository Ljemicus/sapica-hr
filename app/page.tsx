import type { Metadata } from 'next';
import { HomepageRedesign } from '@/components/shared/petpark/homepage-redesign';

export const metadata: Metadata = {
  title: 'PetPark — što treba tvom ljubimcu danas?',
  description: 'PetPark povezuje ljubimce s uslugama, savjetima i zajednicom: čuvanje, šetnja, grooming, trening, izgubljeni ljubimci i udomljavanje.',
  alternates: {
    canonical: 'https://petpark.hr/',
  },
  openGraph: {
    title: 'PetPark — što treba tvom ljubimcu danas?',
    description: 'PetPark povezuje ljubimce s uslugama, savjetima i zajednicom: čuvanje, šetnja, grooming, trening, izgubljeni ljubimci i udomljavanje.',
    url: 'https://petpark.hr/',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function HomePage() {
  return <HomepageRedesign />;
}
