import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Booking, BookingStatus } from '../types/database';
import { useAuth } from '../context/AuthContext';

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, pet:pets(*), owner:users!bookings_owner_id_fkey(*), sitter:users!bookings_sitter_id_fkey(*)')
      .or(`owner_id.eq.${user.id},sitter_id.eq.${user.id}`)
      .order('start_date', { ascending: false });
    setBookings((data ?? []) as Booking[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = async (booking: {
    sitter_id: string;
    pet_id: string;
    service_type: string;
    start_date: string;
    end_date: string;
    total_price: number;
    notes?: string;
  }) => {
    if (!user) return { error: 'Not authenticated' };
    const { data, error } = await supabase
      .from('bookings')
      .insert({ ...booking, owner_id: user.id })
      .select('*, pet:pets(*), owner:users!bookings_owner_id_fkey(*), sitter:users!bookings_sitter_id_fkey(*)')
      .single();
    if (data) setBookings(prev => [data as Booking, ...prev]);
    return { data: data as Booking | null, error: error?.message ?? null };
  };

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select('*, pet:pets(*), owner:users!bookings_owner_id_fkey(*), sitter:users!bookings_sitter_id_fkey(*)')
      .single();
    if (data) setBookings(prev => prev.map(b => (b.id === id ? (data as Booking) : b)));
    return { error: error?.message ?? null };
  };

  const getBooking = async (id: string) => {
    const { data } = await supabase
      .from('bookings')
      .select('*, pet:pets(*), owner:users!bookings_owner_id_fkey(*), sitter:users!bookings_sitter_id_fkey(*)')
      .eq('id', id)
      .single();
    return data as Booking | null;
  };

  return { bookings, loading, fetchBookings, createBooking, updateBookingStatus, getBooking };
}
