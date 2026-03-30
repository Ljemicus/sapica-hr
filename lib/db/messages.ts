import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import { getMessagesForUser as mockGetMessages } from '@/lib/mock-data';
import type { Message } from '@/lib/types';

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
    if (error || !data) return mockGetMessages(userId);
    return data as Message[];
  } catch {
    return mockGetMessages(userId);
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
      const all = mockGetMessages(userId1);
      return all.filter(
        (m) =>
          (m.sender_id === userId1 && m.receiver_id === userId2) ||
          (m.sender_id === userId2 && m.receiver_id === userId1)
      );
    }
    return data as Message[];
  } catch {
    const all = mockGetMessages(userId1);
    return all.filter(
      (m) =>
        (m.sender_id === userId1 && m.receiver_id === userId2) ||
        (m.sender_id === userId2 && m.receiver_id === userId1)
    );
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
