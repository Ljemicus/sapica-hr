import { createClient } from '@/lib/supabase/server';

export type EmergencyMode = 'open_24h' | 'on_call' | 'emergency_contact' | 'emergency_intake';

export interface Veterinarian {
  id: string;
  name: string;
  slug: string;
  organization_name: string;
  branch_name: string;
  type: 'veterinarska_stanica' | 'veterinarska_ambulanta';
  official_type: string;
  address: string;
  city: string;
  postal_code: string;
  county: string;
  phone: string;
  email: string;
  website: string;
  oib: string;
  source_registry_no: string;
  source: string;
  status: string;
  verified: boolean;
  emergency_mode: EmergencyMode | null;
  emergency_phone: string;
  emergency_verified: boolean;
  emergency_source_note: string;
}

async function getVeterinarianRows() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('veterinarians')
    .select('*')
    .eq('status', 'active')
    .order('city', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching veterinarians:', error);
    return [] as Veterinarian[];
  }

  return (data ?? []) as Veterinarian[];
}

export async function getVeterinarians() {
  return getVeterinarianRows();
}

export async function getEmergencyVeterinarians() {
  const veterinarians = await getVeterinarianRows();

  return veterinarians.filter(
    (clinic) => clinic.emergency_verified && clinic.emergency_mode,
  );
}

export function getVeterinarianEmergencyLabel(mode: EmergencyMode | null | undefined) {
  switch (mode) {
    case 'open_24h':
      return '0-24 otvoreno';
    case 'on_call':
      return 'Dežurni';
    case 'emergency_contact':
      return 'Hitni kontakt';
    case 'emergency_intake':
      return 'Hitni prijem';
    default:
      return null;
  }
}

export function getVeterinarianPrimaryPhone(clinic: Pick<Veterinarian, 'emergency_phone' | 'phone'>) {
  return clinic.emergency_phone || clinic.phone || '';
}
