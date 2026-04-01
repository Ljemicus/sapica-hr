import { createClient } from '@/lib/supabase/server';

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
}

export async function getVeterinarians() {
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
