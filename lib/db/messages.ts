import { createClient } from '@/lib/supabase/server';
import type { Message } from '@/lib/types';

export async function getMessages(userId: string): Promise<Message[]> {
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
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(*)')
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .order('created_at', { ascending: true });
    if (error || !data) return [];
    return data as Message[];
  } catch {
    return [];
  }
}

export async function sendMessage(
  messageData: Omit<Message, 'id' | 'created_at' | 'sender'>
): Promise<Message | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
    if (error || !data) return null;
    return data as Message;
  } catch {
    return null;
  }
}
