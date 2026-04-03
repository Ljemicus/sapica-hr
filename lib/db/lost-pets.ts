/**
 * Lost-pets data layer.
 * Seeded lost-pet content disabled — returns empty results.
 * Will be re-enabled when real lost-pet reports are available.
 */
import type { LostPet, LostPetSpecies, LostPetStatus } from '@/lib/types';

interface LostPetFilters {
  city?: string;
  species?: LostPetSpecies;
  status?: LostPetStatus;
  limit?: number;
  fields?: 'full' | 'homepage-card';
}

export async function getLostPets(_filters?: LostPetFilters): Promise<LostPet[]> {
  return [];
}

export async function getLostPet(_id: string): Promise<LostPet | null> {
  return null;
}
