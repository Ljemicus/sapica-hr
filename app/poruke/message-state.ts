import type { Message } from '@/lib/types';

export interface ConversationState {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  messages: Message[];
  lastMessage: Message | null;
  unreadCount: number;
}

export function sortConversations(items: ConversationState[]): ConversationState[] {
  return [...items].sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
    return bTime - aTime;
  });
}

export function upsertConversationState(
  conversations: ConversationState[],
  partnerId: string,
  updater: (conversation: ConversationState | undefined) => ConversationState
): ConversationState[] {
  const existing = conversations.find((conversation) => conversation.partnerId === partnerId);
  const nextConversation = updater(existing);
  const rest = conversations.filter((conversation) => conversation.partnerId !== partnerId);
  return sortConversations([nextConversation, ...rest]);
}

export function formatLocalOutgoingMessage(payload: Message, currentUser: { id: string; name: string; avatar_url: string | null; email: string; role: 'owner' | 'sitter' | 'admin'; phone: string | null; city: string | null; created_at: string }): Message {
  return {
    ...payload,
    sender: {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role,
      avatar_url: currentUser.avatar_url,
      phone: currentUser.phone,
      city: currentUser.city,
      created_at: currentUser.created_at,
    },
  };
}


export function appendMessageIfMissing(messages: Message[], message: Message): Message[] {
  if (messages.some((existing) => existing.id === message.id)) {
    return messages;
  }
  return [...messages, message];
}
