import type { Metadata } from 'next';
import { ServiceHubRedesign } from '@/components/shared/petpark/service-hub-redesign';

export const metadata: Metadata = {
  title: { absolute: 'PetPark usluge redizajn preview | PetPark' },
  description: 'Interni preview redizajna PetPark service hub stranice.',
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
