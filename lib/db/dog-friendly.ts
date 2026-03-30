/**
 * Dog-friendly locations data layer.
 * Currently uses static data.
 * When dog_friendly_locations table is created in Supabase, swap to real queries.
 */
import {
  mockDogFriendlyLocations,
  CATEGORY_LABELS,
  CITY_LIST,
  type DogFriendlyLocation,
} from '@/lib/mock-dog-friendly';

export type { DogFriendlyLocation };

export { CATEGORY_LABELS, CITY_LIST };

export async function getDogFriendlyLocations(): Promise<DogFriendlyLocation[]> {
  return mockDogFriendlyLocations;
}

export async function getDogFriendlyLocation(id: string): Promise<DogFriendlyLocation | undefined> {
  return mockDogFriendlyLocations.find(l => l.id === id);
}
