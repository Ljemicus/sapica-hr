import { supabase } from '../supabase';
import { Conversation, Message } from '../../types';

export async function getConversations(): Promise<Conversation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:users!sender_id(name, avatar_url), receiver:users!receiver_id(name, avatar_url)')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const convMap = new Map<string, any>();
  for (const msg of data) {
    const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    if (!convMap.has(otherId)) {
      const other = msg.sender_id === user.id ? msg.receiver : msg.sender;
      const unreadCount = data.filter(
        (m: any) => m.sender_id === otherId && m.receiver_id === user.id && !m.read
      ).length;
      convMap.set(otherId, {
        id: otherId,
        participantName: other?.name || 'Korisnik',
        participantAvatar: other?.avatar_url || '',
        lastMessage: msg.content || '',
        lastMessageTime: new Date(msg.created_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' }),
        unreadCount,
      });
    }
  }

  return Array.from(convMap.values());
}

export async function getMessages(otherUserId: string): Promise<Message[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    senderId: row.sender_id === user.id ? 'me' : 'other',
    text: row.content || '',
    timestamp: new Date(row.created_at).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' }),
    read: row.read,
  }));
}
