import type { Metadata } from 'next';
import { HomepageRedesign } from '@/components/shared/petpark/homepage-redesign';

export const metadata: Metadata = {
  title: 'PetPark redizajn preview',
  description: 'Sigurni interni preview PetPark homepage redizajna.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RedizajnPreviewPage() {
  return <HomepageRedesign mode="preview" />;
}
