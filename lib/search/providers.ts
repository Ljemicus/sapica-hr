import { getGroomers, getSitters, getTrainers } from '@/lib/db';
import type { ServiceType } from '@/lib/types';
import type { UnifiedProvider, ProviderCategory } from '@/app/pretraga/types';

interface ProviderSearchParams {
  category?: ProviderCategory;
  city?: string;
  service?: string;
  min_price?: string;
  max_price?: string;
  min_rating?: string;
  sort?: string;
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
          min_rating: params.min_rating ? Number(params.min_rating) : undefined,
          min_price: params.min_price ? Number(params.min_price) : undefined,
          max_price: params.max_price ? Number(params.max_price) : undefined,
          sort: params.sort as 'rating' | 'reviews' | 'price_asc' | 'price_desc' | undefined,
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
    providers.push({
      id: g.id,
      name: g.name,
      avatarUrl: null,
      city: g.city,
      bio: g.bio,
      rating: g.rating,
      reviews: g.reviews,
      verified: g.verified,
      superhost: false,
      category: 'grooming',
      services: g.services,
      lowestPrice: undefined,
      responseTime: null,
      profileUrl: `/groomer/${g.id}`,
      locationLat: null,
      locationLng: null,
    });
  }

  for (const t of trainers) {
    providers.push({
      id: t.id,
      name: t.name,
      avatarUrl: null,
      city: t.city,
      bio: t.bio,
      rating: t.rating,
      reviews: t.reviews,
      verified: t.certified,
      superhost: false,
      category: 'dresura',
      services: t.specializations,
      lowestPrice: undefined,
      responseTime: null,
      profileUrl: `/trener/${t.id}`,
      locationLat: null,
      locationLng: null,
      certified: t.certified,
      certificates: t.certificates,
    });
  }

  return providers.sort((a, b) => b.rating - a.rating);
}
