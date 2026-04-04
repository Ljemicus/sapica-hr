import type { Metadata } from 'next';
import { getGroomers } from '@/lib/db/groomers';
import { GroomingContent } from '@/app/grooming/grooming-content';
import type { GroomingServiceType } from '@/lib/types';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Pet grooming — salons and services',
  description: 'Find professional pet groomers in Croatia for haircuts, baths, hand stripping, and nail care.',
  keywords: ['pet grooming croatia', 'dog grooming croatia', 'pet salon croatia', 'dog haircut croatia', 'pet bath croatia'],
  openGraph: {
    title: 'Pet grooming — salons and services | PetPark',
    description: 'Find professional pet groomers in Croatia for haircuts, baths, hand stripping, and nail care.',
    type: 'website',
    ...buildLocaleOpenGraph('/njega/en'),
  },
  alternates: buildLocaleAlternates('/njega/en'),
};

interface NjegaEnPageProps {
  searchParams: Promise<{ city?: string; service?: string }>;
}

export default async function NjegaEnPage({ searchParams }: NjegaEnPageProps) {
  const params = await searchParams;
  const groomers = await getGroomers({ city: params.city, service: params.service as GroomingServiceType | undefined });

  return (
    <>
      <ServiceJsonLd
        name="Pet grooming"
        description="Find professional pet groomers in Croatia for haircuts, baths, hand stripping, and nail care."
        url="https://petpark.hr/njega/en"
        serviceType="Pet Grooming"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      />
      <Breadcrumbs items={[{ label: 'Pet grooming', href: '/njega/en' }]} />
      <GroomingContent groomers={groomers} initialParams={params} />
    </>
  );
}
