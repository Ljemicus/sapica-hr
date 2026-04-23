import type { Metadata } from 'next';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { BreedersPageShell } from '../breeders-page-shell';

export const metadata: Metadata = {
  title: 'Breeders — Certified dog and cat breeders in Croatia',
  description: 'Find certified dog and cat breeders in Croatia. Browse breeder profiles with FCI registration, available litters, and owner ratings.',
  keywords: ['dog breeders croatia', 'cat breeders croatia', 'puppies for sale croatia', 'fci breeder croatia', 'kittens for sale croatia'],
  openGraph: {
    title: 'Breeders — Certified breeders | PetPark',
    description: 'Find certified dog and cat breeders in Croatia.',
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
