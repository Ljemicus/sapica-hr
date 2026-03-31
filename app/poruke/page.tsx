import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getMessages } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { MessagesContent } from './messages-content';

export const metadata: Metadata = {
  title: 'Poruke',
};

export default async function MessagesPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fporuke');

  const allMessages = await getMessages(user.id);
  const partnerIds = [...new Set(allMessages.map((msg) => msg.sender_id === user.id ? msg.receiver_id : msg.sender_id))];

  const supabase = await createClient();
  const { data: partners } = partnerIds.length > 0
    ? await supabase.from('users').select('id,name,avatar_url').in('id', partnerIds)
    : { data: [] };
  const partnerMap = new Map((partners || []).map((partner) => [partner.id, partner]));

  const grouped = new Map<string, typeof allMessages>();
  for (const msg of allMessages) {
    const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    const current = grouped.get(partnerId) || [];
    current.push(msg);
    grouped.set(partnerId, current);
  }

  const sortedConversations = Array.from(grouped.entries())
    .map(([partnerId, messages]) => {
      const partner = partnerMap.get(partnerId);
      const lastMessage = messages[messages.length - 1] || null;
      const unreadCount = messages.filter((m) => !m.read && m.receiver_id === user.id).length;
      return {
        partnerId,
        partnerName: partner?.name || 'Korisnik',
        partnerAvatar: partner?.avatar_url || null,
        messages,
        lastMessage,
        unreadCount,
      };
    })
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
