import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { getAvailabilityForSitter as mockGetAvailability } from '@/lib/mock-data';
import type { Availability } from '@/lib/types';

export async function getAvailability(sitterId: string): Promise<Availability[]> {
  if (!isSupabaseConfigured()) {
    return mockGetAvailability(sitterId);
  }
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('availability')
      .select('id, sitter_id, date, available')
      .eq('sitter_id', sitterId)
      .gte('date', today)
      .order('date', { ascending: true });
    if (error || !data) return mockGetAvailability(sitterId);
    return data as Availability[];
  } catch {
    return mockGetAvailability(sitterId);
  }
}

export async function setAvailability(
  sitterId: string,
  dates: string[],
  available: boolean
): Promise<Availability[]> {
  if (!isSupabaseConfigured()) {
    return dates.map((date, i) => ({
      id: `mock-avail-${Date.now()}-${i}`,
      sitter_id: sitterId,
      date,
      available,
    }));
  }
  try {
    const supabase = await createClient();
    const records = dates.map((date) => ({
      sitter_id: sitterId,
      date,
      available,
    }));
    const { data, error } = await supabase
      .from('availability')
      .upsert(records, { onConflict: 'sitter_id,date' })
      .select();
    if (error || !data) return [];
    return data as Availability[];
  } catch {
    return [];
  }
}
