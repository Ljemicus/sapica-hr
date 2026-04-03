/**
 * Adoption data layer.
 * Returns empty results until adoption feature is connected to Supabase.
 */
import {
  formatAge,
  getAgeCategory,
  getAgeCategoryLabel,
  SPECIES_EMOJI,
  SPECIES_LABEL,
  GENDER_LABEL,
  SIZE_LABEL,
  type AdoptionPet,
  type Shelter,
} from '@/lib/mock-adoption-data';

export type { AdoptionPet, Shelter };

export {
  SPECIES_EMOJI,
  SPECIES_LABEL,
  GENDER_LABEL,
  SIZE_LABEL,
  formatAge,
  getAgeCategory,
  getAgeCategoryLabel,
};

export async function getAdoptionPets(): Promise<AdoptionPet[]> {
  return [];
}

export async function getAdoptionPet(_id: string): Promise<AdoptionPet | undefined> {
  return undefined;
}

export async function getShelters(): Promise<Shelter[]> {
  return [];
}
