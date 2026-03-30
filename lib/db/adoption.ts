/**
 * Adoption data layer.
 * Currently uses static data (adoption is a future feature).
 * When adoption_pets table is created in Supabase, swap to real queries.
 */
import {
  mockAdoptionPets,
  shelters,
  getShelterById,
  getAdoptionPetById,
  getPetsByShelter,
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
  getShelterById,
  getAdoptionPetById,
  getPetsByShelter,
};

export async function getAdoptionPets(): Promise<AdoptionPet[]> {
  return mockAdoptionPets;
}

export async function getAdoptionPet(id: string): Promise<AdoptionPet | undefined> {
  return getAdoptionPetById(id);
}

export async function getShelters(): Promise<Shelter[]> {
  return shelters;
}
