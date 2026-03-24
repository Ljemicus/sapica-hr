'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/shared/empty-state';
import { createClient } from '@/lib/supabase/client';
import type { User, Message } from '@/lib/types';

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  messages: any[];
  lastMessage: any;
  unreadCount: number;
}

interface Props {
  currentUser: User;
  conversations: Conversation[];
}

export function MessagesContent({ currentUser, conversations: initialConversations }: Props) {
  const searchParams = useSearchParams();
  const toParam = searchParams.get('to');
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(toParam || (initialConversations[0]?.partnerId ?? null));
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const selectedConversation = conversations.find(c => c.partnerId === selectedPartnerId);

  // Initialize conversation if coming from sitter profile with ?to=
  useEffect(() => {
    if (toParam && !conversations.find(c => c.partnerId === toParam)) {
      const fetchPartner = async () => {
        const { data } = await supabase.from('users').select('id, name, avatar_url').eq('id', toParam).single();
        if (data) {
          setConversations(prev => [{
            partnerId: data.id,
            partnerName: data.name,
            partnerAvatar: data.avatar_url,
            messages: [],
            lastMessage: null,
            unreadCount: 0,
          }, ...prev]);
          setSelectedPartnerId(data.id);
        }
      };
      fetchPartner();
    }
  }, [toParam]);

  // Subscribe to real-time messages
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUser.id}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setConversations(prev => {
          const updated = [...prev];
          const convIndex = updated.findIndex(c => c.partnerId === newMsg.sender_id);
          if (convIndex >= 0) {
            updated[convIndex] = {
              ...updated[convIndex],
              messages: [...updated[convIndex].messages, { ...newMsg, sender: { id: newMsg.sender_id, name: '', avatar_url: null } }],
              lastMessage: newMsg,
              unreadCount: updated[convIndex].unreadCount + (selectedPartnerId === newMsg.sender_id ? 0 : 1),
            };
          }
          return updated;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, selectedPartnerId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Mark messages as read
  useEffect(() => {
    if (selectedPartnerId) {
      supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', selectedPartnerId)
        .eq('receiver_id', currentUser.id)
        .eq('read', false)
        .then();
    }
  }, [selectedPartnerId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartnerId) return;
    setSending(true);

    const msg = {
      sender_id: currentUser.id,
      receiver_id: selectedPartnerId,
      content: newMessage.trim(),
      read: false,
    };

    const { data, error } = await supabase.from('messages').insert(msg).select().single();
    if (!error && data) {
      setConversations(prev => {
        const updated = [...prev];
        const convIndex = updated.findIndex(c => c.partnerId === selectedPartnerId);
        if (convIndex >= 0) {
          updated[convIndex] = {
            ...updated[convIndex],
            messages: [...updated[convIndex].messages, { ...data, sender: { id: currentUser.id, name: currentUser.name, avatar_url: currentUser.avatar_url } }],
            lastMessage: data,
          };
        }
        return updated;
      });
      setNewMessage('');
    }
    setSending(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversation List */}
          <div className={`border-r ${selectedPartnerId ? 'hidden md:block' : ''}`}>
            <div className="p-4 border-b">
              <h2 className="font-semibold">Poruke</h2>
            </div>
            <ScrollArea className="h-[calc(100%-57px)]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nemate poruka
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setSelectedPartnerId(conv.partnerId)}
                    className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b ${
                      selectedPartnerId === conv.partnerId ? 'bg-orange-50' : ''
                    }`}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={conv.partnerAvatar || ''} />
                      <AvatarFallback className="bg-orange-100 text-orange-600">{conv.partnerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{conv.partnerName}</span>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-orange-500 text-xs h-5 w-5 p-0 flex items-center justify-center">{conv.unreadCount}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage?.content || 'Nova poruka'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={`col-span-2 flex flex-col ${!selectedPartnerId ? 'hidden md:flex' : ''}`}>
            {selectedConversation ? (
              <>
                <div className="p-4 border-b flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedPartnerId(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConversation.partnerAvatar || ''} />
                    <AvatarFallback className="bg-orange-100 text-orange-600">{selectedConversation.partnerName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{selectedConversation.partnerName}</span>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {selectedConversation.messages.map((msg, i) => {
                      const isMine = msg.sender_id === currentUser.id;
                      return (
                        <div key={msg.id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            isMine ? 'bg-orange-500 text-white' : 'bg-gray-100'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMine ? 'text-orange-100' : 'text-muted-foreground'}`}>
                              {format(new Date(msg.created_at), 'HH:mm', { locale: hr })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Napišite poruku..."
                      className="flex-1"
                    />
                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={sending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  icon={MessageCircle}
                  title="Odaberite razgovor"
                  description="Odaberite razgovor iz liste ili kontaktirajte sittera."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
