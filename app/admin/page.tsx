import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { mockUsers, mockBookings, mockSitterProfiles, getUserById } from '@/lib/mock-data';
import { AdminContent } from './admin-content';

export const metadata: Metadata = {
  title: 'Admin',
};

export default async function AdminPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava');
  if (user.role !== 'admin') redirect('/');

  const users = [...mockUsers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const bookings = [...mockBookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(b => ({
      ...b,
      owner: getUserById(b.owner_id) || { id: b.owner_id, name: 'Nepoznato', email: '', role: 'owner' as const, avatar_url: null, phone: null, city: null, created_at: '' },
      sitter: getUserById(b.sitter_id) || { id: b.sitter_id, name: 'Nepoznato', email: '', role: 'sitter' as const, avatar_url: null, phone: null, city: null, created_at: '' },
    }));

  const sitters = mockSitterProfiles;

  return (
    <AdminContent
      users={users}
      bookings={bookings}
      sitters={sitters}
    />
  );
}
