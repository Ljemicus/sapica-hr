'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/shared/petpark/design-foundation';
import type { BookingRequestActionStatus, BookingRequestStatus } from '@/lib/petpark/booking-requests/types';

const statusCopy: Record<BookingRequestStatus, string> = {
  pending: 'Novo',
  contacted: 'Kontaktirano',
  closed: 'Zatvoreno',
  withdrawn: 'Povučen',
};

export function BookingRequestStatusActions({ requestId, status }: { requestId: string; status: string }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<BookingRequestActionStatus | null>(null);
  const [message, setMessage] = useState('');
  const normalizedStatus = (['pending', 'contacted', 'closed', 'withdrawn'].includes(status) ? status : 'pending') as BookingRequestStatus;

  async function updateStatus(nextStatus: BookingRequestActionStatus) {
    setPendingAction(nextStatus);
    setMessage('');

    try {
      const response = await fetch(`/api/booking-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setMessage(body?.error?.message || 'Status trenutno nije moguće promijeniti.');
        return;
      }

      setMessage(nextStatus === 'contacted' ? 'Upit je označen kao kontaktiran. Osvježavam prikaz…' : 'Upit je zatvoren. Osvježavam prikaz…');
      router.refresh();
    } catch {
      setMessage('Mrežna greška. Pokušaj ponovno za trenutak.');
    } finally {
      setPendingAction(null);
    }
  }

  if (normalizedStatus === 'withdrawn') {
    return (
      <div className="space-y-2" data-petpark-booking-request-actions>
        <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pp-color-warning-surface)] px-3 py-2 text-xs font-black text-[color:var(--pp-color-orange-primary)]">
          <CheckCircle2 className="size-4" aria-hidden />
          {statusCopy.withdrawn}
        </div>
        <p className="text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">Vlasnik je povukao ovaj upit. Nema akcije, rezervacije ni zaključavanja termina.</p>
      </div>
    );
  }

  if (normalizedStatus === 'closed') {
    return (
      <div className="space-y-2" data-petpark-booking-request-actions>
        <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--pp-color-sage-surface)] px-3 py-2 text-xs font-black text-[color:var(--pp-color-success)]">
          <CheckCircle2 className="size-4" aria-hidden />
          {statusCopy.closed}
        </div>
        <p className="text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">Zatvoreni upiti se u ovom MVP-u ne otvaraju ponovno i ne stvaraju potvrđenu rezervaciju.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-petpark-booking-request-actions>
      <div className="flex flex-wrap gap-2">
        {normalizedStatus === 'pending' ? (
          <Button size="sm" variant="teal" disabled={Boolean(pendingAction)} onClick={() => updateStatus('contacted')}>
            {pendingAction === 'contacted' ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CheckCircle2 className="size-4" aria-hidden />}
            Označi kontaktirano
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" disabled={Boolean(pendingAction)} onClick={() => updateStatus('closed')}>
          {pendingAction === 'closed' ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <XCircle className="size-4" aria-hidden />}
          Zatvori
        </Button>
      </div>
      <p className="text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">
        {normalizedStatus === 'pending'
          ? 'Označi kontaktirano kad si se javio vlasniku. Zatvaranje samo arhivira upit — ne potvrđuje rezervaciju, ne zaključava kalendar i ne pokreće plaćanje.'
          : 'Owner je već označen kao kontaktiran. Zatvaranje samo završava ručni follow-up — bez rezervacije, kalendara ili plaćanja.'}
      </p>
      {message ? <p className="text-xs font-black leading-5 text-[color:var(--pp-color-teal-accent)]" role="status">{message}</p> : null}
    </div>
  );
}
