'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Loader2, MessageCircle, SendHorizonal, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  senderRole: 'owner' | 'provider' | 'admin';
  body: string;
  createdAtLabel: string;
  isMine: boolean;
};

type ApiError = { error?: { message?: string; code?: string } };

export function BookingRequestConversation({ requestId, enabled = true }: { requestId: string; enabled?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(enabled);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = body.trim();
  const canSend = enabled && trimmed.length > 0 && trimmed.length <= 2000 && !sending;

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setLoading(true);
    setError(null);

    fetch(`/api/booking-requests/${requestId}/messages`, { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error((payload as ApiError).error?.message || 'Razgovor se trenutno ne može učitati.');
        return payload as { data?: { messages?: Message[] } };
      })
      .then((payload) => {
        if (!alive) return;
        setMessages(payload.data?.messages || []);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Razgovor se trenutno ne može učitati.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [enabled, requestId]);

  const helperCopy = useMemo(() => {
    if (!enabled) return 'In-app razgovor je dostupan samo za upite poslane s prijavljenim PetPark računom.';
    if (messages.length === 0) return 'Pošalji kratku tekstualnu poruku vezanu samo za ovaj upit.';
    return 'Ovo je tekstualni razgovor za ovaj upit. Nema plaćanja, potvrde termina ni vanjskog slanja.';
  }, [enabled, messages.length]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    const optimisticBody = trimmed;
    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/booking-requests/${requestId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: optimisticBody }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((payload as ApiError).error?.message || 'Poruku trenutno nije moguće poslati.');
      const message = (payload as { data?: { message?: Message } }).data?.message;
      if (message) setMessages((current) => [...current, message]);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Poruku trenutno nije moguće poslati.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4 rounded-[var(--pp-radius-card-24)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-teal-accent)]">
          <MessageCircle className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Razgovor o upitu</p>
          <p className="mt-1 text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">{helperCopy}</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-3 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Učitavam razgovor…
        </div>
      ) : null}

      {!loading && enabled ? (
        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-3 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
              Još nema poruka za ovaj upit.
            </div>
          ) : messages.map((message) => (
            <div key={message.id} className={cn('flex', message.isMine ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[85%] rounded-[var(--pp-radius-card-20)] px-4 py-3 text-sm font-semibold leading-6 shadow-[var(--pp-shadow-small-card)]',
                message.isMine
                  ? 'bg-[color:var(--pp-color-orange-primary)] text-white'
                  : 'bg-[color:var(--pp-color-cream-surface)] text-[color:var(--pp-color-forest-text)]'
              )}>
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <p className={cn('mt-1 text-[11px] font-black uppercase tracking-[0.08em]', message.isMine ? 'text-white/75' : 'text-[color:var(--pp-color-muted-text)]')}>
                  {message.senderRole === 'provider' ? 'Pružatelj' : message.senderRole === 'admin' ? 'PetPark' : 'Vlasnik'} · {message.createdAtLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="mt-3 rounded-2xl bg-[color:var(--pp-color-warning-surface)] p-3 text-sm font-black leading-6 text-[color:var(--pp-color-orange-primary)]">{error}</p> : null}

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={!enabled || sending}
          maxLength={2000}
          rows={3}
          placeholder={enabled ? 'Napiši poruku…' : 'Razgovor nije dostupan za ovaj upit'}
          className="min-h-24 w-full resize-y rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warm-border)] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-forest-text)] outline-none transition focus:border-[color:var(--pp-color-orange-primary)] disabled:cursor-not-allowed disabled:bg-[color:var(--pp-color-cream-surface)] disabled:text-[color:var(--pp-color-muted-text)]"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">
            <ShieldCheck className="size-4 shrink-0 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
            Samo in-app poruka. Bez email/SMS/WhatsApp/push slanja.
          </p>
          <Button type="submit" disabled={!canSend} size="sm" className="justify-center">
            {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <SendHorizonal className="size-4" aria-hidden />}
            Pošalji
          </Button>
        </div>
      </form>
    </div>
  );
}
