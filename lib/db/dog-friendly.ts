/**
 * Dog-friendly locations data layer.
 * Returns empty results until dog_friendly_locations table is created in Supabase.
 */
import {
  CATEGORY_LABELS,
  CITY_LIST,
  type DogFriendlyLocation,
} from '@/lib/mock-dog-friendly';

export type { DogFriendlyLocation };

export { CATEGORY_LABELS, CITY_LIST };

export async function getDogFriendlyLocations(): Promise<DogFriendlyLocation[]> {
  return [];
}

export async function getDogFriendlyLocation(_id: string): Promise<DogFriendlyLocation | undefined> {
  return undefined;
}
