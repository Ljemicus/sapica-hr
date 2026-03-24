import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MessagesContent } from './messages-content';

export const metadata: Metadata = {
  title: 'Poruke',
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/prijava');

  const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single();
  if (!userData) redirect('/prijava');

  // Get all messages involving this user
  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:users!messages_sender_id_fkey(id, name, avatar_url)')
    .or(`sender_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`)
    .order('created_at', { ascending: true });

  // Group messages by conversation partner
  const conversations = new Map<string, { partnerId: string; partnerName: string; partnerAvatar: string | null; messages: any[]; lastMessage: any; unreadCount: number }>();

  (messages || []).forEach((msg) => {
    const partnerId = msg.sender_id === authUser.id ? msg.receiver_id : msg.sender_id;
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
    if (!msg.read && msg.receiver_id === authUser.id) {
      conv.unreadCount++;
    }
  });

  // Fetch partner details
  const partnerIds = Array.from(conversations.keys());
  if (partnerIds.length > 0) {
    const { data: partners } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .in('id', partnerIds);

    partners?.forEach((partner) => {
      const conv = conversations.get(partner.id);
      if (conv) {
        conv.partnerName = partner.name;
        conv.partnerAvatar = partner.avatar_url;
      }
    });
  }

  const sortedConversations = Array.from(conversations.values())
    .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());

  return (
    <MessagesContent
      currentUser={userData}
      conversations={sortedConversations}
    />
  );
}
