/**
 * Sitters data layer.
 * Public sitter listings disabled — returns empty results.
 * Will be re-enabled when verified sitter data is available.
 */
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

export async function getSitters(
  _filters?: SitterFilters
): Promise<(SitterProfile & { user: User })[]> {
  return [];
}

export async function getSitter(
  _userId: string
): Promise<(SitterProfile & { user: User }) | null> {
  return null;
}

/** Alias for getSitter */
export const getSitterById = getSitter;
/** Alias for getSitter */
export const getSitterProfileById = getSitter;
