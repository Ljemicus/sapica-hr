import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  Home,
  Mail,
  MessageCircle,
  MoreHorizontal,
  PawPrint,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import {
  AppHeader,
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  IconButton,
  LeafDecoration,
  Select,
} from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';
import { serviceListingReadsGuard, serviceListingWritesGuard } from '@/lib/petpark/service-listings/guards';
import type { OwnedBookingRequestSummary } from '@/lib/petpark/booking-requests/types';
import { BookingRequestConversation } from './booking-request-conversation';
import { BookingRequestStatusActions } from './booking-request-status-actions';

type ServiceStatus = 'active' | 'draft' | 'paused';
type ServiceCategory = 'Čuvanje' | 'Grooming' | 'Trening';

type ProviderService = {
  id?: string;
  title: string;
  category: ServiceCategory;
  price: string;
  bookings: number;
  rating: string;
  revenue: string;
  status: ServiceStatus;
  updated: string;
};

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/objavi-uslugu', label: 'Objavi uslugu' },
  { href: '/moje-usluge', label: 'Moje usluge' },
  { href: '/kalendar', label: 'Kalendar' },
];

const sidebarItems = [
  { label: 'Pregled', icon: Home, href: '/moje-usluge' },
  { label: 'Moje usluge', icon: PawPrint, href: '/moje-usluge', active: true },
  { label: 'Kalendar', icon: CalendarDays, href: '/kalendar' },
  { label: 'Poruke', icon: MessageCircle, href: '/poruke' },
  { label: 'Profil', icon: UserRound, href: '/profil' },
];

const services: ProviderService[] = [
  {
    title: 'Čuvanje psa u kućnom okruženju',
    category: 'Čuvanje',
    price: '24 € / dan',
    bookings: 18,
    rating: '4.9',
    revenue: '432 €',
    status: 'active',
    updated: 'prije 2 dana',
  },
  {
    title: 'Grooming paket za male pse',
    category: 'Grooming',
    price: '38 € / tretman',
    bookings: 12,
    rating: '4.8',
    revenue: '456 €',
    status: 'active',
    updated: 'danas',
  },
  {
    title: 'Individualni trening poslušnosti',
    category: 'Trening',
    price: '45 € / sat',
    bookings: 9,
    rating: '5.0',
    revenue: '405 €',
    status: 'active',
    updated: 'prije 5 dana',
  },
  {
    title: 'Vikend čuvanje za mačke',
    category: 'Čuvanje',
    price: '18 € / posjet',
    bookings: 4,
    rating: 'Novo',
    revenue: '72 €',
    status: 'draft',
    updated: 'nacrt',
  },
  {
    title: 'Raščešljavanje duge dlake',
    category: 'Grooming',
    price: '30 € / tretman',
    bookings: 6,
    rating: '4.7',
    revenue: '180 €',
    status: 'paused',
    updated: 'pauzirano',
  },
];

const statusCopy: Record<ServiceStatus, string> = {
  active: 'Aktivno',
  draft: 'Nacrt',
  paused: 'Pauzirano',
};

const statusClasses: Record<ServiceStatus, string> = {
  active: 'border-[color:var(--pp-color-success)]/25 bg-[color:var(--pp-color-success-surface)] text-[color:var(--pp-color-success)]',
  draft: 'border-[color:var(--pp-color-warning)]/25 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-warning)]',
  paused: 'border-[color:var(--pp-color-muted-text)]/20 bg-[color:var(--pp-color-cream-surface)] text-[color:var(--pp-color-muted-text)]',
};

const categoryClasses: Record<ServiceCategory, string> = {
  Čuvanje: 'bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-forest-text)]',
  Grooming: 'bg-[color:var(--pp-color-info-surface)] text-[color:var(--pp-color-teal-accent)]',
  Trening: 'bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]',
};

function StatusBadge({ status }: { status: ServiceStatus }) {
  return <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-black leading-none', statusClasses[status])}>{statusCopy[status]}</span>;
}

function ProviderSidebar() {
  return (
    <aside className="order-2 lg:order-none lg:sticky lg:top-28 lg:self-start">
      <Card radius="28" className="p-5">
        <div className="flex items-center gap-3 border-b border-[color:var(--pp-color-warm-border)] pb-5">
          <Avatar initials="LP" size="lg" />
          <div>
            <p className="text-sm font-extrabold text-[color:var(--pp-color-forest-text)]">Lana Petrović</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">Sitter • groomer • trener</p>
            <div className="mt-2 flex items-center gap-1 text-xs font-extrabold text-[color:var(--pp-color-success)]">
              <ShieldCheck className="size-4" aria-hidden /> Verificirano
            </div>
          </div>
        </div>

        <nav aria-label="Provider navigacija" className="mt-5 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className={cn(
                'flex items-center gap-3 rounded-[var(--pp-radius-control)] px-4 py-3 text-sm font-extrabold transition',
                item.active
                  ? 'bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)]'
                  : 'text-[color:var(--pp-color-muted-text)] hover:bg-[color:var(--pp-color-cream-surface)] hover:text-[color:var(--pp-color-forest-text)]',
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-warning-surface)] p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-orange-primary)]">Ovaj mjesec</p>
          <p className="mt-2 text-3xl font-black text-[color:var(--pp-color-forest-text)]">49</p>
          <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">rezervacija kroz usluge</p>
        </div>
      </Card>
    </aside>
  );
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof PawPrint; tone: 'sage' | 'teal' | 'orange' | 'cream' }) {
  return (
    <Card radius="24" tone={tone} shadow="small" className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-3xl font-black text-[color:var(--pp-color-forest-text)]">{value}</p>
          <p className="mt-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{label}</p>
        </div>
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/75 text-[color:var(--pp-color-teal-accent)] shadow-[var(--pp-shadow-small-card)]">
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </Card>
  );
}

function ServicesToolbar() {
  return (
    <Card radius="24" shadow="small" className="p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-lg font-black text-[color:var(--pp-color-forest-text)]">Pregled usluga</p>
          <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">Upravljanje ponudom bez spremanja promjena dok je sigurni način aktivan.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select aria-label="Filter kategorije" defaultValue="all" className="min-h-10 shadow-none">
            <option value="all">Sve kategorije</option>
            <option value="care">Čuvanje</option>
            <option value="grooming">Grooming</option>
            <option value="training">Trening</option>
          </Select>
          <Select aria-label="Filter statusa" defaultValue="all" className="min-h-10 shadow-none">
            <option value="all">Svi statusi</option>
            <option value="active">Aktivno</option>
            <option value="draft">Nacrt</option>
            <option value="paused">Pauzirano</option>
          </Select>
          <Button size="sm" variant="secondary">Sortiraj</Button>
        </div>
      </div>
    </Card>
  );
}

function ServiceRow({ service }: { service: ProviderService }) {
  return (
    <Card radius="24" shadow="small" className="p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_0.7fr_0.55fr_0.6fr_0.55fr_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-[color:var(--pp-color-forest-text)]">{service.title}</h3>
            <span className={cn('rounded-full px-3 py-1 text-xs font-black', categoryClasses[service.category])}>{service.category}</span>
          </div>
          <p className="mt-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">Ažurirano: {service.updated}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Cijena</p>
          <p className="mt-1 font-black text-[color:var(--pp-color-forest-text)]">{service.price}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Rezervacije</p>
          <p className="mt-1 font-black text-[color:var(--pp-color-forest-text)]">{service.bookings}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Ocjena</p>
          <p className="mt-1 inline-flex items-center gap-1 font-black text-[color:var(--pp-color-forest-text)]"><Star className="size-4 fill-[color:var(--pp-color-orange-primary)] text-[color:var(--pp-color-orange-primary)]" /> {service.rating}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">Prihod</p>
          <p className="mt-1 font-black text-[color:var(--pp-color-forest-text)]">{service.revenue}</p>
        </div>
        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <StatusBadge status={service.status} />
          <div className="flex gap-2">
            <IconButton aria-label={`Pregled ${service.title}`} variant="ghost"><Eye className="size-4" /></IconButton>
            <IconButton aria-label={`Uredi ${service.title}`} variant="secondary" disabled={!service.id || service.status === 'active'}><Edit3 className="size-4" /></IconButton>
            <IconButton aria-label={`Arhiviraj ili pauziraj ${service.title}`} variant="secondary" disabled={!service.id || service.status === 'active'}><MoreHorizontal className="size-4" /></IconButton>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ServicesTable({ providerServices = services }: { providerServices?: ProviderService[] }) {
  const readsGuard = serviceListingReadsGuard();
  const writesGuard = serviceListingWritesGuard();
  const showGuardNote = !readsGuard.enabled || !writesGuard.enabled;

  return (
    <Card radius="28" className="p-5 sm:p-6">
      <ServicesToolbar />
      {showGuardNote ? (
        <div className="mt-4 rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warning)]/25 bg-[color:var(--pp-color-warning-surface)] px-5 py-4 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
          Objave usluga su pripremljene u sigurnom načinu rada. Dok backend migracija nije odobrena, prikazujemo postojeće demo/fallback usluge i ne spremamo promjene u produkciju.
        </div>
      ) : null}
      <div className="mt-5 space-y-4">
        {providerServices.map((service) => <ServiceRow key={service.title} service={service} />)}
      </div>
    </Card>
  );
}

function BookingRequestTimeline({ events }: { events: OwnedBookingRequestSummary['events'] }) {
  if (!events.length) {
    return null;
  }

  return (
    <div className="mt-3 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">Aktivnost upita</p>
      <ol className="mt-2 space-y-2">
        {events.map((event) => (
          <li key={event.id} className="flex gap-2 text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[color:var(--pp-color-teal-accent)]" aria-hidden />
            <span><strong className="text-[color:var(--pp-color-forest-text)]">{event.summary}</strong> · {event.createdAtLabel}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function BookingRequestsPanel({ bookingRequests = [] }: { bookingRequests?: OwnedBookingRequestSummary[] }) {
  const statusLabel = (status: string) => {
    if (status === 'pending') return 'Novo';
    if (status === 'contacted') return 'Kontaktirano';
    if (status === 'closed') return 'Zatvoreno';
    if (status === 'withdrawn') return 'Povučen';
    return status;
  };
  const statusClass = (status: string) => {
    if (status === 'contacted') return 'bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-success)]';
    if (status === 'closed') return 'bg-[color:var(--pp-color-cream-surface)] text-[color:var(--pp-color-muted-text)]';
    if (status === 'withdrawn') return 'bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]';
    return 'bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]';
  };

  return (
    <Card radius="28" className="p-5 sm:p-6" data-petpark-booking-requests-panel>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--pp-color-orange-primary)]">Booking upiti</p>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Novi upiti za usluge</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">Ručni upiti bez plaćanja i bez zaključavanja termina. Označavanje statusa ne potvrđuje rezervaciju i ne pokreće plaćanje.</p>
        </div>
        <Badge variant="orange">{bookingRequests.length} ukupno</Badge>
      </div>

      <div className="mt-5 space-y-3">
        {bookingRequests.length === 0 ? (
          <div className="rounded-[var(--pp-radius-card-20)] border border-dashed border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-cream-surface)] px-5 py-6 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
            Još nema booking upita. Kad vlasnik pošalje upit s javne stranice tvoje usluge, pojavit će se ovdje za ručni follow-up.
          </div>
        ) : bookingRequests.map((request) => (
          <div key={request.id} className="rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-4 shadow-[var(--pp-shadow-small-card)]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-[color:var(--pp-color-forest-text)]">{request.serviceLabel}</h3>
                  <StatusBadge status="draft" />
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(request.status)}`}>{statusLabel(request.status)}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{request.petName} · {request.petType === 'pas' ? 'Pas' : request.petType === 'macka' ? 'Mačka' : 'Drugo'} · {request.dateRange}</p>
                <div className="mt-3 rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-cream-surface)] p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">Kontakt vlasnika</p>
                  {request.requesterName || request.requesterEmail || request.requesterPhone ? (
                    <div className="mt-2 grid gap-2 text-sm font-bold leading-6 text-[color:var(--pp-color-forest-text)] sm:grid-cols-2">
                      {request.requesterName ? <p className="sm:col-span-2"><UserRound className="mr-2 inline size-4 text-[color:var(--pp-color-teal-accent)]" aria-hidden />{request.requesterName}</p> : null}
                      {request.requesterEmail ? <p className="break-all"><Mail className="mr-2 inline size-4 text-[color:var(--pp-color-teal-accent)]" aria-hidden />{request.requesterEmail}</p> : null}
                      {request.requesterPhone ? <p className="break-all"><Phone className="mr-2 inline size-4 text-[color:var(--pp-color-teal-accent)]" aria-hidden />{request.requesterPhone}</p> : null}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">Kontakt podaci nisu zabilježeni za ovaj stariji upit.</p>
                  )}
                  <p className="mt-2 text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">Kontakt podatke koristi samo za odgovor na ovaj upit.</p>
                </div>
                {request.status === 'withdrawn' ? <p className="mt-3 rounded-2xl bg-[color:var(--pp-color-warning-surface)] p-3 text-sm font-black leading-6 text-[color:var(--pp-color-orange-primary)]">Vlasnik je povukao ovaj upit. Ne trebaš odgovarati.</p> : null}
                <BookingRequestTimeline events={request.events} />
                <BookingRequestConversation requestId={request.id} enabled={request.conversationEnabled} />
                {request.notes ? <p className="mt-3 rounded-2xl bg-[color:var(--pp-color-cream-surface)] p-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">“{request.notes}”</p> : null}
              </div>
              <div className="flex shrink-0 flex-col gap-3 xl:items-end">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">{request.submittedAt}</p>
                <BookingRequestStatusActions requestId={request.id} status={request.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InsightPanel() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card radius="24" tone="sage" className="p-5">
        <CheckCircle2 className="mb-3 size-5 text-[color:var(--pp-color-success)]" />
        <p className="font-black text-[color:var(--pp-color-forest-text)]">Najbolja usluga</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Čuvanje psa donosi najviše ponovljenih rezervacija.</p>
      </Card>
      <Card radius="24" tone="orange" className="p-5">
        <Clock3 className="mb-3 size-5 text-[color:var(--pp-color-orange-primary)]" />
        <p className="font-black text-[color:var(--pp-color-forest-text)]">Nacrt čeka objavu</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Vikend čuvanje za mačke može se objaviti nakon cijene i pravila.</p>
      </Card>
      <Card radius="24" tone="teal" className="p-5">
        <TrendingUp className="mb-3 size-5 text-[color:var(--pp-color-teal-accent)]" />
        <p className="font-black text-[color:var(--pp-color-forest-text)]">Rast potražnje</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Grooming termini se najbrže pune ujutro i subotom.</p>
      </Card>
    </div>
  );
}

export function MyServicesPage({ providerServices, bookingRequests }: { providerServices?: ProviderService[]; bookingRequests?: OwnedBookingRequestSummary[] }) {
  return (
    <main data-petpark-route="moje-usluge" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/objavi-uslugu" size="sm"><Plus className="size-4" /> Spremi nacrt</ButtonLink>} />
      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[560px] hidden scale-110 -rotate-12 lg:block" />
        <div className="mx-auto max-w-[var(--pp-content-width)]">
          <div className="grid gap-6 lg:grid-cols-[270px_1fr] xl:gap-8">
            <ProviderSidebar />
            <div className="order-1 min-w-0 space-y-6 lg:order-none">
              <Card radius="28" className="p-6 lg:p-8">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <Badge variant="orange">Provider centar</Badge>
                    <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] sm:text-6xl">Moje usluge</h1>
                    <p className="mt-4 max-w-[600px] text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">Upravljajte svojim uslugama, rezervacijama i recenzijama na jednom mjestu.</p>
                  </div>
                  <ButtonLink href="/objavi-uslugu" size="lg"><Plus className="size-5" /> Pripremi novi nacrt</ButtonLink>
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Aktivne usluge" value="3" icon={PawPrint} tone="sage" />
                <StatCard label="Ukupno rezervacija" value="49" icon={CalendarDays} tone="teal" />
                <StatCard label="Recenzije" value="4.9" icon={Star} tone="orange" />
                <StatCard label="Ukupan prihod" value="1.545 €" icon={TrendingUp} tone="cream" />
              </div>

              <BookingRequestsPanel bookingRequests={bookingRequests} />
              <ServicesTable providerServices={providerServices && providerServices.length > 0 ? providerServices : services} />
              <InsightPanel />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
