import Link from 'next/link';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Home,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Scissors,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
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

type AppointmentStatus = 'confirmed' | 'arrived' | 'inProgress' | 'ready' | 'pending';
type Appointment = {
  time: string;
  end: string;
  pet: string;
  owner: string;
  service: string;
  duration: string;
  price: string;
  status: AppointmentStatus;
  notes: string;
  coat: string;
};

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/objavi-uslugu', label: 'Objavi uslugu' },
  { href: '/kalendar', label: 'Kalendar' },
  { href: '/kalendar/dan', label: 'Dnevni raspored' },
];

const sidebarItems = [
  { label: 'Pregled', icon: Home, href: '/moje-usluge' },
  { label: 'Kalendar', icon: CalendarDays, href: '/kalendar' },
  { label: 'Dnevni raspored', icon: Clock3, href: '/kalendar/dan', active: true },
  { label: 'Moje usluge', icon: Scissors, href: '/moje-usluge' },
  { label: 'Poruke', icon: MessageCircle, href: '/poruke' },
  { label: 'Profil', icon: UserRound, href: '/dashboard/profile' },
];

const appointments: Appointment[] = [
  {
    time: '08:30',
    end: '09:45',
    pet: 'Luna',
    owner: 'Ivana P.',
    service: 'Kupanje + šišanje',
    duration: '75 min',
    price: '42 €',
    status: 'ready',
    notes: 'Osjetljive šapice, koristi blaži šampon.',
    coat: 'Duga dlaka',
  },
  {
    time: '10:00',
    end: '11:20',
    pet: 'Maks',
    owner: 'Ana L.',
    service: 'Trimanje + nokti',
    duration: '80 min',
    price: '48 €',
    status: 'inProgress',
    notes: 'Nervozan kod feniranja, kratke pauze pomažu.',
    coat: 'Srednja dlaka',
  },
  {
    time: '12:00',
    end: '13:00',
    pet: 'Koko',
    owner: 'Luka V.',
    service: 'Higijenski tretman',
    duration: '60 min',
    price: '34 €',
    status: 'arrived',
    notes: 'Prvi dolazak, pitati vlasnika za alergije.',
    coat: 'Kratka dlaka',
  },
  {
    time: '14:30',
    end: '16:00',
    pet: 'Bela',
    owner: 'Sara M.',
    service: 'Full grooming paket',
    duration: '90 min',
    price: '56 €',
    status: 'confirmed',
    notes: 'Dodati mašnicu nakon tretmana.',
    coat: 'Kovrčava dlaka',
  },
  {
    time: '17:00',
    end: '18:15',
    pet: 'Rio',
    owner: 'Marko R.',
    service: 'Kupanje i raščešljavanje',
    duration: '75 min',
    price: '39 €',
    status: 'pending',
    notes: 'Čeka potvrdu dolaska vlasnika.',
    coat: 'Gusta poddlaka',
  },
];

const statusLabels: Record<AppointmentStatus, string> = {
  confirmed: 'Potvrđeno',
  arrived: 'Stigao',
  inProgress: 'U tijeku',
  ready: 'Spreman',
  pending: 'Čeka potvrdu',
};

const statusClasses: Record<AppointmentStatus, string> = {
  confirmed: 'border-[color:var(--pp-color-success)]/25 bg-[color:var(--pp-color-success-surface)] text-[color:var(--pp-color-success)]',
  arrived: 'border-[color:var(--pp-color-teal-accent)]/25 bg-[color:var(--pp-color-info-surface)] text-[color:var(--pp-color-teal-accent)]',
  inProgress: 'border-[color:var(--pp-color-orange-primary)]/25 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]',
  ready: 'border-[color:var(--pp-color-success)]/25 bg-[color:var(--pp-color-success-surface)] text-[color:var(--pp-color-success)]',
  pending: 'border-[color:var(--pp-color-warning)]/25 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-warning)]',
};

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={cn('inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black leading-none', statusClasses[status])}>
      {statusLabels[status]}
    </span>
  );
}

function GroomerSidebar() {
  return (
    <aside className="order-2 lg:order-none lg:sticky lg:top-28 lg:self-start">
      <Card radius="28" className="p-5">
        <div className="flex items-center gap-3 border-b border-[color:var(--pp-color-warm-border)] pb-5">
          <Avatar initials="LP" size="lg" />
          <div>
            <p className="text-sm font-extrabold text-[color:var(--pp-color-forest-text)]">Lana Petrović</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">Groomer • Rijeka</p>
            <div className="mt-2 flex items-center gap-1 text-xs font-extrabold text-[color:var(--pp-color-success)]">
              <ShieldCheck className="size-4" aria-hidden /> Verificirano
            </div>
          </div>
        </div>

        <nav aria-label="Groomer navigacija" className="mt-5 space-y-2">
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
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-orange-primary)]">Danas</p>
          <p className="mt-2 text-3xl font-black text-[color:var(--pp-color-forest-text)]">5</p>
          <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">grooming narudžbi</p>
        </div>
      </Card>
    </aside>
  );
}

function TimelineAppointment({ appointment, index }: { appointment: Appointment; index: number }) {
  const isActive = appointment.status === 'inProgress';
  return (
    <div className="grid gap-3 sm:grid-cols-[86px_1fr]">
      <div className="pt-2 text-sm font-black text-[color:var(--pp-color-muted-text)]">
        <p>{appointment.time}</p>
        <p className="text-xs font-bold">{appointment.end}</p>
      </div>
      <Card
        radius="24"
        shadow="small"
        className={cn('relative p-4', isActive && 'border-[color:var(--pp-color-orange-primary)] bg-[color:var(--pp-color-warning-surface)]/50')}
      >
        <span className={cn('absolute -left-[35px] top-6 hidden size-4 rounded-full border-4 border-[color:var(--pp-color-card-surface)] sm:block', isActive ? 'bg-[color:var(--pp-color-orange-primary)]' : 'bg-[color:var(--pp-color-teal-accent)]')} />
        {index < appointments.length - 1 ? <span className="absolute -left-[28px] top-10 hidden h-[calc(100%+16px)] w-0.5 bg-[color:var(--pp-color-warm-border)] sm:block" /> : null}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-[color:var(--pp-color-forest-text)]">{appointment.pet}</h3>
              <StatusBadge status={appointment.status} />
            </div>
            <p className="mt-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{appointment.service} · {appointment.coat}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-extrabold text-[color:var(--pp-color-muted-text)]">
              <span className="inline-flex items-center gap-1"><UserRound className="size-4" /> {appointment.owner}</span>
              <span className="inline-flex items-center gap-1"><Clock3 className="size-4" /> {appointment.duration}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> Salon Kantrida</span>
            </div>
            <p className="mt-3 rounded-[var(--pp-radius-card-20)] bg-white/75 px-3 py-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{appointment.notes}</p>
          </div>
          <div className="flex items-center justify-between gap-3 xl:min-w-[150px] xl:justify-end">
            <span className="text-xl font-black text-[color:var(--pp-color-forest-text)]">{appointment.price}</span>
            <IconButton aria-label={`Opcije za ${appointment.pet}`} variant="secondary"><MoreHorizontal className="size-5" /></IconButton>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DayTimeline() {
  return (
    <Card radius="28" className="p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-orange-primary)]">Day timeline</p>
          <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Dnevni raspored</h2>
        </div>
        <div className="flex gap-2">
          <IconButton aria-label="Prethodni dan" variant="ghost"><ChevronLeft className="size-5" /></IconButton>
          <IconButton aria-label="Sljedeći dan" variant="ghost"><ChevronRight className="size-5" /></IconButton>
        </div>
      </div>
      <div className="relative mt-6 space-y-4 sm:pl-12">
        {appointments.map((appointment, index) => (
          <TimelineAppointment key={`${appointment.time}-${appointment.pet}`} appointment={appointment} index={index} />
        ))}
      </div>
    </Card>
  );
}

function TodayOverview() {
  const revenue = appointments.reduce((sum, item) => sum + Number.parseInt(item.price, 10), 0);
  const active = appointments.find((item) => item.status === 'inProgress') ?? appointments[0];

  return (
    <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <Card radius="28" tone="teal" className="p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-teal-accent)]">Today overview</p>
        <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Danas u salonu</h2>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[var(--pp-radius-card-20)] bg-white/75 p-4">
            <p className="text-2xl font-black text-[color:var(--pp-color-forest-text)]">5</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">narudžbi</p>
          </div>
          <div className="rounded-[var(--pp-radius-card-20)] bg-white/75 p-4">
            <p className="text-2xl font-black text-[color:var(--pp-color-forest-text)]">{revenue} €</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">planirani promet</p>
          </div>
          <div className="rounded-[var(--pp-radius-card-20)] bg-white/75 p-4">
            <p className="text-2xl font-black text-[color:var(--pp-color-forest-text)]">1</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">čeka potvrdu</p>
          </div>
          <div className="rounded-[var(--pp-radius-card-20)] bg-white/75 p-4">
            <p className="text-2xl font-black text-[color:var(--pp-color-forest-text)]">45m</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">slobodan blok</p>
          </div>
        </div>
      </Card>

      <Card radius="28" className="p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-orange-primary)]">Aktivna narudžba</p>
        <div className="mt-4 flex items-center gap-3">
          <Avatar initials="MA" size="lg" />
          <div>
            <h3 className="text-xl font-black text-[color:var(--pp-color-forest-text)]">{active.pet}</h3>
            <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">{active.service}</p>
          </div>
        </div>
        <div className="mt-4 space-y-3 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
          <p className="flex items-center gap-2"><UsersRound className="size-4 text-[color:var(--pp-color-teal-accent)]" /> Vlasnik: {active.owner}</p>
          <p className="flex items-center gap-2"><Clock3 className="size-4 text-[color:var(--pp-color-orange-primary)]" /> {active.time}–{active.end}, {active.duration}</p>
          <p className="flex items-center gap-2"><Scissors className="size-4 text-[color:var(--pp-color-success)]" /> {active.coat}</p>
        </div>
        <Button className="mt-5 w-full" variant="teal">Označi kao završeno</Button>
      </Card>

      <Card radius="28" tone="orange" className="p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-small-card)]">
            <Bell className="size-5" />
          </span>
          <div>
            <h3 className="font-black text-[color:var(--pp-color-forest-text)]">Podsjetnici su spremni</h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">PetPark može kasnije slati automatske SMS/e-mail podsjetnike. Ovdje je samo UI preview.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function OrdersList() {
  return (
    <Card radius="28" className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-teal-accent)]">Današnje narudžbe</p>
          <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Brzi pregled</h2>
        </div>
        <Button variant="secondary" size="sm">Ispiši dnevni plan</Button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {appointments.slice(0, 3).map((item) => (
          <div key={item.pet} className="rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warm-border)] bg-white/78 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-[color:var(--pp-color-forest-text)]">{item.pet}</p>
                <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">{item.time} · {item.owner}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{item.service}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function GroomerDaySchedulePage() {
  return (
    <main data-petpark-route="kalendar-dan" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/kalendar" size="sm"><Plus className="size-4" /> Kalendar</ButtonLink>} />

      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <div className="absolute left-[7%] top-[360px] hidden size-20 rounded-full bg-[color:var(--pp-color-warning-surface)]/80 blur-2xl lg:block" />

        <div className="mx-auto max-w-[var(--pp-content-width)]">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <GroomerSidebar />

            <div className="order-1 min-w-0 space-y-6 lg:order-none">
              <Card radius="28" className="p-6 lg:p-8">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <Badge variant="orange">Groomer workspace</Badge>
                    <h1 className="mt-4 max-w-[440px] text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] sm:text-5xl">Dnevni raspored</h1>
                    <p className="mt-4 max-w-[520px] text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">Pregled svih rezervacija za danas — grooming usluge, statusi, napomene i priprema salona.</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Select aria-label="Odaberi datum" defaultValue="today" className="min-h-12 shadow-none">
                      <option value="today">Danas, 12. svibnja</option>
                      <option value="tomorrow">Sutra, 13. svibnja</option>
                    </Select>
                    <ButtonLink href="/kalendar" variant="secondary"><CalendarDays className="size-4" /> Mjesečni kalendar</ButtonLink>
                    <ButtonLink href="/objavi-uslugu"><Plus className="size-4" /> Pripremi nacrt</ButtonLink>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card radius="24" tone="sage" className="p-5"><CheckCircle2 className="mb-3 size-5 text-[color:var(--pp-color-success)]" /><p className="text-3xl font-black">3</p><p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">potvrđene narudžbe</p></Card>
                <Card radius="24" tone="orange" className="p-5"><Clock3 className="mb-3 size-5 text-[color:var(--pp-color-orange-primary)]" /><p className="text-3xl font-black">1</p><p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">trenutno u tijeku</p></Card>
                <Card radius="24" tone="teal" className="p-5"><Scissors className="mb-3 size-5 text-[color:var(--pp-color-teal-accent)]" /><p className="text-3xl font-black">6h 20m</p><p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">planiranog rada</p></Card>
                <Card radius="24" tone="cream" className="p-5"><Sparkles className="mb-3 size-5 text-[color:var(--pp-color-orange-primary)]" /><p className="text-3xl font-black">219 €</p><p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">dnevni promet</p></Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,820px)_minmax(300px,1fr)]">
                <div className="space-y-6">
                  <DayTimeline />
                  <OrdersList />
                </div>
                <TodayOverview />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
