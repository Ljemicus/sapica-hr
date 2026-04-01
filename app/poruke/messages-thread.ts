import type { Message } from '@/lib/types';
import type { ConversationState } from './message-state';
import { formatLocalOutgoingMessage, upsertConversationState } from './message-state';

export async function fetchConversationThread(partnerId: string): Promise<Message[]> {
  const response = await fetch(`/api/messages?partner_id=${encodeURIComponent(partnerId)}`);
  if (!response.ok) return [];
  const messages = await response.json() as Message[];
  return messages.filter((message) => message.sender_id === partnerId || message.receiver_id === partnerId);
}

export function applyFetchedThread(params: {
  partnerId: string;
  messages: Message[];
  setConversations: React.Dispatch<React.SetStateAction<ConversationState[]>>;
  setLoadedConversationIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const { partnerId, messages, setConversations, setLoadedConversationIds } = params;

  setConversations((prev) =>
    upsertConversationState(prev, partnerId, (existing) => ({
      partnerId,
      partnerName: existing?.partnerName || 'Korisnik',
      partnerAvatar: existing?.partnerAvatar || null,
      messages,
      lastMessage: messages[messages.length - 1] || existing?.lastMessage || null,
      unreadCount: existing?.unreadCount || 0,
    }))
  );

  setLoadedConversationIds((prev) => new Set(prev).add(partnerId));
}

export async function sendConversationMessage(params: {
  currentUser: {
    id: string;
    name: string;
    avatar_url: string | null;
    email: string;
    role: 'owner' | 'sitter' | 'admin';
    phone: string | null;
    city: string | null;
    created_at: string;
  };
  selectedPartnerId: string;
  content: string;
  setConversations: React.Dispatch<React.SetStateAction<ConversationState[]>>;
  setLoadedConversationIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const { currentUser, selectedPartnerId, content, setConversations, setLoadedConversationIds } = params;

  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error('Message content is empty');
  }

  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiver_id: selectedPartnerId, content: trimmedContent }),
  });

  const payload: Message | null = response.ok ? ((await response.json()) as Message) : null;
  const localMsg: Message = payload ?? {
    id: `local-${Date.now()}`,
    sender_id: currentUser.id,
    receiver_id: selectedPartnerId,
    booking_id: null,
    content: trimmedContent,
    image_url: null,
    read: false,
    created_at: new Date().toISOString(),
  };

  setConversations((prev) =>
    upsertConversationState(prev, selectedPartnerId, (existing) => ({
      partnerId: selectedPartnerId,
      partnerName: existing?.partnerName || 'Korisnik',
      partnerAvatar: existing?.partnerAvatar || null,
      messages: [...(existing?.messages || []), formatLocalOutgoingMessage(localMsg, currentUser)],
      lastMessage: localMsg,
      unreadCount: existing?.unreadCount || 0,
    }))
  );

  setLoadedConversationIds((prev) => new Set(prev).add(selectedPartnerId));

  return localMsg;
}
