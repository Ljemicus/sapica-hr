import type { Metadata } from 'next';

import { FaqPageShell } from '../page';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Frequently asked questions',
  description: 'Find answers to the most common PetPark questions — bookings, payments, safety, pet sitting, and more.',
  keywords: ['petpark faq', 'faq', 'help', 'pet sitting questions', 'petpark support'],
  openGraph: {
    title: 'Frequently asked questions | PetPark',
    description: 'Answers to common PetPark questions about bookings, payments, safety, and more.',
    type: 'website',
    ...buildLocaleOpenGraph('/faq/en'),
  },
  alternates: buildLocaleAlternates('/faq/en'),
};

export default function FaqEnPage() {
  return <FaqPageShell locale="en" />;
}
