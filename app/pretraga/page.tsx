import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getUnifiedProviders, normalizeProviderSearchParams } from '@/lib/search/providers';
import { SearchContent } from './search-content';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Pronađite pet sittera u vašem gradu',
  description: 'Pronađite pouzdane sittere, groomere i trenere za vašeg ljubimca. Filtrirajte po kategoriji, gradu, cijeni i ocjeni.',
  keywords: ['pet sitter', 'groomer', 'trener pasa', 'pretraga', 'čuvanje ljubimaca'],
  openGraph: {
    title: 'Pronađite pet sittera u vašem gradu | PetPark',
    description: 'Pronađite pouzdane sittere, groomere i trenere za vašeg ljubimca u Hrvatskoj.',
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
        name="Čuvanje ljubimaca"
        description="Pronađite pouzdane sittere, groomere i trenere za vašeg ljubimca u Hrvatskoj."
        url="https://petpark.hr/pretraga"
        serviceType="Pet Sitting"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      />
      <Breadcrumbs items={[{ label: 'Pretraga', href: '/pretraga' }]} />
      <Suspense fallback={<div className="container mx-auto px-4 py-8">Učitavanje...</div>}>
        <SearchContent providers={providers} initialParams={params} />
      </Suspense>
    </>
  );
}
