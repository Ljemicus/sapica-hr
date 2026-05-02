import type { Metadata } from 'next';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { BreedersPageShell } from '../breeders-page-shell';

export const metadata: Metadata = {
  title: 'Breeders — dog and cat breeder profiles in Croatia',
  description: 'Find dog and cat breeder profiles in Croatia. Browse available information, litters, and owner ratings.',
  keywords: ['dog breeders croatia', 'cat breeders croatia', 'puppies for sale croatia', 'fci breeder croatia', 'kittens for sale croatia'],
  openGraph: {
    title: 'Breeders — breeder profiles | PetPark',
    description: 'Find dog and cat breeder profiles in Croatia.',
    type: 'website',
    ...buildLocaleOpenGraph('/uzgajivacnice/en'),
  },
  alternates: buildLocaleAlternates('/uzgajivacnice/en'),
};

interface BreedersEnPageProps {
  searchParams: Promise<{ species?: string; city?: string; breed?: string; sort?: string }>;
}

export default async function BreedersEnPage({ searchParams }: BreedersEnPageProps) {
  const params = await searchParams;
  return <BreedersPageShell locale="en" params={params} />;
}
