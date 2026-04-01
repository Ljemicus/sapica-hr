'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, ChevronRight, ExternalLink, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { findBestMatch, getSuggestedPrompts, WELCOME_MESSAGE } from '@/lib/chatbot-knowledge';
import { useAuth } from '@/contexts/auth-context';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

type WidgetView = 'chooser' | 'assistant';

export function ChatWidget() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<WidgetView>('assistant');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);

  const isAuthenticated = Boolean(user);
  const suggestedPrompts = getSuggestedPrompts(isAuthenticated);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const ensureWelcomeMessage = useCallback(() => {
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [{ id: ++idCounter.current, text: WELCOME_MESSAGE, isUser: false }];
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && view === 'assistant' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, view]);

  const handleOpen = () => {
    if (loading) return;
    setIsOpen(true);
    if (isAuthenticated) {
      setView('chooser');
      return;
    }
    setView('assistant');
    ensureWelcomeMessage();
  };

  const handleClose = () => setIsOpen(false);

  const openAssistant = () => {
    setView('assistant');
    ensureWelcomeMessage();
  };

  const sendMessage = (prefilledText?: string) => {
    const text = (prefilledText ?? input).trim();
    if (!text) return;

    const userMsg: Message = {
      id: ++idCounter.current,
      text,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    window.setTimeout(() => {
      const response = findBestMatch(text, { isAuthenticated });
      const botMsg: Message = {
        id: ++idCounter.current,
        text: response,
        isUser: false,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderAssistant = () => (
    <>
      <div className="flex items-center justify-between bg-orange-500 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐾</span>
          <div>
            <h3 className="font-semibold text-sm">PetPark AI asistent</h3>
            <p className="text-[11px] text-orange-100">Brza pomoć za onboarding, podršku i česta pitanja</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setView('chooser')}
              className="rounded-full px-2.5 py-1 text-[11px] font-medium text-orange-50 transition-colors hover:bg-orange-600"
            >
              Natrag
            </button>
          )}
          <button
            onClick={handleClose}
            className="rounded-full p-1 transition-colors hover:bg-orange-600"
            aria-label="Zatvori chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="border-b border-orange-100 bg-orange-50/80 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-medium text-orange-700 transition-colors hover:border-orange-300 hover:bg-orange-100"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 bg-gray-50 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.isUser
                  ? 'rounded-br-sm bg-orange-500 text-white'
                  : 'rounded-bl-sm border border-gray-200 bg-white text-gray-800 shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-white p-3">
        {isAuthenticated && (
          <div className="mb-3 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Za razgovor sa sitterima i korisnicima i dalje koristi{' '}
            <Link href="/poruke" className="font-semibold text-orange-600 hover:text-orange-700">
              Poruke
            </Link>
            . AI asistent služi za pomoć oko korištenja PetParka.
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pitaj nešto o PetParku..."
            className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white transition-all hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
            aria-label="Pošalji"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  const renderChooser = () => (
    <>
      <div className="flex items-center justify-between bg-orange-500 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold text-sm">Chat i podrška</h3>
            <p className="text-[11px] text-orange-100">Odaberi što ti sada treba</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="rounded-full p-1 transition-colors hover:bg-orange-600"
          aria-label="Zatvori chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 bg-white p-4">
        <div className="mb-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          Tvoje postojeće poruke ostaju odvojene. AI asistent je dodatna pomoć kad želiš brzo saznati kako nešto radi na PetParku.
        </div>

        <div className="space-y-3">
          <Link
            href="/poruke"
            className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-orange-200 hover:bg-orange-50"
          >
            <div className="mt-0.5 rounded-2xl bg-orange-100 p-2 text-orange-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                Otvori poruke
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Nastavi razgovor sa sitterima, groomerima ili drugim korisnicima bez promjene postojećeg toka.
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={openAssistant}
            className="group flex w-full items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-left transition-all hover:bg-orange-100"
          >
            <div className="mt-0.5 rounded-2xl bg-white p-2 text-orange-600 shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                Pitaj AI asistenta
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                Dobij brze odgovore o registraciji, bookingu, plaćanju, uslugama i snalaženju na platformi.
              </p>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 text-orange-500 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-orange-600 active:scale-95 disabled:cursor-wait disabled:opacity-70"
          aria-label={isAuthenticated ? 'Otvori chat i AI asistenta' : 'Otvori AI asistenta'}
          disabled={loading}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-4 left-4 z-50 flex w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200 sm:bottom-6 sm:left-6"
          style={{ height: 'min(540px, calc(100vh - 6rem))' }}
        >
          {view === 'chooser' ? renderChooser() : renderAssistant()}
        </div>
      )}
    </>
  );
}
