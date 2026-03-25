import { createClient } from '@/lib/supabase/server';
import type { PetUpdate } from '@/lib/types';

export async function getUpdates(): Promise<PetUpdate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pet_updates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as PetUpdate[];
  } catch {
    return [];
  }
}

export async function getUpdatesByBooking(bookingId: string): Promise<PetUpdate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pet_updates')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as PetUpdate[];
  } catch {
    return [];
  }
}
