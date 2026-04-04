import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { SitterProfile, User, ServiceType } from '@/lib/types';

interface SitterFilters {
  city?: string;
  service?: ServiceType;
  min_rating?: number;
  min_price?: number;
  max_price?: number;
  sort?: 'rating' | 'reviews' | 'price_asc' | 'price_desc';
  limit?: number;
  fields?: 'full' | 'homepage-card' | 'admin-list';
}

type PublicSitter = SitterProfile & { user: User };

function normalizeSitter(row: Record<string, unknown>): PublicSitter | null {
  const user = row.user as User | null | undefined;
  if (!user) return null;

  return {
    user_id: row.user_id as string,
    bio: (row.bio as string | null | undefined) ?? null,
    experience_years: Number(row.experience_years ?? 0),
    services: Array.isArray(row.services) ? (row.services as ServiceType[]) : [],
    prices: (row.prices as Record<ServiceType, number> | null | undefined) ?? {} as Record<ServiceType, number>,
    verified: Boolean(row.verified),
    superhost: Boolean(row.superhost),
    response_time: (row.response_time as string | null | undefined) ?? null,
    rating_avg: Number(row.rating_avg ?? 0),
    review_count: Number(row.review_count ?? 0),
    location_lat: row.location_lat == null ? null : Number(row.location_lat),
    location_lng: row.location_lng == null ? null : Number(row.location_lng),
    city: (row.city as string | null | undefined) ?? user.city ?? null,
    photos: Array.isArray(row.photos) ? (row.photos as string[]) : [],
    created_at: (row.created_at as string) ?? new Date().toISOString(),
    user,
  };
}

function sitterLowestPrice(profile: PublicSitter): number {
  const values = Object.values(profile.prices || {}).filter((value) => typeof value === 'number' && value > 0);
  return values.length ? Math.min(...values) : Number.POSITIVE_INFINITY;
}

export async function getSitters(
  filters?: SitterFilters
): Promise<PublicSitter[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from('sitter_profiles')
      .select('user_id, bio, experience_years, services, prices, verified, superhost, response_time, rating_avg, review_count, location_lat, location_lng, city, photos, created_at, user:users!user_id(id, email, name, role, avatar_url, phone, city, created_at)')
      .eq('verified', true);

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let results = (data as Record<string, unknown>[])
      .map(normalizeSitter)
      .filter((profile): profile is PublicSitter => Boolean(profile));

    if (filters?.service) {
      results = results.filter((profile) => profile.services.includes(filters.service!));
    }

    if (filters?.min_rating !== undefined) {
      results = results.filter((profile) => profile.rating_avg >= filters.min_rating!);
    }

    if (filters?.min_price !== undefined) {
      results = results.filter((profile) => sitterLowestPrice(profile) >= filters.min_price!);
    }

    if (filters?.max_price !== undefined) {
      results = results.filter((profile) => sitterLowestPrice(profile) <= filters.max_price!);
    }

    switch (filters?.sort) {
      case 'reviews':
        results.sort((a, b) => b.review_count - a.review_count);
        break;
      case 'price_asc':
        results.sort((a, b) => sitterLowestPrice(a) - sitterLowestPrice(b));
        break;
      case 'price_desc':
        results.sort((a, b) => sitterLowestPrice(b) - sitterLowestPrice(a));
        break;
      case 'rating':
      default:
        results.sort((a, b) => b.rating_avg - a.rating_avg || b.review_count - a.review_count);
        break;
    }

    return results;
  } catch {
    return [];
  }
}

export async function getSitter(
  userId: string
): Promise<PublicSitter | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sitter_profiles')
      .select('user_id, bio, experience_years, services, prices, verified, superhost, response_time, rating_avg, review_count, location_lat, location_lng, city, photos, created_at, user:users!user_id(id, email, name, role, avatar_url, phone, city, created_at)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return normalizeSitter(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

/** Alias for getSitter */
export const getSitterById = getSitter;
/** Alias for getSitter */
export const getSitterProfileById = getSitter;
