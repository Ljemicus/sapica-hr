import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { getPetPassport as mockGetPassport } from '@/lib/mock-data';
import type { PetPassport } from '@/lib/types';

export async function getPassport(petId: string): Promise<PetPassport | null> {
  if (!isSupabaseConfigured()) {
    return mockGetPassport(petId) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pet_passports')
      .select('*')
      .eq('pet_id', petId)
      .single();
    if (error || !data) return mockGetPassport(petId) ?? null;
    return data as PetPassport;
  } catch {
    return mockGetPassport(petId) ?? null;
  }
}

export async function updatePassport(
  petId: string,
  passportData: Partial<Omit<PetPassport, 'pet_id'>>
): Promise<PetPassport | null> {
  if (!isSupabaseConfigured()) {
    const existing = mockGetPassport(petId);
    if (existing) return { ...existing, ...passportData };
    return { pet_id: petId, vaccinations: [], allergies: [], medications: [], vet_info: { name: '', phone: '', address: '', emergency: false }, notes: '', ...passportData };
  }
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
