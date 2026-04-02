import { getRealtimeManager } from '@/lib/realtime';
import { createClient } from '@/lib/supabase/client';
import type { Message } from '@/lib/types';
import type { ConversationState } from './message-state';
import { appendMessageIfMissing, upsertConversationState } from './message-state';

export function subscribeToIncomingMessages(params: {
  currentUserId: string;
  selectedPartnerId: string | null;
  setConversations: React.Dispatch<React.SetStateAction<ConversationState[]>>;
}) {
  const { currentUserId, selectedPartnerId, setConversations } = params;
  const supabase = createClient();

  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`,
      },
      (payload) => {
        const newMsg = payload.new as Message;
        setConversations((prev) =>
          upsertConversationState(prev, newMsg.sender_id, (existing) => ({
            partnerId: newMsg.sender_id,
            partnerName: existing?.partnerName || 'Korisnik',
            partnerAvatar: existing?.partnerAvatar || null,
            messages: appendMessageIfMissing(existing?.messages || [], {
                  ...newMsg,
                  sender: {
                    id: newMsg.sender_id,
                    email: '',
                    name: existing?.partnerName || '',
                    role: 'owner',
                    avatar_url: existing?.partnerAvatar || null,
                    phone: null,
                    city: null,
                    created_at: '',
                  },
                }),
            lastMessage: newMsg,
            unreadCount: (existing?.unreadCount || 0) + (selectedPartnerId === newMsg.sender_id ? 0 : 1),
          }))
        );
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToTypingIndicators(params: {
  currentUserId: string;
  setTypingPartners: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const { currentUserId, setTypingPartners } = params;
  const rt = getRealtimeManager();
  rt.subscribe(currentUserId);

  const unsubTyping = rt.onTyping(({ partnerId, isTyping }) => {
    setTypingPartners((prev) => {
      const next = new Set(prev);
      if (isTyping) next.add(partnerId);
      else next.delete(partnerId);
      return next;
    });
  });

  return () => {
    rt.destroy();
    unsubTyping();
  };
}
