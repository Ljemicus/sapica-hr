import type { Metadata } from 'next';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { BreedersPageShell } from './breeders-page-shell';

export const metadata: Metadata = {
  title: 'Uzgajivači — profili uzgajivača u Hrvatskoj',
  description: 'Pronađite profile uzgajivača pasa i mačaka u Hrvatskoj. Pregledajte dostupne informacije, legla i ocjene vlasnika.',
  keywords: ['uzgajivači pasa hrvatska', 'uzgajivač pasa', 'štenci na prodaju', 'uzgajivači mačaka', 'FCI uzgajivač', 'legla štenaca'],
  openGraph: {
    title: 'Uzgajivači — profili uzgajivača | PetPark',
    description: 'Pronađite profile uzgajivača pasa i mačaka u Hrvatskoj.',
    type: 'website',
    ...buildLocaleOpenGraph('/uzgajivacnice'),
  },
  alternates: buildLocaleAlternates('/uzgajivacnice'),
};

interface UzgajivacnicePageProps {
  searchParams: Promise<{ species?: string; city?: string; breed?: string; sort?: string }>;
}

export default async function UzgajivacnicePage({ searchParams }: UzgajivacnicePageProps) {
  const params = await searchParams;
  return <BreedersPageShell locale="hr" params={params} />;
}
