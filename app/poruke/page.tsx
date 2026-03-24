import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMockUser } from '@/lib/mock-auth';
import { getMessagesForUser, getUserById } from '@/lib/mock-data';
import { MessagesContent } from './messages-content';

export const metadata: Metadata = {
  title: 'Poruke',
};

export default async function MessagesPage() {
  const user = await getMockUser();
  if (!user) redirect('/prijava');

  const messages = getMessagesForUser(user.id);

  // Group messages by conversation partner
  const conversations = new Map<string, { partnerId: string; partnerName: string; partnerAvatar: string | null; messages: typeof messages; lastMessage: typeof messages[0] | null; unreadCount: number }>();

  messages.forEach((msg) => {
    const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    if (!conversations.has(partnerId)) {
      conversations.set(partnerId, {
        partnerId,
        partnerName: '',
        partnerAvatar: null,
        messages: [],
        lastMessage: null,
        unreadCount: 0,
      });
    }
    const conv = conversations.get(partnerId)!;
    conv.messages.push(msg);
    conv.lastMessage = msg;
    if (!msg.read && msg.receiver_id === user.id) {
      conv.unreadCount++;
    }
  });

  // Fill partner details
  for (const [partnerId, conv] of conversations) {
    const partner = getUserById(partnerId);
    if (partner) {
      conv.partnerName = partner.name;
      conv.partnerAvatar = partner.avatar_url;
    }
  }

  const sortedConversations = Array.from(conversations.values())
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
