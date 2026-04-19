import type { Metadata } from 'next';
import { getProviderGroomers } from '@/lib/db/provider-groomers';
import { GroomingContent } from '@/app/grooming/grooming-content';
import type { GroomingServiceType } from '@/lib/types';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

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

export default async function NjegaPage({ searchParams }: NjegaPageProps) {
  const params = await searchParams;
  const groomers = await getProviderGroomers({ city: params.city, service: params.service as GroomingServiceType | undefined });

  return (
    <>
      <ServiceJsonLd
        name="Njega ljubimaca"
        description="Pronađite profesionalne groomere za šišanje, kupanje, trimanje i njegu noktiju ljubimaca u Hrvatskoj."
        url="https://petpark.hr/njega"
        serviceType="Pet Grooming"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      />
      <Breadcrumbs items={[{ label: 'Njega ljubimaca', href: '/njega' }]} />
      <GroomingContent groomers={groomers} initialParams={params} />
    </>
  );
}
