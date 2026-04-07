import type { Metadata } from 'next';
import { SocialFeedContent } from '@/components/social/social-feed-content';

export const metadata: Metadata = {
  title: 'Zajednica — PetPark',
  description: 'Podijelite trenutke s vašim ljubimcima, sudjelujte u izazovima i pronađite druženja.',
  openGraph: {
    title: 'Zajednica ljubimaca — PetPark',
    description: 'Podijelite trenutke s vašim ljubimcima, sudjelujte u izazovima i pronađite druženja.',
    url: 'https://petpark.hr/zajednica',
    type: 'website',
  },
};

export default function ZajednicaPage() {
  return <SocialFeedContent />;
}
