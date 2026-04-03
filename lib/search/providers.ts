import { getGroomers, getSitters, getTrainers } from '@/lib/db';
import type { ServiceType } from '@/lib/types';
import type { UnifiedProvider, ProviderCategory } from '@/app/pretraga/types';
import { getTrustEligibilityByUserId, getTrustEligibilityForGroomer, getTrustEligibilityForTrainer } from '@/lib/trust/bridge';

export type ProviderSort = 'rating' | 'reviews' | 'price';

export interface ProviderSearchParams {
  category?: ProviderCategory;
  city?: string;
  service?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: ProviderSort;
}

function normalizeSort(sort?: string): ProviderSort {
  if (sort === 'reviews' || sort === 'price') return sort;
  return 'rating';
}

function toNumericFilter(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sortProviders(providers: UnifiedProvider[], sort: ProviderSort): UnifiedProvider[] {
  const next = [...providers];

  switch (sort) {
    case 'reviews':
      next.sort((a, b) => b.reviews - a.reviews);
      return next;
    case 'price':
      next.sort((a, b) => {
        const aPrice = a.lowestPrice ?? Number.POSITIVE_INFINITY;
        const bPrice = b.lowestPrice ?? Number.POSITIVE_INFINITY;
        return aPrice - bPrice;
      });
      return next;
    case 'rating':
    default:
      next.sort((a, b) => b.rating - a.rating);
      return next;
  }
}

function applyUnifiedFilters(providers: UnifiedProvider[], params: ProviderSearchParams): UnifiedProvider[] {
  let next = [...providers];

  if (params.minRating != null) {
    next = next.filter((provider) => provider.rating >= params.minRating!);
  }

  if (params.minPrice != null) {
    next = next.filter((provider) => provider.lowestPrice == null || provider.lowestPrice >= params.minPrice!);
  }

  if (params.maxPrice != null) {
    next = next.filter((provider) => provider.lowestPrice == null || provider.lowestPrice <= params.maxPrice!);
  }

  return sortProviders(next, params.sort || 'rating');
}

export function normalizeProviderSearchParams(params: {
  category?: string;
  city?: string;
  service?: string;
  min_price?: string;
  max_price?: string;
  min_rating?: string;
  sort?: string;
}): ProviderSearchParams {
  return {
    category: params.category as ProviderCategory | undefined,
    city: params.city || undefined,
    service: params.service || undefined,
    minPrice: toNumericFilter(params.min_price),
    maxPrice: toNumericFilter(params.max_price),
    minRating: toNumericFilter(params.min_rating),
    sort: normalizeSort(params.sort),
  };
}

export async function getUnifiedProviders(params: ProviderSearchParams): Promise<UnifiedProvider[]> {
  const category = params.category;
  const shouldFetchSitters = !category || category === 'sitter';
  const shouldFetchGroomers = !category || category === 'grooming';
  const shouldFetchTrainers = !category || category === 'dresura';

  const [sitters, groomers, trainers] = await Promise.all([
    shouldFetchSitters
      ? getSitters({
          city: params.city,
          service: params.service as ServiceType | undefined,
          min_rating: params.minRating,
          min_price: params.minPrice,
          max_price: params.maxPrice,
          sort: params.sort === 'price' ? 'price_asc' : params.sort,
        })
      : Promise.resolve([]),
    shouldFetchGroomers
      ? getGroomers({ city: params.city, service: category === 'grooming' ? params.service as never : undefined })
      : Promise.resolve([]),
    shouldFetchTrainers
      ? getTrainers({ city: params.city, type: category === 'dresura' ? params.service as never : undefined })
      : Promise.resolve([]),
  ]);

  const providers: UnifiedProvider[] = [];

  for (const s of sitters) {
    const trust = await getTrustEligibilityByUserId(s.user_id);
    if (!trust.eligible) continue;
    const prices = Object.values(s.prices).filter((p): p is number => typeof p === 'number');
    providers.push({
      id: s.user_id,
      name: s.user?.name || 'Sitter',
      avatarUrl: s.user?.avatar_url || null,
      city: s.city,
      bio: s.bio,
      rating: s.rating_avg,
      reviews: s.review_count,
      verified: s.verified,
      superhost: s.superhost,
      category: 'sitter',
      services: s.services,
      lowestPrice: prices.length > 0 ? Math.min(...prices) : undefined,
      responseTime: s.response_time,
      profileUrl: `/sitter/${s.user_id}`,
      locationLat: s.location_lat,
      locationLng: s.location_lng,
    });
  }

  for (const g of groomers) {
    const trust = await getTrustEligibilityForGroomer(g);
    if (!trust.eligible) continue;
    const prices = Object.values(g.prices || {}).filter((p): p is number => typeof p === 'number');
    providers.push({
      id: g.id,
      name: g.name,
      avatarUrl: null,
      city: g.city,
      bio: g.bio,
      rating: g.rating,
      reviews: g.review_count,
      verified: g.verified,
      superhost: false,
      category: 'grooming',
      services: g.services,
      lowestPrice: prices.length > 0 ? Math.min(...prices) : undefined,
      responseTime: null,
      profileUrl: `/groomer/${g.id}`,
      locationLat: null,
      locationLng: null,
    });
  }

  for (const t of trainers) {
    const trust = await getTrustEligibilityForTrainer(t);
    if (!trust.eligible) continue;
    providers.push({
      id: t.id,
      name: t.name,
      avatarUrl: null,
      city: t.city,
      bio: t.bio,
      rating: t.rating,
      reviews: t.review_count,
      verified: t.certified,
      superhost: false,
      category: 'dresura',
      services: t.specializations,
      lowestPrice: typeof t.price_per_hour === 'number' ? t.price_per_hour : undefined,
      responseTime: null,
      profileUrl: `/trener/${t.id}`,
      locationLat: null,
      locationLng: null,
      certified: t.certified,
      certificates: t.certificates,
    });
  }

  return applyUnifiedFilters(providers, params);
}
