import Link from 'next/link';
import { CalendarDays, CheckCircle2, Clock3, Eye, HeartHandshake, Home, MessageCircle, PawPrint, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { AppHeader, Avatar, Badge, ButtonLink, Card, LeafDecoration, PawDecoration } from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';
import type { OwnerBookingRequestSummary } from '@/lib/petpark/booking-requests/types';
import { BookingRequestConversation } from './booking-request-conversation';
import { BookingRequestWithdrawAction } from './booking-request-withdraw-action';

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/moji-upiti', label: 'Moji upiti' },
  { href: '/pet-passport', label: 'Pet Passport' },
  { href: '/poruke', label: 'Poruke' },
];

const sidebarItems = [
  { label: 'Pregled', icon: Home, href: '/profil' },
  { label: 'Moji upiti', icon: MessageCircle, href: '/moji-upiti', active: true },
  { label: 'Moji ljubimci', icon: PawPrint, href: '/pet-passport' },
  { label: 'Moje usluge', icon: HeartHandshake, href: '/moje-usluge' },
  { label: 'Profil', icon: UserRound, href: '/profil' },
];

const statusClasses: Record<OwnerBookingRequestSummary['status'], string> = {
  pending: 'border-[color:var(--pp-color-warning)]/25 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-warning)]',
  contacted: 'border-[color:var(--pp-color-teal-accent)]/25 bg-[color:var(--pp-color-info-surface)] text-[color:var(--pp-color-teal-accent)]',
  closed: 'border-[color:var(--pp-color-muted-text)]/20 bg-[color:var(--pp-color-cream-surface)] text-[color:var(--pp-color-muted-text)]',
  withdrawn: 'border-[color:var(--pp-color-orange-primary)]/25 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]',
};

const lifecycleCopy: Record<OwnerBookingRequestSummary['status'], string> = {
  pending: 'Poslano znači da pružatelj još nije označio da te kontaktirao.',
  contacted: 'Kontaktiran znači da je pružatelj označio da je odgovorio ili se javio.',
  closed: 'Zatvoreno znači da je pružatelj zatvorio ovaj upit.',
  withdrawn: 'Povučen znači da si odustao od ovog upita. Nema potvrđene rezervacije ni plaćanja.',
};

function petTypeLabel(type: string) {
  if (type === 'pas') return 'Pas';
  if (type === 'macka') return 'Mačka';
  return 'Drugo';
}

function DashboardSidebar() {
  return (
    <aside className="hidden xl:block">
      <Card radius="28" className="sticky top-28 p-4">
        <div className="flex items-center gap-3 rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-sage-surface)] p-3">
          <Avatar initials="PP" alt="PetPark" size="md" />
          <div>
            <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Owner centar</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">Upiti i ljubimci</p>
          </div>
        </div>
        <nav aria-label="Owner navigacija" className="mt-5 space-y-2">
          {sidebarItems.map((item) => (
            <ButtonLink key={item.label} href={item.href} variant={item.active ? 'primary' : 'ghost'} size="md" className="w-full justify-start">
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </ButtonLink>
          ))}
        </nav>
      </Card>
    </aside>
  );
}

function RequestStatusChip({ request }: { request: OwnerBookingRequestSummary }) {
  return <span className={cn('rounded-full border px-3 py-1 text-xs font-black', statusClasses[request.status])}>{request.statusLabel}</span>;
}

function BookingRequestTimeline({ events }: { events: OwnerBookingRequestSummary['events'] }) {
  if (!events.length) {
    return (
      <div className="mt-4 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-3 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
        Aktivnost će se pojaviti ovdje kada se status upita promijeni.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">Aktivnost upita</p>
      <ol className="mt-3 space-y-3">
        {events.map((event) => (
          <li key={event.id} className="flex gap-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-[color:var(--pp-color-teal-accent)]" aria-hidden />
            <span>
              <strong className="block text-[color:var(--pp-color-forest-text)]">{event.summary}</strong>
              <span>{event.createdAtLabel}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function EmptyState() {
  return (
    <Card radius="28" className="p-8 text-center md:p-12">
      <div className="mx-auto flex size-16 items-center justify-center rounded-[var(--pp-radius-card-24)] bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-small-card)]">
        <PawPrint className="size-8" aria-hidden />
      </div>
      <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Još nema poslanih upita</h2>
      <p className="mx-auto mt-3 max-w-2xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">
        Kad pošalješ upit pružatelju usluge, ovdje ćeš vidjeti status i osnovne detalje.
      </p>
      <ButtonLink href="/usluge" size="lg" className="mt-6">
        <Eye className="size-5" aria-hidden />
        Pregledaj usluge
      </ButtonLink>
    </Card>
  );
}

function RequestCard({ request }: { request: OwnerBookingRequestSummary }) {
  const notesPreview = request.notes.length > 140 ? `${request.notes.slice(0, 140).trim()}…` : request.notes;

  return (
    <Card
      id={`request-${request.id}`}
      radius="28"
      className={cn(
        'scroll-mt-28 p-5 shadow-[var(--pp-shadow-small-card)] target:border-[color:var(--pp-color-orange-primary)]/60 target:ring-4 target:ring-[color:var(--pp-color-orange-primary)]/15 md:p-6',
        request.unreadNotificationCount > 0 && 'border-[color:var(--pp-color-orange-primary)]/35',
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="teal"><Sparkles className="size-3" aria-hidden /> {request.providerName}</Badge>
            <RequestStatusChip request={request} />
            {request.unreadNotificationCount > 0 ? <Badge variant="orange">{request.unreadNotificationCount} novo</Badge> : null}
          </div>
          <h2 className="mt-4 text-2xl font-black leading-tight tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">{request.serviceLabel}</h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
            <span><CalendarDays className="mr-1 inline size-4 text-[color:var(--pp-color-orange-primary)]" aria-hidden />{request.dateRange}</span>
            <span><PawPrint className="mr-1 inline size-4 text-[color:var(--pp-color-teal-accent)]" aria-hidden />{request.petName} · {petTypeLabel(request.petType)}</span>
            <span><Clock3 className="mr-1 inline size-4 text-[color:var(--pp-color-muted-text)]" aria-hidden />Poslano {request.submittedAt}</span>
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{lifecycleCopy[request.status]}</p>
          {notesPreview ? <p className="mt-4 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">“{notesPreview}”</p> : null}
          <BookingRequestWithdrawAction requestId={request.id} status={request.status} />
        </div>
        <ButtonLink href={`/usluge/${request.providerSlug}`} variant="secondary" size="md" className="shrink-0 justify-center">
          <Eye className="size-4" aria-hidden />
          Usluga
        </ButtonLink>
      </div>

      <details className="group mt-5 rounded-[var(--pp-radius-card-24)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-4">
        <summary className="cursor-pointer list-none text-sm font-black text-[color:var(--pp-color-forest-text)] marker:hidden">
          {request.unreadNotificationCount > 0 ? `${request.unreadNotificationCount} nepročitano · ` : ''}Pogledaj detalje upita
          <span className="ml-2 text-xs font-bold text-[color:var(--pp-color-muted-text)] group-open:hidden">+</span>
          <span className="ml-2 hidden text-xs font-bold text-[color:var(--pp-color-muted-text)] group-open:inline">−</span>
        </summary>
        <BookingRequestTimeline events={request.events} />
        <BookingRequestConversation requestId={request.id} enabled={request.conversationEnabled} />
        <div className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)] md:grid-cols-2">
          <div className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">Cijena</p>
            <p className="mt-1 text-[color:var(--pp-color-forest-text)]">{request.priceSnapshot || 'Cijena po dogovoru'}</p>
          </div>
          <div className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">Odgovor</p>
            <p className="mt-1 text-[color:var(--pp-color-forest-text)]">{request.responseTimeSnapshot || 'Pružatelj odgovara prema dostupnosti'}</p>
          </div>
          <div className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-3 md:col-span-2">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">Kontakt koji si poslao</p>
            <p className="mt-1 text-[color:var(--pp-color-forest-text)]">
              {[request.contactMethod.email, request.contactMethod.phone].filter(Boolean).join(' · ') || 'Kontakt je zabilježen uz upit.'}
            </p>
          </div>
          {request.notes ? (
            <div className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-3 md:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">Tvoja napomena</p>
              <p className="mt-1 whitespace-pre-wrap text-[color:var(--pp-color-forest-text)]">{request.notes}</p>
            </div>
          ) : null}
        </div>
      </details>

      <div className="mt-4 flex gap-3 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-3 text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
        <span>Kontakt podatke dijelimo samo s pružateljem kojem šalješ upit. Ovaj prikaz je samo za praćenje statusa; upit nije potvrđena rezervacija.</span>
      </div>
    </Card>
  );
}

export function MyRequestsPage({ requests }: { requests: OwnerBookingRequestSummary[] }) {
  const counts = requests.reduce<Record<OwnerBookingRequestSummary['status'], number>>((acc, request) => {
    acc[request.status] += 1;
    return acc;
  }, { pending: 0, contacted: 0, closed: 0, withdrawn: 0 });

  return (
    <main data-petpark-route="moji-upiti" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/usluge" size="sm">Pošalji novi upit</ButtonLink>} />
      <section className="relative mx-auto max-w-[1440px] px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <LeafDecoration className="-left-24 top-[400px] size-[220px] opacity-50" />
        <PawDecoration className="right-[12%] top-28 hidden size-16 rotate-12 opacity-60 sm:block" />
        <div className="mx-auto grid max-w-[var(--pp-content-width)] gap-6 xl:grid-cols-[260px_1fr]">
          <DashboardSidebar />
          <div className="min-w-0 space-y-6">
            <Card radius="28" className="p-6 md:p-8">
              <Badge variant="orange"><MessageCircle className="size-3" aria-hidden /> Owner upiti</Badge>
              <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] sm:text-6xl">Moji upiti</h1>
                  <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)] sm:text-lg">
                    Prati upite koje si poslao pružateljima usluga.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                  {([
                    ['Poslano', counts.pending],
                    ['Kontaktiran', counts.contacted],
                    ['Zatvoreno', counts.closed],
                    ['Povučen', counts.withdrawn],
                  ] as const).map(([label, value]) => (
                    <div key={label} className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] px-4 py-3">
                      <p className="text-2xl font-black text-[color:var(--pp-color-forest-text)]">{value}</p>
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card radius="28" tone="teal" className="p-5">
              <div className="flex gap-3 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                <p><strong className="text-[color:var(--pp-color-forest-text)]">Kako čitati statuse:</strong> Poslano = čeka odgovor, Kontaktiran = pružatelj je označio da se javio, Zatvoreno = upit je zatvoren. Ovdje nema plaćanja ni potvrđene rezervacije.</p>
              </div>
            </Card>

            {requests.length ? <div className="space-y-4">{requests.map((request) => <RequestCard key={request.id} request={request} />)}</div> : <EmptyState />}
          </div>
        </div>
      </section>
    </main>
  );
}
