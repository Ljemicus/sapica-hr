import { createClient } from '@/lib/supabase/server';
import { appLogger } from '@/lib/logger';

export type { EmergencyMode, Veterinarian } from './veterinarian-helpers';
export { getVeterinarianEmergencyLabel, getVeterinarianPrimaryPhone } from './veterinarian-helpers';

import type { Veterinarian } from './veterinarian-helpers';

async function getVeterinarianRows() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('veterinarians')
    .select('*')
    .eq('status', 'active')
    .order('city', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    appLogger.error('db.veterinarians', 'Failed to fetch veterinarians', { error: error.message });
    return [] as Veterinarian[];
  }

  return (data ?? []) as Veterinarian[];
}

export async function getVeterinarians() {
  return getVeterinarianRows();
}

export async function getAllVeterinarians() {
  return getVeterinarianRows();
}

export async function getVeterinarianBySlug(slug: string): Promise<Veterinarian | null> {
  if (!slug) return null;
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('veterinarians')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Veterinarian;
}

export async function getEmergencyVeterinarians() {
  const veterinarians = await getVeterinarianRows();

  return veterinarians.filter(
    (clinic) => clinic.emergency_verified && clinic.emergency_mode,
  );
}
