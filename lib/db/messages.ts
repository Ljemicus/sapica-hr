import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
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

export async function getConversations(userId: string): Promise<Message[]> {
  if (!isSupabaseConfigured()) {
    return [];
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
    return [];
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
    return [];
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
    return null;
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
    return [];
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

    const messages = await getMessages(userId);
    const grouped = new Map<string, Message[]>();

    for (const message of messages) {
      const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const existing = grouped.get(partnerId) || [];
      existing.push(message);
      grouped.set(partnerId, existing);
    }

    return Array.from(grouped.entries())
      .map(([partnerId, convoMessages]) => {
        const sorted = convoMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const lastMessage = sorted[sorted.length - 1] || null;
        const partnerName = lastMessage?.sender_id === userId
          ? 'Korisnik'
          : (lastMessage?.sender?.name || 'Korisnik');
        const partnerAvatar = lastMessage?.sender_id === userId
          ? null
          : (lastMessage?.sender?.avatar_url || null);
        const unreadCount = sorted.filter((msg) => !msg.read && msg.receiver_id === userId).length;

        return {
          partnerId,
          partnerName,
          partnerAvatar,
          messages: sorted,
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
