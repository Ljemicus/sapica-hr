'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, isToday, isYesterday } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Send, ArrowLeft, MessageCircle, CheckCheck } from 'lucide-react';
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

function formatDateHeader(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Danas';
  if (isYesterday(date)) return 'Jučer';
  return format(date, 'd. MMMM yyyy.', { locale: hr });
}

function groupMessagesByDate(messages: any[]) {
  const groups: { date: string; messages: any[] }[] = [];
  let currentDate = '';
  for (const msg of messages) {
    const msgDate = format(new Date(msg.created_at), 'yyyy-MM-dd');
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groups.push({ date: msg.created_at, messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  }
  return groups;
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

  useEffect(() => {
    if (toParam && !conversations.find(c => c.partnerId === toParam)) {
      const fetchPartner = async () => {
        const { data } = await supabase.from('users').select('id, name, avatar_url').eq('id', toParam).single();
        if (data) {
          setConversations(prev => [{
            partnerId: data.id, partnerName: data.name, partnerAvatar: data.avatar_url,
            messages: [], lastMessage: null, unreadCount: 0,
          }, ...prev]);
          setSelectedPartnerId(data.id);
        }
      };
      fetchPartner();
    }
  }, [toParam]);

  useEffect(() => {
    const channel = supabase.channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUser.id}` }, (payload) => {
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
    return () => { supabase.removeChannel(channel); };
  }, [currentUser.id, selectedPartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  useEffect(() => {
    if (selectedPartnerId) {
      supabase.from('messages').update({ read: true }).eq('sender_id', selectedPartnerId).eq('receiver_id', currentUser.id).eq('read', false).then();
    }
  }, [selectedPartnerId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartnerId) return;
    setSending(true);
    const msg = { sender_id: currentUser.id, receiver_id: selectedPartnerId, content: newMessage.trim(), read: false };
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

  const messageGroups = selectedConversation ? groupMessagesByDate(selectedConversation.messages) : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-white rounded-2xl border-0 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversation List */}
          <div className={`border-r ${selectedPartnerId ? 'hidden md:block' : ''}`}>
            <div className="p-4 border-b bg-gray-50/50">
              <h2 className="font-bold text-lg">Poruke</h2>
            </div>
            <ScrollArea className="h-[calc(100%-57px)]">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Nemate poruka
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setSelectedPartnerId(conv.partnerId)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedPartnerId === conv.partnerId ? 'bg-orange-50/50 border-l-2 border-l-orange-500' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-11 w-11 flex-shrink-0">
                        <AvatarImage src={conv.partnerAvatar || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{conv.partnerName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {/* Online indicator - random for demo */}
                      <div className={`absolute -bottom-0.5 -right-0.5 status-dot ${conv.partnerId.charCodeAt(0) % 2 === 0 ? 'online' : 'offline'}`} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900' : ''}`}>{conv.partnerName}</span>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {format(new Date(conv.lastMessage.created_at), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-muted-foreground'}`}>
                          {conv.lastMessage?.content || 'Nova poruka'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-orange-500 text-xs h-5 min-w-5 p-0 flex items-center justify-center rounded-full ml-2 flex-shrink-0">{conv.unreadCount}</Badge>
                        )}
                      </div>
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
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3 bg-gray-50/50">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedPartnerId(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={selectedConversation.partnerAvatar || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm">{selectedConversation.partnerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 status-dot ${selectedConversation.partnerId.charCodeAt(0) % 2 === 0 ? 'online' : 'offline'}`} />
                  </div>
                  <div>
                    <span className="font-semibold text-sm">{selectedConversation.partnerName}</span>
                    <p className="text-[10px] text-muted-foreground">
                      {selectedConversation.partnerId.charCodeAt(0) % 2 === 0 ? 'Online' : 'Zadnji put viđen danas'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-1">
                    {messageGroups.map((group, gi) => (
                      <div key={gi}>
                        {/* Date Header */}
                        <div className="flex items-center justify-center my-4">
                          <span className="text-[11px] text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                            {formatDateHeader(group.date)}
                          </span>
                        </div>
                        {group.messages.map((msg, i) => {
                          const isMine = msg.sender_id === currentUser.id;
                          return (
                            <div key={msg.id || `${gi}-${i}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1.5`}>
                              <div className={`max-w-[75%] px-4 py-2.5 shadow-sm ${
                                isMine
                                  ? 'bg-orange-500 text-white chat-bubble-mine'
                                  : 'bg-white border chat-bubble-theirs'
                              }`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <div className={`flex items-center gap-1 justify-end mt-1 ${isMine ? 'text-orange-200' : 'text-muted-foreground'}`}>
                                  <span className="text-[10px]">{format(new Date(msg.created_at), 'HH:mm')}</span>
                                  {isMine && <CheckCheck className="h-3 w-3" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    {selectedConversation.messages.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Započnite razgovor s {selectedConversation.partnerName}</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-gray-50/50">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Napišite poruku..."
                      className="flex-1 rounded-full bg-white border-gray-200 focus:border-orange-300 px-5"
                    />
                    <Button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 rounded-full h-10 w-10 p-0 btn-hover shadow-sm"
                      disabled={sending || !newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50/30">
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
