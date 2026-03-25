import { supabase } from '../supabase';
import { Booking } from '../../types';

export async function getBookings(): Promise<Booking[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('bookings')
    .select('*, sitter:users!sitter_id(name)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const statusMap: Record<string, Booking['status']> = {
    pending: 'pending',
    accepted: 'confirmed',
    completed: 'completed',
    rejected: 'cancelled',
    cancelled: 'cancelled',
  };

  return data.map((row: any) => ({
    id: row.id,
    sitterId: row.sitter_id,
    sitterName: row.sitter?.name || 'Sitter',
    service: row.service_type,
    startDate: row.start_date,
    endDate: row.end_date,
    status: statusMap[row.status] || 'pending',
    totalPrice: Number(row.total_price) || 0,
  }));
}

export async function getBooking(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, sitter:users!sitter_id(name)')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const statusMap: Record<string, Booking['status']> = {
    pending: 'pending',
    accepted: 'confirmed',
    completed: 'completed',
    rejected: 'cancelled',
    cancelled: 'cancelled',
  };

  return {
    id: data.id,
    sitterId: data.sitter_id,
    sitterName: data.sitter?.name || 'Sitter',
    service: data.service_type,
    startDate: data.start_date,
    endDate: data.end_date,
    status: statusMap[data.status] || 'pending',
    totalPrice: Number(data.total_price) || 0,
  };
}
