import { createClient } from '@/lib/supabase/server';
import type { Availability } from '@/lib/types';

export async function getAvailability(sitterId: string): Promise<Availability[]> {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('sitter_id', sitterId)
      .gte('date', today)
      .order('date', { ascending: true });
    if (error || !data) return [];
    return data as Availability[];
  } catch {
    return [];
  }
}

export async function setAvailability(
  sitterId: string,
  dates: string[],
  available: boolean
): Promise<Availability[]> {
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
