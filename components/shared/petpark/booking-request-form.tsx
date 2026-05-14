'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Send } from 'lucide-react';
import { Button, Input, Select } from '@/components/shared/petpark/design-foundation';
import type { MarketplaceServiceListing } from '@/lib/db/service-listings';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowIso() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function BookingRequestForm({ service }: { service: MarketplaceServiceListing }) {
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(tomorrowIso());
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'pas' | 'macka' | 'drugo'>('pas');
  const [notes, setNotes] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me')
      .then((response) => response.ok ? response.json() : null)
      .then((body) => {
        if (!active || !body?.user) return;
        setRequesterName((current) => current || body.user.name || '');
        setRequesterEmail((current) => current || body.user.email || '');
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const canSubmit = useMemo(
    () => Boolean(startDate && endDate && petName.trim() && requesterName.trim() && (requesterEmail.trim() || requesterPhone.trim()) && contactConsent && !submitting),
    [contactConsent, endDate, petName, requesterEmail, requesterName, requesterPhone, startDate, submitting],
  );

  async function submitRequest() {
    if (!canSubmit) return;
    setSubmitting(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/booking-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerSlug: service.slug,
          providerName: service.provider,
          providerCity: service.location.split(',').pop()?.trim() || service.location,
          providerDistrict: service.location.includes(',') ? service.location.split(',')[0]?.trim() : '',
          serviceLabel: service.title,
          priceSnapshot: service.price,
          responseTimeSnapshot: service.responseTime,
          mode: 'visit',
          startDate,
          endDate,
          petName: petName.trim(),
          petType,
          notes: notes.trim(),
          requesterName: requesterName.trim(),
          requesterEmail: requesterEmail.trim(),
          requesterPhone: requesterPhone.trim(),
          contactConsent,
        }),
      });

      if (!response.ok) {
        setStatus('error');
        setMessage('Upit trenutno nije moguće poslati. Provjeri podatke i pokušaj ponovno.');
        return;
      }

      setStatus('success');
      setMessage('Upit je poslan. Pružatelj je dobio kontakt podatke za odgovor na ovaj upit.');
      setNotes('');
    } catch {
      setStatus('error');
      setMessage('Mrežna greška. Pokušaj ponovno za trenutak.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4" data-petpark-booking-request-form>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Od</span>
          <Input type="date" value={startDate} min={todayIso()} onChange={(event) => setStartDate(event.target.value)} />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Do</span>
          <Input type="date" value={endDate} min={startDate || todayIso()} onChange={(event) => setEndDate(event.target.value)} />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Ljubimac</span>
          <Input value={petName} onChange={(event) => setPetName(event.target.value)} placeholder="npr. Luna" maxLength={80} />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Vrsta</span>
          <Select value={petType} onChange={(event) => setPetType(event.target.value as 'pas' | 'macka' | 'drugo')}>
            <option value="pas">Pas</option>
            <option value="macka">Mačka</option>
            <option value="drugo">Drugo</option>
          </Select>
        </label>
      </div>

      <div className="rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-cream-surface)] p-4">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">Kontakt za odgovor</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Ime vlasnika</span>
            <Input value={requesterName} onChange={(event) => setRequesterName(event.target.value)} placeholder="npr. Niko" maxLength={120} autoComplete="name" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">E-mail</span>
            <Input value={requesterEmail} onChange={(event) => setRequesterEmail(event.target.value)} placeholder="ime@email.com" maxLength={180} autoComplete="email" inputMode="email" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Telefon opcionalno</span>
            <Input value={requesterPhone} onChange={(event) => setRequesterPhone(event.target.value)} placeholder="+385…" maxLength={40} autoComplete="tel" inputMode="tel" />
          </label>
        </div>
        <p className="mt-3 text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">Kontakt podatke šaljemo samo odabranom pružatelju kako bi odgovorio na ovaj upit. Ovo nije potvrđena rezervacija i ne pokreće plaćanje.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Napomena</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Rutina, posebne potrebe, željeni termin ili pitanje za pružatelja…"
          maxLength={1000}
          className="min-h-24 w-full rounded-[var(--pp-radius-control)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] px-4 py-3 text-sm font-semibold text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)] outline-none transition placeholder:text-[color:var(--pp-color-muted-text)]/70 focus:border-[color:var(--pp-color-teal-accent)] focus:ring-2 focus:ring-[color:var(--pp-color-teal-accent)]/20"
        />
      </label>

      <label className="flex gap-3 rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-4 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)] shadow-[var(--pp-shadow-small-card)]">
        <input
          type="checkbox"
          checked={contactConsent}
          onChange={(event) => setContactConsent(event.target.checked)}
          className="mt-1 size-4 rounded border-[color:var(--pp-color-warm-border)] accent-[color:var(--pp-color-orange-primary)]"
        />
        <span>Slažem se da PetPark proslijedi moje kontakt podatke pružatelju radi odgovora na upit.</span>
      </label>

      <Button className="w-full" size="lg" disabled={!canSubmit} onClick={submitRequest}>
        {submitting ? <CalendarDays className="size-5 animate-pulse" /> : status === 'success' ? <CheckCircle2 className="size-5" /> : <Send className="size-5" />}
        {submitting ? 'Šaljem upit…' : 'Pošalji upit'}
      </Button>

      {message ? (
        <p className={status === 'success' ? 'text-sm font-bold leading-6 text-[color:var(--pp-color-success)]' : 'text-sm font-bold leading-6 text-[color:var(--pp-color-error)]'} role="status">
          {message}
        </p>
      ) : (
        <p className="text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">Nema plaćanja ni zaključavanja termina u ovom koraku — ovo je kontrolirani upit koji pružatelj potvrđuje ručno.</p>
      )}
    </div>
  );
}
