import type { Metadata } from 'next';
import { HomepageRedesign } from '@/components/shared/petpark/homepage-redesign';

export const metadata: Metadata = {
  title: 'PetPark Hrvatska — gdje ljubav prema životinjama postaje način života',
  description: 'PetPark je marketplace i zajednica za vlasnike ljubimaca u Hrvatskoj: usluge, preporuke, savjeti i lokalna pomoć na jednom mjestu.',
  alternates: {
    canonical: 'https://petpark.hr/',
  },
  openGraph: {
    title: 'PetPark Hrvatska — gdje ljubav prema životinjama postaje način života',
    description: 'PetPark je marketplace i zajednica za vlasnike ljubimaca u Hrvatskoj: usluge, preporuke, savjeti i lokalna pomoć na jednom mjestu.',
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
