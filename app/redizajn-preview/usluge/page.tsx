import type { Metadata } from 'next';
import { ServiceHubRedesign } from '@/components/shared/petpark/service-hub-redesign';

export const metadata: Metadata = {
  title: { absolute: 'PetPark usluge redizajn preview | PetPark' },
  description: 'Interni preview redizajna PetPark pregleda usluga.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ServiceHubPreviewPage() {
  return <ServiceHubRedesign />;
}
