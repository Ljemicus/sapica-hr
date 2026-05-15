'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, Loader2, Undo2, XCircle } from 'lucide-react';
import { Button } from '@/components/shared/petpark/design-foundation';
import type { BookingRequestStatus } from '@/lib/petpark/booking-requests/types';

export function BookingRequestWithdrawAction({ requestId, status }: { requestId: string; status: BookingRequestStatus }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const canWithdraw = status === 'pending' || status === 'contacted';

  async function withdraw() {
    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`/api/booking-requests/${requestId}/withdraw`, { method: 'PATCH' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setMessage(body?.error?.message || 'Upit trenutno nije moguće povući.');
        return;
      }

      setMessage('Upit je povučen. Osvježavam prikaz…');
      setConfirming(false);
      router.refresh();
    } catch {
      setMessage('Mrežna greška. Pokušaj ponovno za trenutak.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!canWithdraw) {
    const copy = status === 'closed'
      ? 'Upit je zatvoren i više ga nije moguće povući. Za novi termin pošalji novi upit.'
      : 'Povučen upit više nije aktivan. Pružatelj ga vidi kao povučen, ali se zapis ne briše.';

    return (
      <div className="space-y-2" data-petpark-owner-withdraw-action>
        <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pp-color-sage-surface)] px-3 py-2 text-xs font-black text-[color:var(--pp-color-muted-text)]">
          <CheckCircle2 className="size-4" aria-hidden />
          Nema dostupne akcije
        </div>
        <p className="text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">{copy}</p>
      </div>
    );
  }

  if (!confirming) {
    return (
      <div className="mt-4 space-y-2" data-petpark-owner-withdraw-action>
        <Button size="sm" variant="secondary" onClick={() => setConfirming(true)}>
          <Undo2 className="size-4" aria-hidden />
          Povuci upit
        </Button>
        {message ? <p className="text-xs font-black leading-5 text-[color:var(--pp-color-teal-accent)]" role="status">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warning)]/25 bg-[color:var(--pp-color-warning-surface)] p-3" data-petpark-owner-withdraw-action>
      <p className="text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
        Jesi siguran da želiš povući ovaj upit? Pružatelj će ga vidjeti kao povučen. Upit se ne briše.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" disabled={submitting} onClick={() => setConfirming(false)}>
          <XCircle className="size-4" aria-hidden />
          Odustani
        </Button>
        <Button size="sm" variant="teal" disabled={submitting} onClick={withdraw}>
          {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Undo2 className="size-4" aria-hidden />}
          Potvrdi povlačenje
        </Button>
      </div>
      {message ? <p className="mt-2 text-xs font-black leading-5 text-[color:var(--pp-color-teal-accent)]" role="status">{message}</p> : null}
    </div>
  );
}
