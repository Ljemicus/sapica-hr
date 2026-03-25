import { supabase } from '../supabase';
import { PetPassport } from '../../types';

export async function getPetPassport(petId: string): Promise<PetPassport | null> {
  const { data: pet, error: petError } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .single();

  if (petError || !pet) return null;

  const { data: passport } = await supabase
    .from('pet_passports')
    .select('*')
    .eq('pet_id', petId)
    .single();

  const speciesMap: Record<string, string> = {
    dog: 'Pas',
    cat: 'Mačka',
    other: 'Ostalo',
  };

  return {
    id: passport?.pet_id || petId,
    petId: petId,
    petName: pet.name,
    petImage: pet.photo_url || '',
    breed: pet.breed || '',
    type: speciesMap[pet.species] || pet.species,
    birthDate: pet.created_at ? new Date(pet.created_at).toLocaleDateString('hr-HR') : '',
    weight: pet.weight ? `${pet.weight} kg` : '',
    microchipId: '',
    vaccinations: (passport?.vaccinations || []).map((v: any, i: number) => ({
      id: String(i + 1),
      name: v.name || '',
      date: v.date || '',
      nextDate: v.nextDate || v.next_date || '',
      vet: v.vet || '',
    })),
    allergies: passport?.allergies || [],
    medications: (passport?.medications || []).map((m: any) => ({
      name: m.name || '',
      dosage: m.dosage || '',
      frequency: m.frequency || '',
    })),
    vetContact: {
      name: passport?.vet_info?.name || '',
      clinic: passport?.vet_info?.clinic || '',
      phone: passport?.vet_info?.phone || '',
      address: passport?.vet_info?.address || '',
    },
  };
}
