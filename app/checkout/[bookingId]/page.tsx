'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SERVICE_LABELS } from '@/lib/types';
import type { Booking } from '@/lib/types';
import { STATUS_LABELS } from '@/lib/types';
import { PLATFORMA_FEE, formatCurrency } from '@/lib/payment';

type BookingWithDetails = Booking;

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerPaymentReady, setProviderPaymentReady] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) throw new Error('Greška pri dohvaćanju rezervacije');
        const found: BookingWithDetails = await res.json();
        setBooking(found);

        const meRes = await fetch('/api/auth/me');
        const me = meRes.ok ? await meRes.json() : null;
        if (me?.id && found.sitter?.id === me.id) {
          setProviderPaymentReady(true);
        } else if (found.sitter?.id) {
          const statusRes = await fetch(`/api/sitters/${found.sitter.id}`);
          const sitter = statusRes.ok ? await statusRes.json() : null;
          const isReady = Boolean(sitter?.stripe_onboarding_complete || sitter?.stripe_account_id || sitter?.verified_payment_provider);
          setProviderPaymentReady(isReady);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nepoznata greška');
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  async function handlePay() {
    if (!booking) return;
    setPaying(true);
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Greška pri kreiranju sesije plaćanja');
      const { url } = data;
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri plaćanju');
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">Učitavanje...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error ?? 'Rezervacija nije pronađena'}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Natrag
        </Button>
      </div>
    );
  }

  if (booking.status !== 'accepted') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4 py-12">
        <Card className="w-full text-center">
          <CardContent className="pt-8 pb-4">
            <h1 className="mb-2 text-2xl font-bold">Plaćanje nije dostupno</h1>
            <p className="text-muted-foreground">
              Rezervacija mora biti prihvaćena od strane čuvara prije plaćanja.
              Trenutni status: <strong>{STATUS_LABELS[booking.status] ?? booking.status}</strong>
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Button variant="outline" onClick={() => router.push('/dashboard/vlasnik')}>
              Povratak na dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (booking.payment_status === 'paid') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4 py-12">
        <Card className="w-full text-center">
          <CardContent className="pt-8 pb-4">
            <div className="mb-4 flex justify-center">
              <Badge variant="default" className="text-base px-4 py-1">Plaćeno</Badge>
            </div>
            <h1 className="mb-2 text-2xl font-bold">Rezervacija je već plaćena</h1>
            <p className="text-muted-foreground">
              Ova rezervacija je uspješno plaćena. Ne trebate ponavljati plaćanje.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Button variant="outline" onClick={() => router.push('/dashboard/vlasnik')}>
              Povratak na dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const totalCents = Math.round(booking.total_price * 100);
  const platformFeeCents = Math.round(totalCents * PLATFORMA_FEE);
  const sitterPayoutCents = totalCents - platformFeeCents;

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Plaćanje</h1>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-lg">Detalji rezervacije</CardTitle>
            <Badge variant="secondary">Sigurno plaćanje</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Plaćanje se otvara u sigurnom checkout koraku. Rezervacija ostaje zabilježena na vašem dashboardu.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Usluga</span>
            <Badge variant="secondary">
              {SERVICE_LABELS[booking.service_type] ?? booking.service_type}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Datum</span>
            <span>
              {new Date(booking.start_date).toLocaleDateString('hr-HR')} –{' '}
              {new Date(booking.end_date).toLocaleDateString('hr-HR')}
            </span>
          </div>
          {booking.sitter?.name && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Čuvar</span>
              <span>{booking.sitter.name}</span>
            </div>
          )}
          {booking.pet?.name && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ljubimac</span>
              <span>{booking.pet.name}</span>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ukupno</span>
            <span className="font-semibold">{formatCurrency(totalCents)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Naknada platforme (10%)</span>
            <span>{formatCurrency(platformFeeCents)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Čuvar prima (90%)</span>
            <span>{formatCurrency(sitterPayoutCents)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <div className="w-full rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Što slijedi nakon plaćanja?</p>
            <p>1. Otvara se Stripe checkout.</p>
            <p>2. Nakon uspješnog plaćanja rezervacija prelazi u plaćeni status.</p>
            <p>3. Potvrdu ćete vidjeti na svom dashboardu.</p>
          </div>
          {providerPaymentReady === false && (
            <div className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Čuvar još nije povezao Stripe plaćanja. Rezervacija je prihvaćena, ali online naplata još nije dostupna dok ne dovrši povezivanje računa.
            </div>
          )}
          <Button
            className="w-full"
            size="lg"
            onClick={handlePay}
            disabled={paying || providerPaymentReady === false}
          >
            {paying ? 'Obrada...' : providerPaymentReady === false ? 'Plaćanje trenutno nije dostupno' : `Plati ${formatCurrency(totalCents)}`}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.back()}
          >
            Odustani
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
