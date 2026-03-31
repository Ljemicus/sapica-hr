import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { getSitterProfiles, getSitterProfile } from '@/lib/mock-data';
import type { SitterProfile, User, ServiceType } from '@/lib/types';

interface SitterFilters {
  city?: string;
  service?: ServiceType;
  min_rating?: number;
  min_price?: number;
  max_price?: number;
  sort?: 'rating' | 'reviews' | 'price_asc' | 'price_desc';
  limit?: number;
  fields?: 'full' | 'homepage-card';
}

function applyFiltersAndSort(
  results: (SitterProfile & { user: User })[],
  filters?: SitterFilters
): (SitterProfile & { user: User })[] {
  let filtered = [...results];

  if (filters?.service) {
    filtered = filtered.filter(
      (s) => Array.isArray(s.services) && s.services.includes(filters.service!)
    );
  }

  if (filters?.min_price != null && filters?.service) {
    filtered = filtered.filter((s) => {
      const price = s.prices?.[filters.service!];
      return price != null && price >= filters.min_price!;
    });
  }

  if (filters?.max_price != null && filters?.service) {
    filtered = filtered.filter((s) => {
      const price = s.prices?.[filters.service!];
      return price != null && price <= filters.max_price!;
    });
  }

  switch (filters?.sort) {
    case 'rating':
      filtered.sort((a, b) => b.rating_avg - a.rating_avg);
      break;
    case 'reviews':
      filtered.sort((a, b) => b.review_count - a.review_count);
      break;
    case 'price_asc':
      if (filters?.service) {
        filtered.sort(
          (a, b) => (a.prices?.[filters.service!] ?? 0) - (b.prices?.[filters.service!] ?? 0)
        );
      }
      break;
    case 'price_desc':
      if (filters?.service) {
        filtered.sort(
          (a, b) => (b.prices?.[filters.service!] ?? 0) - (a.prices?.[filters.service!] ?? 0)
        );
      }
      break;
    default:
      filtered.sort((a, b) => b.rating_avg - a.rating_avg);
  }

  if (filters?.limit != null) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

export async function getSitters(
  filters?: SitterFilters
): Promise<(SitterProfile & { user: User })[]> {
  if (!isSupabaseConfigured()) {
    const mock = getSitterProfiles(filters ? {
      city: filters.city,
      service: filters.service,
      min_rating: filters.min_rating != null ? String(filters.min_rating) : undefined,
      min_price: filters.min_price != null ? String(filters.min_price) : undefined,
      max_price: filters.max_price != null ? String(filters.max_price) : undefined,
      sort: filters.sort,
    } : undefined);
    return mock;
  }
  try {
    const supabase = await createClient();
    const selectClause = filters?.fields === 'homepage-card'
      ? 'user_id, city, bio, rating_avg, review_count, prices, verified, superhost, user:users(name)'
      : '*, user:users(*)';

    let query = supabase.from('sitter_profiles').select(selectClause);

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }
    if (filters?.min_rating) {
      query = query.gte('rating_avg', filters.min_rating);
    }

    if (filters?.limit != null) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error || !data) {
      return applyFiltersAndSort(getSitterProfiles(), filters);
    }

    return applyFiltersAndSort(data as unknown as (SitterProfile & { user: User })[], filters);
  } catch {
    return applyFiltersAndSort(getSitterProfiles(), filters);
  }
}

export async function getSitter(
  userId: string
): Promise<(SitterProfile & { user: User }) | null> {
  if (!isSupabaseConfigured()) {
    return getSitterProfile(userId) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sitter_profiles')
      .select('*, user:users(*)')
      .eq('user_id', userId)
      .single();
    if (error || !data) return getSitterProfile(userId) ?? null;
    return data as SitterProfile & { user: User };
  } catch {
    return getSitterProfile(userId) ?? null;
  }
}

/** Alias for getSitter */
export const getSitterById = getSitter;
/** Alias for getSitter */
export const getSitterProfileById = getSitter;
