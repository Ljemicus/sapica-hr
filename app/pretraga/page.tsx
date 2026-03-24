import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { ServiceType } from '@/lib/types';
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
  const supabase = await createClient();

  let query = supabase
    .from('sitter_profiles')
    .select('*, user:users!sitter_profiles_user_id_fkey(id, name, email, avatar_url, city)');

  if (params.city) {
    query = query.eq('city', params.city);
  }
  if (params.service) {
    query = query.contains('services', [params.service]);
  }
  if (params.min_rating) {
    query = query.gte('rating_avg', parseFloat(params.min_rating));
  }

  const sortField = params.sort === 'price' ? 'prices' : params.sort === 'reviews' ? 'review_count' : 'rating_avg';
  const sortOrder = params.sort === 'price' ? { ascending: true } : { ascending: false };
  query = query.order(sortField === 'prices' ? 'rating_avg' : sortField, sortOrder);

  const { data: sitters } = await query;

  // Filter by price range client-side (since prices is JSONB)
  let filteredSitters = sitters || [];
  if (params.min_price || params.max_price) {
    filteredSitters = filteredSitters.filter((s: any) => {
      const prices = Object.values(s.prices || {}) as number[];
      const minPrice = Math.min(...prices);
      if (params.min_price && minPrice < parseFloat(params.min_price)) return false;
      if (params.max_price && minPrice > parseFloat(params.max_price)) return false;
      return true;
    });
  }

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Učitavanje...</div>}>
      <SearchContent sitters={filteredSitters} initialParams={params} />
    </Suspense>
  );
}
