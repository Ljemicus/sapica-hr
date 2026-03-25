import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getUsers, getBookings, getSitters } from '@/lib/db';
import { AdminContent } from './admin-content';

export const metadata: Metadata = {
  title: 'Admin',
};

export default async function AdminPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava');
  if (user.role !== 'admin') redirect('/');

  const users = (await getUsers()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // getBookings needs a userId+role; for admin we fetch all via owner/sitter approach
  // Use getSitters to get sitter profiles, and fetch bookings for all
  const sitters = await getSitters();

  // For admin, we need all bookings — fetch via Supabase directly
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data: allBookings } = await supabase
    .from('bookings')
    .select('*, owner:users!owner_id(*), sitter:users!sitter_id(*)')
    .order('created_at', { ascending: false });

  const bookings = (allBookings || []).map(b => ({
    ...b,
    owner: b.owner || { id: b.owner_id, name: 'Nepoznato', email: '', role: 'owner' as const, avatar_url: null, phone: null, city: null, created_at: '' },
    sitter: b.sitter || { id: b.sitter_id, name: 'Nepoznato', email: '', role: 'sitter' as const, avatar_url: null, phone: null, city: null, created_at: '' },
  }));

  return (
    <AdminContent
      users={users}
      bookings={bookings}
      sitters={sitters}
    />
  );
}
