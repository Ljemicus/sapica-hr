import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getSitterProfiles } from '@/lib/mock-data';
import { SearchContent } from './search-content';

export const metadata: Metadata = {
  title: 'Pretraži sittere',
  description: 'Pronađite pouzdane čuvare ljubimaca u vašem gradu. Filtrirajte po usluzi, cijeni i ocjeni.',
};

interface SearchPageProps {
  searchParams: Promise<{
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

  const sitters = getSitterProfiles({
    city: params.city,
    service: params.service,
    min_rating: params.min_rating,
    min_price: params.min_price,
    max_price: params.max_price,
    sort: params.sort,
  });

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Učitavanje...</div>}>
      <SearchContent sitters={sitters} initialParams={params} />
    </Suspense>
  );
}
