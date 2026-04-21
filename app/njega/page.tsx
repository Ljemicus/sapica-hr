import type { Metadata } from 'next';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { GroomingPageShell } from './grooming-page-shell';

export const metadata: Metadata = {
  title: 'Njega ljubimaca — grooming saloni i usluge',
  description: 'Pronađite profesionalne groomere za šišanje, kupanje, trimanje i njegu noktiju ljubimaca u Hrvatskoj.',
  keywords: ['njega ljubimaca', 'grooming salon', 'šišanje pasa', 'kupanje pasa', 'trimanje pasa', 'groomer hrvatska'],
  openGraph: {
    title: 'Njega ljubimaca — grooming saloni i usluge | PetPark',
    description: 'Pronađite profesionalne groomere za šišanje, kupanje, trimanje i njegu noktiju ljubimaca u Hrvatskoj.',
    type: 'website',
    ...buildLocaleOpenGraph('/njega'),
  },
  alternates: buildLocaleAlternates('/njega'),
};

interface NjegaPageProps {
  searchParams: Promise<{ city?: string; service?: string }>;
}

export default function NjegaPage({ searchParams }: NjegaPageProps) {
  return <GroomingPageShell searchParams={searchParams} locale="hr" />;
}
