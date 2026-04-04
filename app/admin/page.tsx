import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getUsers, getAllBookings, getSitters, getAllProviderApplications, getTopics } from '@/lib/db';
import { getPosts } from '@/lib/db/forum';
import { AdminContent } from './admin-content';

export const metadata: Metadata = {
  title: 'Admin',
};

export default async function AdminPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fadmin');
  if (user.role !== 'admin') redirect('/');

  const users = (await getUsers('admin-list')).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const sitters = await getSitters({ fields: 'admin-list' });
  const allBookings = await getAllBookings('admin-list');
  const providerApplications = await getAllProviderApplications();
  const forumTopics = await getTopics();
  const forumComments = (await Promise.all(forumTopics.map((topic) => getPosts(topic.id)))).flat();

  const bookings = allBookings.map(b => ({
    ...b,
    owner: b.owner || { id: b.owner_id, name: 'Nepoznato', email: '', role: 'owner' as const, avatar_url: null, phone: null, city: null, created_at: '' },
    sitter: b.sitter || { id: b.sitter_id, name: 'Nepoznato', email: '', role: 'sitter' as const, avatar_url: null, phone: null, city: null, created_at: '' },
  }));

  return (
    <AdminContent
      users={users}
      bookings={bookings}
      sitters={sitters}
      providerApplications={providerApplications}
      forumTopics={forumTopics}
      forumComments={forumComments}
    />
  );
}
