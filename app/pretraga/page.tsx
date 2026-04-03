import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getUnifiedProviders, normalizeProviderSearchParams } from '@/lib/search/providers';
import { SearchContent } from './search-content';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import { InternalLinkSection } from '@/components/shared/internal-link-section';
import { SEARCH_DISCOVERY_LINKS, CONTENT_DISCOVERY_LINKS } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Pronađite sittere i usluge za ljubimce u svom gradu',
  description: 'Pretražite verificirane sittere, groomere i trenere za svog ljubimca. Filtrirajte po gradu, usluzi, cijeni i ocjeni.',
  keywords: ['pet sitter', 'groomer', 'trener pasa', 'pretraga', 'čuvanje ljubimaca'],
  openGraph: {
    title: 'Pronađite sittere i usluge za ljubimce | PetPark',
    description: 'Pretražite verificirane sittere, groomere i trenere za svog ljubimca u Hrvatskoj.',
    url: 'https://petpark.hr/pretraga',
    type: 'website',
  },
  alternates: {
    canonical: 'https://petpark.hr/pretraga',
  },
};

interface SearchPageProps {
  searchParams: Promise<{
    category?: string;
    city?: string;
    service?: string;
    min_price?: string;
    max_price?: string;
    min_rating?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const normalizedParams = normalizeProviderSearchParams(params);

  const providers = await getUnifiedProviders(normalizedParams);

  return (
    <>
      <ServiceJsonLd
        name="PetPark pretraga usluga za ljubimce"
        description="Pretražite verificirane sittere, groomere i trenere za svog ljubimca u Hrvatskoj."
        url="https://petpark.hr/pretraga"
        serviceType="Pet Sitting"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      />
      <Breadcrumbs items={[{ label: 'Pretraga', href: '/pretraga' }]} />
      <Suspense fallback={<div className="container mx-auto px-4 py-8">Učitavanje...</div>}>
        <SearchContent providers={providers} initialParams={params} />
      </Suspense>
      <InternalLinkSection
        eyebrow="Popularne rute"
        title="Ako niste našli odmah što tražite"
        description="Pretraga je hub, ali ove rute daju jače city/service signale i lakši ulaz u sadržajni sloj gdje već postoji konkretna vrijednost."
        items={[
          ...SEARCH_DISCOVERY_LINKS,
          ...CONTENT_DISCOVERY_LINKS,
        ]}
      />
    </>
  );
}
