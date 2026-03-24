import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Message, Conversation, User } from '../types/database';
import { useAuth } from '../context/AuthContext';

export function useMessages(otherUserId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: msgs } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(*), receiver:users!messages_receiver_id_fkey(*)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!msgs) {
      setLoading(false);
      return;
    }

    const convMap = new Map<string, Conversation>();
    for (const msg of msgs as Message[]) {
      const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
      if (!otherUser) continue;
      const key = otherUser.id;
      if (!convMap.has(key)) {
        const unread = (msgs as Message[]).filter(
          m => m.sender_id === key && m.receiver_id === user.id && !m.read
        ).length;
        convMap.set(key, {
          user: otherUser as User,
          lastMessage: msg,
          unreadCount: unread,
        });
      }
    }

    setConversations(Array.from(convMap.values()));
    setLoading(false);
  }, [user]);

  // Fetch messages for a specific chat
  const fetchMessages = useCallback(async () => {
    if (!user || !otherUserId) return;
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(*), receiver:users!messages_receiver_id_fkey(*)')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true });
    setMessages((data ?? []) as Message[]);
    setLoading(false);

    // Mark as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', otherUserId)
      .eq('receiver_id', user.id)
      .eq('read', false);
  }, [user, otherUserId]);

  // Realtime subscription
  useEffect(() => {
    if (!user || !otherUserId) return;
    fetchMessages();

    const channel = supabase
      .channel(`chat:${[user.id, otherUserId].sort().join('-')}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${otherUserId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === otherUserId && newMsg.receiver_id === user.id) ||
            (newMsg.sender_id === user.id && newMsg.receiver_id === otherUserId)
          ) {
            setMessages(prev => [...prev, newMsg]);
            // Auto mark as read
            supabase
              .from('messages')
              .update({ read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, otherUserId, fetchMessages]);

  const sendMessage = async (receiverId: string, text: string, bookingId?: string) => {
    if (!user) return { error: 'Not authenticated' };
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        text,
        booking_id: bookingId ?? null,
      })
      .select()
      .single();
    if (data) setMessages(prev => [...prev, data as Message]);
    return { error: error?.message ?? null };
  };

  return { messages, conversations, loading, fetchConversations, fetchMessages, sendMessage };
}
