import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getConversations, getConversation } from '@/lib/db';
import { getUser } from '@/lib/db';
import { MessagesContent } from './messages-content';

export const metadata: Metadata = {
  title: 'Poruke',
};

export default async function MessagesPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava');

  const convSummaries = await getConversations(user.id);

  // Build conversation objects with partner details and messages
  const conversationMap = new Map<string, {
    partnerId: string;
    partnerName: string;
    partnerAvatar: string | null;
    messages: typeof convSummaries;
    lastMessage: typeof convSummaries[0] | null;
    unreadCount: number;
  }>();

  for (const msg of convSummaries) {
    const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    if (!conversationMap.has(partnerId)) {
      // Fetch full conversation between user and partner
      const fullMessages = await getConversation(user.id, partnerId);
      const unreadCount = fullMessages.filter(m => !m.read && m.receiver_id === user.id).length;
      const partner = await getUser(partnerId);

      conversationMap.set(partnerId, {
        partnerId,
        partnerName: partner?.name || 'Korisnik',
        partnerAvatar: partner?.avatar_url || null,
        messages: fullMessages,
        lastMessage: msg,
        unreadCount,
      });
    }
  }

  const sortedConversations = Array.from(conversationMap.values())
    .sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
      return bTime - aTime;
    });

  return (
    <MessagesContent
      currentUser={user}
      conversations={sortedConversations}
    />
  );
}
