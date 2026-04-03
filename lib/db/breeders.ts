/**
 * Breeders data layer.
 * Will be connected to Supabase when breeders table is created.
 * Returns empty results until real data is available.
 */
import type { Breeder } from '@/lib/mock-breeders';

export type { Breeder };

export function getBreeders(_filters?: { city?: string; species?: string }): Breeder[] {
  return [];
}

export function getBreeder(_id: string): Breeder | undefined {
  return undefined;
}
