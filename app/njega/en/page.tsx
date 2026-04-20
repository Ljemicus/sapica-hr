import type { Metadata } from 'next';
import { getGroomers } from '@/lib/db/groomers';
import { GroomingContent } from '@/app/grooming/grooming-content';
import type { GroomingServiceType } from '@/lib/types';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

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

export default async function GroomingEnPage({ searchParams }: GroomingEnPageProps) {
  const params = await searchParams;
  const groomers = await getGroomers({ city: params.city, service: params.service as GroomingServiceType | undefined });

  return (
    <>
      <ServiceJsonLd
        name="Pet Grooming"
        description="Find professional groomers for haircuts, bathing, trimming and nail care for your pet in Croatia."
        url="https://petpark.hr/njega/en"
        serviceType="Pet Grooming"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      />
      <Breadcrumbs items={[{ label: 'Pet Grooming', href: '/njega/en' }]} />
      <GroomingContent groomers={groomers} initialParams={params} forcedLanguage="en" />
    </>
  );
}
