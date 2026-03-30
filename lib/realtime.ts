// Supabase Realtime wrapper for messages
// Replaces the old mock EventEmitter-based implementation.
// Uses Supabase Realtime channels for actual message delivery.

import { createClient } from '@/lib/supabase/client';
import type { Message } from '@/lib/types';

type MessageHandler = (message: Message) => void;
type TypingHandler = (data: { partnerId: string; isTyping: boolean }) => void;

class RealtimeManager {
  private messageHandlers: Set<MessageHandler> = new Set();
  private typingHandlers: Set<TypingHandler> = new Set();
  private channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null;
  private supabase = createClient();
  private subscribedUserId: string | null = null;

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onTyping(handler: TypingHandler): () => void {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  /**
   * Subscribe to real-time message inserts for a given user.
   * Call this once when the messages page mounts.
   */
  subscribe(userId: string): void {
    if (this.subscribedUserId === userId && this.channel) return;
    this.unsubscribe();
    this.subscribedUserId = userId;

    this.channel = this.supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          this.messageHandlers.forEach((h) => h(newMsg));
        }
      )
      .subscribe();
  }

  unsubscribe(): void {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
      this.subscribedUserId = null;
    }
  }

  /**
   * Set typing state for a partner (local UI only — no server broadcast).
   * Components can call this to show/hide typing indicator.
   */
  setTyping(partnerId: string, isTyping: boolean): void {
    this.typingHandlers.forEach((h) => h({ partnerId, isTyping }));
  }

  destroy(): void {
    this.unsubscribe();
    this.messageHandlers.clear();
    this.typingHandlers.clear();
  }
}

// Singleton instance
let instance: RealtimeManager | null = null;

export function getRealtimeManager(): RealtimeManager {
  if (!instance) {
    instance = new RealtimeManager();
  }
  return instance;
}
