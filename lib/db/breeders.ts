/**
 * Breeders data layer.
 * Currently uses static data from mock-breeders.ts.
 * Will be migrated to Supabase when breeders table is created.
 * @deprecated Static data — migrate to Supabase
 */
import { getBreeders as staticGetBreeders, getBreeder as staticGetBreeder, MOCK_BREEDERS } from '@/lib/mock-breeders';
import type { Breeder } from '@/lib/mock-breeders';

export type { Breeder };

export function getBreeders(filters?: { city?: string; species?: string }): Breeder[] {
  return staticGetBreeders(filters);
}

export function getBreeder(id: string): Breeder | undefined {
  return staticGetBreeder(id);
}

export { MOCK_BREEDERS };
