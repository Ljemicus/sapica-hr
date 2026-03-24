import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminContent } from './admin-content';

export const metadata: Metadata = {
  title: 'Admin',
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/prijava');

  const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single();
  if (!userData || userData.role !== 'admin') redirect('/');

  const [usersRes, bookingsRes, sittersRes] = await Promise.all([
    supabase.from('users').select('*').order('created_at', { ascending: false }),
    supabase.from('bookings').select('*, owner:users!bookings_owner_id_fkey(name), sitter:users!bookings_sitter_id_fkey(name)').order('created_at', { ascending: false }),
    supabase.from('sitter_profiles').select('*, user:users!sitter_profiles_user_id_fkey(name, email)').order('created_at', { ascending: false }),
  ]);

  return (
    <AdminContent
      users={usersRes.data || []}
      bookings={bookingsRes.data || []}
      sitters={sittersRes.data || []}
    />
  );
}
