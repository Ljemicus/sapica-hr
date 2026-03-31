import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getConversationSummaries } from '@/lib/db';
import { MessagesContent } from './messages-content';

export const metadata: Metadata = {
  title: 'Poruke',
};

export default async function MessagesPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fporuke');

  const sortedConversations = await getConversationSummaries(user.id);

  return (
    <MessagesContent
      currentUser={user}
      conversations={sortedConversations}
    />
  );
}
