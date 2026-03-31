import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { getMessagesForUser as mockGetMessages, getUserById } from '@/lib/mock-data';
import type { Message } from '@/lib/types';


export interface ConversationSummary {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  messages: Message[];
  lastMessage: Message | null;
  unreadCount: number;
}

interface ConversationSummaryRow {
  partner_id: string;
  partner_name: string | null;
  partner_avatar: string | null;
  last_message_id: string | null;
  last_message_sender_id: string | null;
  last_message_receiver_id: string | null;
  last_message_booking_id: string | null;
  last_message_content: string | null;
  last_message_image_url: string | null;
  last_message_read: boolean | null;
  last_message_created_at: string | null;
  unread_count: number | null;
}

function buildMockConversationSummaries(userId: string): ConversationSummary[] {
  const allMessages = mockGetMessages(userId);
  const partnerIds = [...new Set(allMessages.map((msg) => msg.sender_id === userId ? msg.receiver_id : msg.sender_id))];
  const grouped = new Map<string, Message[]>();

  for (const msg of allMessages) {
    const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
    const current = grouped.get(partnerId) || [];
    current.push(msg);
    grouped.set(partnerId, current);
  }

  return partnerIds.map((partnerId) => {
    const partner = getUserById(partnerId);
    const messages = (grouped.get(partnerId) || []).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const lastMessage = messages[messages.length - 1] || null;
    const unreadCount = messages.filter((m) => !m.read && m.receiver_id === userId).length;

    return {
      partnerId,
      partnerName: partner?.name || 'Korisnik',
      partnerAvatar: partner?.avatar_url || null,
      messages,
      lastMessage,
      unreadCount,
    };
  }).sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

export async function getConversations(userId: string): Promise<Message[]> {
  if (!isSupabaseConfigured()) {
    const all = mockGetMessages(userId);
    const seen = new Set<string>();
    const conversations: Message[] = [];
    const sorted = [...all].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    for (const msg of sorted) {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!seen.has(partnerId)) {
        seen.add(partnerId);
        conversations.push(msg);
      }
    }
    return conversations;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(*)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error || !data) {
      return [];
    }
    const seen = new Set<string>();
    const conversations: Message[] = [];
    for (const msg of data as Message[]) {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!seen.has(partnerId)) {
        seen.add(partnerId);
        conversations.push(msg);
      }
    }
    return conversations;
  } catch {
    return [];
  }
}

export async function getMessages(userId: string): Promise<Message[]> {
  if (!isSupabaseConfigured()) {
    return mockGetMessages(userId);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(*)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Message[];
  } catch {
    return [];
  }
}

export async function getConversation(
  userId1: string,
  userId2: string
): Promise<Message[]> {
  if (!isSupabaseConfigured()) {
    const all = mockGetMessages(userId1);
    return all.filter(
      (m) =>
        (m.sender_id === userId1 && m.receiver_id === userId2) ||
        (m.sender_id === userId2 && m.receiver_id === userId1)
    );
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(*)')
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .order('created_at', { ascending: true });
    if (error || !data) {
      return [];
    }
    return data as Message[];
  } catch {
    return [];
  }
}

export async function sendMessage(
  messageData: Omit<Message, 'id' | 'created_at' | 'sender'>
): Promise<Message | null> {
  if (!isSupabaseConfigured()) {
    const mockMsg: Message = {
      ...messageData,
      id: `mock-msg-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    return mockMsg;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select('*, sender:users!sender_id(*)')
      .single();
    if (error || !data) return null;
    return data as Message;
  } catch {
    return null;
  }
}

export async function markAsRead(
  userId: string,
  partnerId: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await createClient();
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', userId)
      .eq('read', false);
  } catch {
    // silently fail
  }
}

export async function getConversationSummaries(userId: string): Promise<ConversationSummary[]> {
  if (!isSupabaseConfigured()) {
    return buildMockConversationSummaries(userId);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_message_conversation_summaries', {
      p_user_id: userId,
    });

    if (!error && Array.isArray(data)) {
      return (data as ConversationSummaryRow[]).map((row) => ({
        partnerId: row.partner_id,
        partnerName: row.partner_name || 'Korisnik',
        partnerAvatar: row.partner_avatar,
        messages: [],
        lastMessage: row.last_message_id
          ? {
              id: row.last_message_id,
              sender_id: row.last_message_sender_id || userId,
              receiver_id: row.last_message_receiver_id || row.partner_id,
              booking_id: row.last_message_booking_id,
              content: row.last_message_content,
              image_url: row.last_message_image_url,
              read: row.last_message_read ?? true,
              created_at: row.last_message_created_at || new Date(0).toISOString(),
            }
          : null,
        unreadCount: row.unread_count ?? 0,
      }));
    }
  } catch {
    // fall through to compatibility path below
  }

  try {
    const allMessages = await getMessages(userId);
    const partnerIds = [...new Set(allMessages.map((msg) => msg.sender_id === userId ? msg.receiver_id : msg.sender_id))];

    if (partnerIds.length === 0) return [];

    const supabase = await createClient();
    const { data: partners, error } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .in('id', partnerIds);

    if (error) return [];

    const partnerMap = new Map((partners || []).map((partner) => [partner.id as string, partner]));
    const grouped = new Map<string, Message[]>();

    for (const msg of allMessages) {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const current = grouped.get(partnerId) || [];
      current.push(msg);
      grouped.set(partnerId, current);
    }

    return Array.from(grouped.entries())
      .map(([partnerId, messages]) => {
        const partner = partnerMap.get(partnerId);
        const sortedMessages = [...messages].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const lastMessage = sortedMessages[sortedMessages.length - 1] || null;
        const unreadCount = sortedMessages.filter((m) => !m.read && m.receiver_id === userId).length;

        return {
          partnerId,
          partnerName: (partner?.name as string | undefined) || 'Korisnik',
          partnerAvatar: (partner?.avatar_url as string | null | undefined) || null,
          messages: sortedMessages,
          lastMessage,
          unreadCount,
        };
      })
      .sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bTime - aTime;
      });
  } catch {
    return [];
  }
}
