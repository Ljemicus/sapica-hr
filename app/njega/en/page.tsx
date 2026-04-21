import type { Metadata } from 'next';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { GroomingPageShell } from '../grooming-page-shell';

export const metadata: Metadata = {
  title: 'Pet Grooming — Professional Grooming Salons in Croatia',
  description: 'Find professional pet groomers for haircuts, bathing, trimming and nail care for your pet in Croatia.',
  keywords: ['pet grooming croatia', 'dog grooming', 'cat grooming', 'pet salon', 'dog haircut', 'pet bathing'],
  openGraph: {
    title: 'Pet Grooming — Professional Grooming Salons | PetPark',
    description: 'Find professional groomers for haircuts, bathing, trimming and nail care for your pet in Croatia.',
    type: 'website',
    ...buildLocaleOpenGraph('/njega/en'),
  },
  alternates: buildLocaleAlternates('/njega/en'),
};

interface GroomingEnPageProps {
  searchParams: Promise<{ city?: string; service?: string }>;
}

export default function GroomingEnPage({ searchParams }: GroomingEnPageProps) {
  return <GroomingPageShell searchParams={searchParams} locale="en" />;
}
