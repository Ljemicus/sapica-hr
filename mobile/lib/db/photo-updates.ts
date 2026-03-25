import { supabase } from '../supabase';
import { PhotoUpdate } from '../../types';

export async function getPhotoUpdates(): Promise<PhotoUpdate[]> {
  const { data, error } = await supabase
    .from('pet_updates')
    .select('*, sitter:users!sitter_id(name, avatar_url), booking:bookings!booking_id(pet:pets!pet_id(name))')
    .eq('type', 'photo')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    sitterName: row.sitter?.name || 'Sitter',
    sitterAvatar: row.sitter?.avatar_url || '',
    petName: row.booking?.pet?.name || 'Ljubimac',
    image: row.emoji || '',
    caption: row.caption || '',
    timestamp: new Date(row.created_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' }),
    liked: false,
  }));
}
