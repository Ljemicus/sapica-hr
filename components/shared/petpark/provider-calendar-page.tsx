import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dog,
  Filter,
  Home,
  MessageCircle,
  PawPrint,
  Plus,
  Scissors,
  ShieldCheck,
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

type CalendarStatus = 'confirmed' | 'pending' | 'blocked' | 'completed';

type CalendarEvent = {
  title: string;
  time: string;
  service: 'Čuvanje' | 'Grooming' | 'Trening' | 'Blokirano';
  status: CalendarStatus;
};

type CalendarDay = {
  day: number;
  muted?: boolean;
  today?: boolean;
  events?: CalendarEvent[];
};

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/objavi-uslugu', label: 'Objavi uslugu' },
  { href: '/kalendar', label: 'Kalendar' },
  { href: '/poruke', label: 'Poruke' },
];

const sidebarItems = [
  { label: 'Pregled', icon: Home, href: '/moje-usluge', active: false },
  { label: 'Kalendar', icon: CalendarDays, href: '/kalendar', active: true },
  { label: 'Moje usluge', icon: PawPrint, href: '/moje-usluge', active: false },
  { label: 'Poruke', icon: MessageCircle, href: '/poruke', active: false },
  { label: 'Profil', icon: UserRound, href: '/dashboard/profile', active: false },
];

const calendarDays: CalendarDay[] = [
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 1, events: [{ title: 'Luna', time: '09:00', service: 'Grooming', status: 'confirmed' }] },
  { day: 2 },
  { day: 3, events: [{ title: 'Max', time: '14:30', service: 'Trening', status: 'pending' }] },
  { day: 4 },
  { day: 5, events: [{ title: 'Blokirano', time: 'Cijeli dan', service: 'Blokirano', status: 'blocked' }] },
  { day: 6 },
  { day: 7, events: [{ title: 'Nala', time: '08:30', service: 'Čuvanje', status: 'confirmed' }] },
  { day: 8 },
  { day: 9, events: [{ title: 'Milo', time: '12:00', service: 'Grooming', status: 'completed' }] },
  { day: 10 },
  { day: 11 },
  { day: 12, today: true, events: [{ title: 'Rio', time: '10:00', service: 'Trening', status: 'confirmed' }, { title: 'Bela', time: '17:30', service: 'Čuvanje', status: 'pending' }] },
  { day: 13 },
  { day: 14, events: [{ title: 'Koko', time: '09:45', service: 'Grooming', status: 'confirmed' }] },
  { day: 15 },
  { day: 16 },
  { day: 17, events: [{ title: 'Tara', time: '11:00', service: 'Trening', status: 'confirmed' }] },
  { day: 18 },
  { day: 19 },
  { day: 20, events: [{ title: 'Maza', time: '16:00', service: 'Čuvanje', status: 'confirmed' }] },
  { day: 21 },
  { day: 22 },
  { day: 23, events: [{ title: 'Blokirano', time: 'Popodne', service: 'Blokirano', status: 'blocked' }] },
  { day: 24 },
  { day: 25 },
  { day: 26, events: [{ title: 'Rex', time: '09:30', service: 'Grooming', status: 'pending' }] },
  { day: 27 },
  { day: 28 },
  { day: 29 },
  { day: 30, events: [{ title: 'Mika', time: '13:00', service: 'Trening', status: 'confirmed' }] },
  { day: 31 },
  { day: 1, muted: true },
  { day: 2, muted: true },
];

const todaySchedule = [
  { time: '10:00', title: 'Individualni trening — Rio', meta: 'Rijeka, Kantrida', status: 'confirmed' as CalendarStatus },
  { time: '13:15', title: 'Pauza za put', meta: '30 min buffer', status: 'blocked' as CalendarStatus },
  { time: '17:30', title: 'Čuvanje — Bela', meta: 'Prvi susret, vlasnik dolazi', status: 'pending' as CalendarStatus },
];

const upcomingReservations = [
  { pet: 'Koko', service: 'Grooming', owner: 'Ivana P.', date: '14. svi', time: '09:45', status: 'confirmed' as CalendarStatus, price: '38 €' },
  { pet: 'Tara', service: 'Trening', owner: 'Marko R.', date: '17. svi', time: '11:00', status: 'confirmed' as CalendarStatus, price: '45 €' },
  { pet: 'Bela', service: 'Čuvanje', owner: 'Ana L.', date: '12. svi', time: '17:30', status: 'pending' as CalendarStatus, price: '24 €' },
];

const statusStyles: Record<CalendarStatus, string> = {
  confirmed: 'border-[color:var(--pp-color-success)]/25 bg-[color:var(--pp-color-success-surface)] text-[color:var(--pp-color-success)]',
  pending: 'border-[color:var(--pp-color-warning)]/25 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-warning)]',
  blocked: 'border-[color:var(--pp-color-muted-text)]/20 bg-[color:var(--pp-color-cream-surface)] text-[color:var(--pp-color-muted-text)]',
  completed: 'border-[color:var(--pp-color-teal-accent)]/25 bg-[color:var(--pp-color-info-surface)] text-[color:var(--pp-color-teal-accent)]',
};

const statusLabels: Record<CalendarStatus, string> = {
  confirmed: 'Potvrđeno',
  pending: 'Čeka potvrdu',
  blocked: 'Blokirano',
  completed: 'Završeno',
};

function StatusBadge({ status }: { status: CalendarStatus }) {
  return (
    <span className={cn('inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-extrabold leading-none', statusStyles[status])}>
      {statusLabels[status]}
    </span>
  );
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
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-orange-primary)]">Ovaj tjedan</p>
          <p className="mt-2 text-3xl font-black text-[color:var(--pp-color-forest-text)]">12</p>
          <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">aktivnih rezervacija</p>
        </div>
      </Card>
    </aside>
  );
}

function CalendarToolbar() {
  return (
    <Card radius="24" shadow="small" className="p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2">
          <IconButton variant="ghost" aria-label="Prethodni mjesec"><ChevronLeft className="size-5" /></IconButton>
          <div>
            <p className="text-lg font-black text-[color:var(--pp-color-forest-text)]">Svibanj 2026.</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">Danas je 12. svibnja</p>
          </div>
          <IconButton variant="ghost" aria-label="Sljedeći mjesec"><ChevronRight className="size-5" /></IconButton>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="grid grid-cols-3 rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-cream-surface)] p-1 text-sm font-extrabold">
            <button className="rounded-[var(--pp-radius-control)] bg-white px-4 py-2 text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)]">Mjesec</button>
            <button className="px-4 py-2 text-[color:var(--pp-color-muted-text)]">Tjedan</button>
            <button className="px-4 py-2 text-[color:var(--pp-color-muted-text)]">Dan</button>
          </div>
          <Select aria-label="Filter usluge" defaultValue="all" className="min-h-10 shadow-none">
            <option value="all">Sve usluge</option>
            <option value="sitting">Čuvanje</option>
            <option value="grooming">Grooming</option>
            <option value="training">Trening</option>
          </Select>
          <Select aria-label="Filter statusa" defaultValue="all" className="min-h-10 shadow-none">
            <option value="all">Svi statusi</option>
            <option value="confirmed">Potvrđeno</option>
            <option value="pending">Čeka potvrdu</option>
            <option value="blocked">Blokirano</option>
          </Select>
        </div>
      </div>
    </Card>
  );
}

function CalendarEventChip({ event }: { event: CalendarEvent }) {
  const serviceIcon = event.service === 'Grooming' ? Scissors : event.service === 'Trening' ? Dog : event.service === 'Blokirano' ? Clock3 : PawPrint;
  const ServiceIcon = serviceIcon;

  return (
    <div className={cn('mt-1 flex min-w-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-extrabold leading-none', statusStyles[event.status])}>
      <ServiceIcon className="size-3 shrink-0" aria-hidden />
      <span className="truncate">{event.time} · {event.title}</span>
    </div>
  );
}

function CalendarDayCell({ day }: { day: CalendarDay }) {
  return (
    <div className={cn(
      'min-h-[92px] rounded-[18px] border p-2 transition',
      day.today ? 'border-[color:var(--pp-color-orange-primary)] bg-[color:var(--pp-color-warning-surface)] shadow-[var(--pp-shadow-small-card)]' : 'border-[color:var(--pp-color-warm-border)] bg-white/78',
      day.muted && 'bg-[color:var(--pp-color-cream-surface)]/55 text-[color:var(--pp-color-muted-text)]/60',
    )}>
      <div className="flex items-center justify-between">
        <span className={cn('text-sm font-black', day.today ? 'text-[color:var(--pp-color-orange-primary)]' : 'text-[color:var(--pp-color-forest-text)]')}>{day.day}</span>
        {day.today ? <span className="rounded-full bg-[color:var(--pp-color-orange-primary)] px-2 py-0.5 text-[10px] font-black text-white">Danas</span> : null}
      </div>
      <div className="mt-2">
        {day.events?.slice(0, 2).map((event) => <CalendarEventChip key={`${day.day}-${event.title}-${event.time}`} event={event} />)}
      </div>
    </div>
  );
}

function CalendarMonthGrid() {
  return (
    <Card radius="28" className="p-4 sm:p-5">
      <div className="hidden grid-cols-7 gap-2 pb-3 text-center text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)] sm:grid">
        {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map((day) => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-7">
        {calendarDays.map((day, index) => <CalendarDayCell key={`${day.day}-${index}`} day={day} />)}
      </div>
    </Card>
  );
}

function TodaySchedule() {
  return (
    <Card radius="28" className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-teal-accent)]">Današnji raspored</p>
          <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">3 termina</h2>
        </div>
        <Badge variant="teal">12. svi</Badge>
      </div>
      <div className="mt-5 space-y-4">
        {todaySchedule.map((item) => (
          <div key={`${item.time}-${item.title}`} className="grid grid-cols-[64px_1fr] gap-3">
            <div className="pt-1 text-sm font-black text-[color:var(--pp-color-forest-text)]">{item.time}</div>
            <div className="rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-cream-surface)] p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{item.title}</p>
                  <p className="mt-1 text-xs font-bold text-[color:var(--pp-color-muted-text)]">{item.meta}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ReservationCard({ reservation }: { reservation: typeof upcomingReservations[number] }) {
  return (
    <Card radius="20" shadow="small" className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={reservation.pet.slice(0, 2).toUpperCase()} />
          <div>
            <p className="font-black text-[color:var(--pp-color-forest-text)]">{reservation.pet} · {reservation.service}</p>
            <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">{reservation.owner} · {reservation.date} u {reservation.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={reservation.status} />
          <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{reservation.price}</span>
        </div>
      </div>
    </Card>
  );
}

function UpcomingReservations() {
  return (
    <Card radius="28" className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-orange-primary)]">Nadolazeće rezervacije</p>
          <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Potvrdi i prati termine</h2>
        </div>
        <Button variant="secondary" size="sm">Vidi sve</Button>
      </div>
      <div className="mt-5 space-y-3">
        {upcomingReservations.map((reservation) => <ReservationCard key={`${reservation.pet}-${reservation.date}`} reservation={reservation} />)}
      </div>
    </Card>
  );
}

function AvailabilityCard() {
  const workingHours = [
    ['Pon–Pet', '08:00–18:00', true],
    ['Subota', '09:00–14:00', true],
    ['Nedjelja', 'Zatvoreno', false],
  ] as const;

  return (
    <Card radius="28" tone="sage" className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-teal-accent)]">Dostupnost</p>
          <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Radno vrijeme</h2>
        </div>
        <Filter className="size-5 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
      </div>
      <div className="mt-5 space-y-3">
        {workingHours.map(([label, hours, active]) => (
          <div key={label} className="flex items-center justify-between rounded-[var(--pp-radius-card-20)] bg-white/70 p-3">
            <div>
              <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{label}</p>
              <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">{hours}</p>
            </div>
            <span className={cn('h-7 w-12 rounded-full p-1 transition', active ? 'bg-[color:var(--pp-color-teal-accent)]' : 'bg-[color:var(--pp-color-warm-border)]')}>
              <span className={cn('block size-5 rounded-full bg-white shadow-sm transition', active && 'translate-x-5')} />
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-card-surface)] p-4">
        <div className="flex items-center gap-2 text-sm font-black text-[color:var(--pp-color-success)]">
          <CheckCircle2 className="size-4" aria-hidden /> Automatski buffer je uključen
        </div>
        <p className="mt-2 text-sm font-bold leading-relaxed text-[color:var(--pp-color-muted-text)]">
          PetPark će kasnije ovdje spojiti stvarna pravila dostupnosti, pauze i blokirane termine.
        </p>
      </div>
    </Card>
  );
}

export function ProviderCalendarPage() {
  return (
    <main data-petpark-route="kalendar" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/objavi-uslugu" size="sm">Spremi nacrt</ButtonLink>} />

      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-20 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-80 hidden scale-125 -rotate-12 lg:block" />
        <div className="mx-auto max-w-[var(--pp-content-width)]">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <ProviderSidebar />

            <div className="order-1 min-w-0 space-y-6 lg:order-none">
              <div className="flex flex-col gap-5 rounded-[var(--pp-radius-card-28)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-6 shadow-[var(--pp-shadow-soft-card)] lg:flex-row lg:items-end lg:justify-between lg:p-8">
                <div>
                  <Badge variant="orange">Provider workspace</Badge>
                  <h1 className="mt-4 max-w-[520px] text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] sm:text-5xl">
                    Kalendar i rezervacije
                  </h1>
                  <p className="mt-4 max-w-[640px] text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">
                    Planiraj čuvanje, grooming i treninge bez preklapanja. Ovo je UI pregled za buduća pravila dostupnosti i rezervacije.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/kalendar/dan" variant="secondary">Dnevni raspored</ButtonLink>
                  <ButtonLink href="/objavi-uslugu"><Plus className="size-4" aria-hidden /> Spremi nacrt</ButtonLink>
                </div>
              </div>

              <CalendarToolbar />

              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
                <CalendarMonthGrid />
                <div className="space-y-6">
                  <TodaySchedule />
                  <AvailabilityCard />
                </div>
              </div>

              <UpcomingReservations />

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['18', 'slobodnih termina', 'sage'],
                  ['4', 'čekaju potvrdu', 'orange'],
                  ['96%', 'popunjenost tjedna', 'teal'],
                ].map(([value, label, tone]) => (
                  <Card key={label} radius="24" tone={tone as 'sage' | 'orange' | 'teal'} className="p-5">
                    <p className="text-3xl font-black text-[color:var(--pp-color-forest-text)]">{value}</p>
                    <p className="mt-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{label}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
