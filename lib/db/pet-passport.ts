import { createClient } from '@/lib/supabase/server';
import type { PetPassport } from '@/lib/types';

export async function getPassport(petId: string): Promise<PetPassport | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pet_passports')
      .select('*')
      .eq('pet_id', petId)
      .single();
    if (error || !data) return null;
    return data as PetPassport;
  } catch {
    return null;
  }
}

export async function updatePassport(
  petId: string,
  passportData: Partial<Omit<PetPassport, 'pet_id'>>
): Promise<PetPassport | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pet_passports')
      .upsert({ pet_id: petId, ...passportData }, { onConflict: 'pet_id' })
      .select()
      .single();
    if (error || !data) return null;
    return data as PetPassport;
  } catch {
    return null;
  }
}
