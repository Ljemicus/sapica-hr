'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Send, Image as ImageIcon, Smile, X, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';
import { format, isToday, isYesterday } from 'date-fns';
import { hr } from 'date-fns/locale';


interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  read: boolean;
  booking_id?: string | null;
}

interface ChatUser {
  id: string;
  name: string;
  avatar_url: string | null;
  role: 'owner' | 'sitter' | 'admin';
}

interface LiveChatProps {
  partner: ChatUser;
  bookingId?: string;
  onClose?: () => void;
  minimized?: boolean;
  onMinimize?: () => void;
}

const EMOJIS = ['🐶', '🐱', '🐕', '🐈', '🦮', '🐕‍🦺', '🐾', '❤️', '👍', '😊', '😍', '🎉', '👋', '✅', '🙏'];

export function LiveChat({ partner, bookingId, onClose, minimized = false, onMinimize }: LiveChatProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Load initial messages
  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      const response = await fetch(`/api/messages?partner_id=${partner.id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    };

    loadMessages();
  }, [user, partner.id]);

  // Subscribe to real-time messages and typing
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`chat:${user.id}:${partner.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id === partner.id) {
            setMessages((prev) => [...prev, newMessage]);
            markAsRead(newMessage.id);
            setPartnerTyping(false);
          }
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId === partner.id) {
          setPartnerTyping(true);
          setTimeout(() => setPartnerTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, partner.id, supabase]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, partnerTyping]);

  const markAsRead = async (messageId: string) => {
    await supabase.from('messages').update({ read: true }).eq('id', messageId);
  };

  const sendTyping = useCallback(() => {
    if (!user) return;
    supabase.channel(`chat:${partner.id}:${user.id}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id },
    });
  }, [user, partner.id, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTyping();
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      // Typing stops automatically after 3s on receiver side
    }, 2000);
  };

  const sendMessage = useCallback(async (content: string, imageUrl: string | null = null) => {
    if (!content.trim() && !imageUrl) return;
    if (!user) return;

    setLoading(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: user.id,
      receiver_id: partner.id,
      content: content.trim(),
      image_url: imageUrl,
      created_at: new Date().toISOString(),
      read: false,
      booking_id: bookingId || null,
    };

    // Optimistic update
    setMessages((prev) => [...prev, optimisticMessage]);
    setInput('');
    setShowEmojiPicker(false);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: partner.id,
          content: content.trim(),
          image_url: imageUrl,
          booking_id: bookingId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send');
      }

      const savedMessage = await response.json();
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? savedMessage : m))
      );
    } catch {
      toast.error('Greška pri slanju poruke');
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setLoading(false);
    }
  }, [user, partner.id, bookingId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Molimo odaberite sliku');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Slika mora biti manja od 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      await sendMessage('', publicUrl);
    } catch {
      toast.error('Greška pri uploadu slike');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const insertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const formatMessageTime = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'HH:mm');
    if (isYesterday(d)) return 'Jučer ' + format(d, 'HH:mm');
    return format(d, 'dd.MM. HH:mm', { locale: hr });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach((message) => {
      const date = new Date(message.created_at);
      let dateLabel = '';
      if (isToday(date)) dateLabel = 'Danas';
      else if (isYesterday(date)) dateLabel = 'Jučer';
      else dateLabel = format(date, 'EEEE, d. MMMM', { locale: hr });

      if (dateLabel !== currentDate) {
        currentDate = dateLabel;
        groups.push({ date: dateLabel, messages: [] });
      }
      groups[groups.length - 1].messages.push(message);
    });

    return groups;
  };

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onMinimize}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-warm-orange to-warm-teal hover:opacity-90"
        >
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={partner.avatar_url || undefined} />
            <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-warm-orange to-warm-teal p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={partner.avatar_url || undefined} />
            <AvatarFallback className="bg-white/20 text-white">
              {partner.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-white">{partner.name}</h3>
            <p className="text-xs text-white/80">
              {partnerTyping ? (
                <span className="italic">Piše...</span>
              ) : (
                partner.role === 'sitter' ? 'Sitter' : 'Vlasnik'
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/20"
            onClick={onMinimize}
          >
            <span className="sr-only">Minimize</span>
            <span className="text-lg leading-none">−</span>
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-6">
          {messageGroups.map((group) => (
            <div key={group.date} className="space-y-3">
              <div className="flex justify-center">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>
              {group.messages.map((message) => {
                const isMe = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        isMe
                          ? 'bg-gradient-to-r from-warm-orange to-warm-coral text-white rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      {message.image_url && (
                        <img
                          src={message.image_url}
                          alt="Slika"
                          className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90"
                          onClick={() => window.open(message.image_url!, '_blank')}
                        />
                      )}
                      {message.content && (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      <div
                        className={`flex items-center gap-1 mt-1 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            isMe ? 'text-white/70' : 'text-muted-foreground'
                          }`}
                        >
                          {formatMessageTime(message.created_at)}
                        </span>
                        {isMe && (
                          <span className="text-white/70">
                            {message.read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {partnerTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Emoji Bar */}
      <div className="px-4 py-2 border-t bg-muted/30 flex gap-1 overflow-x-auto">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => insertEmoji(emoji)}
            className="text-lg hover:bg-muted rounded px-1 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-warm-orange rounded-full animate-spin" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Napišite poruku..."
            className="flex-1 bg-muted border-0 focus-visible:ring-1"
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={(!input.trim() && !uploadingImage) || loading}
            size="icon"
            className="shrink-0 bg-warm-orange hover:bg-warm-orange/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-xl shadow-lg border p-2 z-50">
            <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
              {['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '🐶', '🐱', '🐕', '🐈', '🦮', '🐕‍🦺', '🐩', '🐾', '🦴', '🏠', '❤️', '💕', '💖', '💗', '💓', '💝', '👍', '👎', '👌', '✌️', '🤞', '🤝', '🙏', '💪', '🔥', '⭐', '✨', '🎉', '🎊', '🎁', '🎈', '🏆', '⏰', '📅', '📍', '📞', '💬', '📸', '🎥', '🔔', '⚡', '✅', '❌', '❓', '❗', '💯', '🆗', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => insertEmoji(emoji)}
                  className="text-xl hover:bg-muted rounded p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
