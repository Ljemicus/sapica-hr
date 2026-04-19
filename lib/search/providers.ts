import type { ServiceType } from '@/lib/types';
import type { UnifiedProvider, ProviderCategory } from '@/app/pretraga/types';
import { getUnifiedProvidersFromProviderModel } from './provider-adapters';

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
  const providers = await getUnifiedProvidersFromProviderModel();

  let next = providers;

  if (params.category) {
    next = next.filter((provider) => provider.category === params.category);
  }

  if (params.city) {
    const city = params.city.toLowerCase();
    next = next.filter((provider) => (provider.city || '').toLowerCase() === city);
  }

  if (params.service) {
    next = next.filter((provider) => provider.services.includes(params.service as ServiceType));
  }

  return applyUnifiedFilters(next, params);
}
