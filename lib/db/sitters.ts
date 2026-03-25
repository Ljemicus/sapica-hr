import { createClient } from '@/lib/supabase/server';
import type { SitterProfile, User, ServiceType } from '@/lib/types';

interface SitterFilters {
  city?: string;
  service?: ServiceType;
  min_rating?: number;
  min_price?: number;
  max_price?: number;
  sort?: 'rating' | 'reviews' | 'price_asc' | 'price_desc';
}

export async function getSitters(
  filters?: SitterFilters
): Promise<(SitterProfile & { user: User })[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from('sitter_profiles').select('*, user:users(*)');

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }
    if (filters?.min_rating) {
      query = query.gte('rating_avg', filters.min_rating);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let results = data as (SitterProfile & { user: User })[];

    // Filter JSONB fields in JS
    if (filters?.service) {
      results = results.filter(
        (s) => Array.isArray(s.services) && s.services.includes(filters.service!)
      );
    }

    if (filters?.min_price != null && filters?.service) {
      results = results.filter((s) => {
        const price = s.prices?.[filters.service!];
        return price != null && price >= filters.min_price!;
      });
    }

    if (filters?.max_price != null && filters?.service) {
      results = results.filter((s) => {
        const price = s.prices?.[filters.service!];
        return price != null && price <= filters.max_price!;
      });
    }

    // Sorting
    switch (filters?.sort) {
      case 'rating':
        results.sort((a, b) => b.rating_avg - a.rating_avg);
        break;
      case 'reviews':
        results.sort((a, b) => b.review_count - a.review_count);
        break;
      case 'price_asc':
        if (filters?.service) {
          results.sort(
            (a, b) => (a.prices?.[filters.service!] ?? 0) - (b.prices?.[filters.service!] ?? 0)
          );
        }
        break;
      case 'price_desc':
        if (filters?.service) {
          results.sort(
            (a, b) => (b.prices?.[filters.service!] ?? 0) - (a.prices?.[filters.service!] ?? 0)
          );
        }
        break;
      default:
        results.sort((a, b) => b.rating_avg - a.rating_avg);
    }

    return results;
  } catch {
    return [];
  }
}

export async function getSitter(
  userId: string
): Promise<(SitterProfile & { user: User }) | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sitter_profiles')
      .select('*, user:users(*)')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data as SitterProfile & { user: User };
  } catch {
    return null;
  }
}
