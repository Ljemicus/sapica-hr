'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveChat } from './live-chat';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';

interface Message {
  sender_id: string;
  receiver_id: string;
  sender: {
    name: string;
    avatar_url?: string | null;
    role?: 'owner' | 'sitter' | 'admin';
  };
  receiver: {
    name: string;
    avatar_url?: string | null;
    role?: 'owner' | 'sitter' | 'admin';
  };
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  partner: {
    id: string;
    name: string;
    avatar_url: string | null;
    role: 'owner' | 'sitter' | 'admin';
  };
  lastMessage: {
    content: string;
    created_at: string;
    unread: boolean;
  };
}

export function ChatWidget() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [showList, setShowList] = useState(false);
  const supabase = createClient();

  // Load conversations
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const messages = await response.json();
        
        // Group by partner
        const grouped = new Map<string, Conversation>();
        
        messages.forEach((msg: Message) => {
          const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
          const partner = msg.sender_id === user.id ? msg.receiver : msg.sender;
          
          if (!grouped.has(partnerId)) {
            grouped.set(partnerId, {
              partner: {
                id: partnerId,
                name: partner?.name || 'Korisnik',
                avatar_url: partner?.avatar_url ?? null,
                role: partner?.role || 'owner',
              },
              lastMessage: {
                content: msg.content,
                created_at: msg.created_at,
                unread: msg.receiver_id === user.id && !msg.read,
              },
            });
          }
        });
        
        setConversations(Array.from(grouped.values()));
      }
    };

    loadConversations();
  }, [user]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat-widget')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          // Refresh conversations
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase]);

  if (!user) return null;

  const activeConversation = conversations.find(c => c.partner.id === activeChat);

  // Show active chat
  if (activeChat && activeConversation) {
    return (
      <LiveChat
        partner={activeConversation.partner}
        onClose={() => setActiveChat(null)}
        minimized={minimized}
        onMinimize={() => setMinimized(!minimized)}
      />
    );
  }

  // Show conversation list
  if (showList) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border overflow-hidden">
        <div className="bg-gradient-to-r from-warm-orange to-warm-teal p-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">Poruke</h3>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/20"
            onClick={() => setShowList(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Nema poruka</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.partner.id}
                onClick={() => {
                  setActiveChat(conv.partner.id);
                  setShowList(false);
                }}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors border-b last:border-b-0 text-left"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-warm-orange/20 to-warm-teal/20 flex items-center justify-center font-semibold">
                    {conv.partner.name.charAt(0)}
                  </div>
                  {conv.lastMessage.unread && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{conv.partner.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage.content}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  // Show chat button
  const unreadCount = conversations.filter(c => c.lastMessage.unread).length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setShowList(true)}
        className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-warm-orange to-warm-teal hover:opacity-90 relative"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}
