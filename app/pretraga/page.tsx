import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getSitters } from '@/lib/db';
import { SearchContent } from './search-content';
import type { ServiceType } from '@/lib/types';

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

  const sitters = await getSitters({
    city: params.city,
    service: params.service as ServiceType | undefined,
    min_rating: params.min_rating ? Number(params.min_rating) : undefined,
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    sort: params.sort as 'rating' | 'reviews' | 'price_asc' | 'price_desc' | undefined,
  });

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Učitavanje...</div>}>
      <SearchContent sitters={sitters} initialParams={params} />
    </Suspense>
  );
}
