import Link from 'next/link';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Home,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  PawPrint,
  Plus,
  Repeat2,
  ShieldCheck,
  Trophy,
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
  LeafDecoration,
  PawDecoration,
} from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';

type SessionStatus = 'open' | 'almost' | 'full';
type SessionLevel = 'Početni' | 'Srednji' | 'Napredni';

type TrainingSession = {
  title: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  registered: number;
  price: string;
  status: SessionStatus;
  level: SessionLevel;
  note: string;
};

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/objavi-uslugu', label: 'Objavi uslugu' },
  { href: '/kalendar', label: 'Kalendar' },
  { href: '/grupni-treninzi', label: 'Grupni treninzi' },
];

const sidebarItems = [
  { label: 'Pregled', icon: Home, href: '/moje-usluge' },
  { label: 'Kalendar', icon: CalendarDays, href: '/kalendar' },
  { label: 'Grupni treninzi', icon: UsersRound, href: '/grupni-treninzi', active: true },
  { label: 'Poruke', icon: MessageCircle, href: '/poruke' },
  { label: 'Profil', icon: UserRound, href: '/dashboard/profile' },
];

const sessions: TrainingSession[] = [
  {
    title: 'Puppy socijalizacija',
    date: '16. svi',
    time: '10:00',
    location: 'Rijeka, park Mlaka',
    capacity: 8,
    registered: 6,
    price: '28 €',
    status: 'open',
    level: 'Početni',
    note: 'Sigurna grupa za prve pseće kontakte.',
  },
  {
    title: 'Osnovna poslušnost',
    date: '18. svi',
    time: '18:00',
    location: 'Kantrida trening zona',
    capacity: 10,
    registered: 9,
    price: '32 €',
    status: 'almost',
    level: 'Početni',
    note: 'Sjedi, čekaj, dođi i mirna šetnja.',
  },
  {
    title: 'Grupni trening na povodcu',
    date: '21. svi',
    time: '17:30',
    location: 'Trsat, plato ispod parka',
    capacity: 8,
    registered: 8,
    price: '34 €',
    status: 'full',
    level: 'Srednji',
    note: 'Kontrola uz distrakcije i gradske situacije.',
  },
  {
    title: 'Napredna poslušnost',
    date: '25. svi',
    time: '09:30',
    location: 'Kostrena, poligon',
    capacity: 6,
    registered: 3,
    price: '42 €',
    status: 'open',
    level: 'Napredni',
    note: 'Rad bez povodca i stabilan opoziv.',
  },
];

const participants = [
  ['Maks', 'Ana L.', 'MA'],
  ['Nala', 'Ivana P.', 'NA'],
  ['Rio', 'Marko R.', 'RI'],
  ['Bela', 'Sara M.', 'BE'],
  ['Tara', 'Petra K.', 'TA'],
  ['Koko', 'Luka V.', 'KO'],
];

const statusCopy: Record<SessionStatus, string> = {
  open: 'Otvoreno',
  almost: 'Skoro popunjeno',
  full: 'Popunjeno',
};

const statusClasses: Record<SessionStatus, string> = {
  open: 'border-[color:var(--pp-color-success)]/25 bg-[color:var(--pp-color-success-surface)] text-[color:var(--pp-color-success)]',
  almost: 'border-[color:var(--pp-color-warning)]/25 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-warning)]',
  full: 'border-[color:var(--pp-color-error)]/25 bg-[color:var(--pp-color-error-surface)] text-[color:var(--pp-color-error)]',
};

const levelClasses: Record<SessionLevel, string> = {
  Početni: 'bg-[color:var(--pp-color-success-surface)] text-[color:var(--pp-color-success)]',
  Srednji: 'bg-[color:var(--pp-color-info-surface)] text-[color:var(--pp-color-teal-accent)]',
  Napredni: 'bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]',
};

function StatusBadge({ status }: { status: SessionStatus }) {
  return <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-black leading-none', statusClasses[status])}>{statusCopy[status]}</span>;
}

function CapacityBar({ registered, capacity }: { registered: number; capacity: number }) {
  const percentage = Math.min(100, Math.round((registered / capacity) * 100));
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-extrabold text-[color:var(--pp-color-muted-text)]">
        <span>{registered}/{capacity} prijavljenih</span>
        <span>{capacity - registered} slobodno</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--pp-color-cream-surface)]">
        <div className="h-full rounded-full bg-[color:var(--pp-color-teal-accent)]" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function TrainerSidebar() {
  return (
    <aside className="order-2 lg:order-none lg:sticky lg:top-28 lg:self-start">
      <Card radius="28" className="p-5">
        <div className="flex items-center gap-3 border-b border-[color:var(--pp-color-warm-border)] pb-5">
          <Avatar initials="LP" size="lg" />
          <div>
            <p className="text-sm font-extrabold text-[color:var(--pp-color-forest-text)]">Lana Petrović</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">Certificirana trenerica</p>
            <div className="mt-2 flex items-center gap-1 text-xs font-extrabold text-[color:var(--pp-color-success)]">
              <ShieldCheck className="size-4" aria-hidden /> Verificirano
            </div>
          </div>
        </div>

        <nav aria-label="Trener navigacija" className="mt-5 space-y-2">
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

        <div className="mt-6 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-info-surface)] p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-teal-accent)]">Ovaj mjesec</p>
          <p className="mt-2 text-3xl font-black text-[color:var(--pp-color-forest-text)]">26</p>
          <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">polaznika u grupama</p>
        </div>
      </Card>
    </aside>
  );
}

function StatCard({ value, label, icon: Icon, tone }: { value: string; label: string; icon: typeof UsersRound; tone: 'sage' | 'teal' | 'orange' | 'cream' }) {
  return (
    <Card radius="24" tone={tone} className="p-5">
      <div className="flex items-center justify-between gap-3">
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

function ParticipantAvatars({ count }: { count: number }) {
  return (
    <div className="flex -space-x-2">
      {participants.slice(0, Math.min(count, 4)).map(([pet, , initials]) => <Avatar key={pet} initials={initials} size="sm" />)}
      {count > 4 ? <span className="inline-flex size-9 items-center justify-center rounded-full border-2 border-white bg-[color:var(--pp-color-cream-surface)] text-xs font-black text-[color:var(--pp-color-muted-text)]">+{count - 4}</span> : null}
    </div>
  );
}

function TrainingSessionRow({ session, selected = false }: { session: TrainingSession; selected?: boolean }) {
  return (
    <Card radius="24" shadow="small" className={cn('p-4 transition', selected && 'border-[color:var(--pp-color-orange-primary)] bg-[color:var(--pp-color-warning-surface)]/45')}>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.8fr_0.7fr_auto] xl:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-[color:var(--pp-color-forest-text)]">{session.title}</h3>
            <span className={cn('rounded-full px-3 py-1 text-xs font-black', levelClasses[session.level])}>{session.level}</span>
          </div>
          <p className="mt-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{session.note}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-extrabold text-[color:var(--pp-color-muted-text)]">
            <span className="inline-flex items-center gap-1"><CalendarDays className="size-4" /> {session.date}</span>
            <span className="inline-flex items-center gap-1"><Clock3 className="size-4" /> {session.time}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {session.location}</span>
          </div>
        </div>

        <CapacityBar registered={session.registered} capacity={session.capacity} />

        <div className="flex items-center justify-between gap-3 xl:block">
          <ParticipantAvatars count={session.registered} />
          <div className="xl:mt-3">
            <StatusBadge status={session.status} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 xl:justify-end">
          <span className="text-lg font-black text-[color:var(--pp-color-forest-text)]">{session.price}</span>
          <button type="button" aria-label="Više opcija" className="inline-flex size-10 items-center justify-center rounded-full bg-white text-[color:var(--pp-color-muted-text)] shadow-[var(--pp-shadow-small-card)]">
            <MoreHorizontal className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </Card>
  );
}

function TrainingSessionList() {
  return (
    <Card radius="28" className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-orange-primary)]">Nadolazeći termini</p>
          <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Upcoming group trainings</h2>
        </div>
        <Button variant="secondary" size="sm">Uredi raspored</Button>
      </div>
      <div className="mt-5 space-y-3">
        {sessions.map((session, index) => <TrainingSessionRow key={session.title} session={session} selected={index === 0} />)}
      </div>
    </Card>
  );
}

function ParticipantList() {
  return (
    <div className="space-y-3">
      {participants.map(([pet, owner, initials]) => (
        <div key={pet} className="flex items-center justify-between gap-3 rounded-[var(--pp-radius-card-20)] bg-white/75 p-3">
          <div className="flex items-center gap-3">
            <Avatar initials={initials} size="sm" />
            <div>
              <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{pet}</p>
              <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">{owner}</p>
            </div>
          </div>
          <CheckCircle2 className="size-4 text-[color:var(--pp-color-success)]" aria-hidden />
        </div>
      ))}
    </div>
  );
}

function SessionDetailsPanel() {
  const selected = sessions[0];
  return (
    <Card radius="28" tone="sage" className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-teal-accent)]">Odabrani trening</p>
          <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">{selected.title}</h2>
          <p className="mt-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{selected.date} · {selected.time} · {selected.location}</p>
        </div>
        <StatusBadge status={selected.status} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Card radius="20" className="p-4">
          <p className="text-2xl font-black text-[color:var(--pp-color-forest-text)]">{selected.registered}/{selected.capacity}</p>
          <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">kapacitet</p>
        </Card>
        <Card radius="20" className="p-4">
          <p className="text-2xl font-black text-[color:var(--pp-color-forest-text)]">24h</p>
          <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">podsjetnik</p>
        </Card>
      </div>

      <div className="mt-5">
        <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]">Polaznici</h3>
        <ParticipantList />
      </div>

      <div className="mt-5 rounded-[var(--pp-radius-card-20)] bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-black text-[color:var(--pp-color-forest-text)]">
          <MessageCircle className="size-4 text-[color:var(--pp-color-teal-accent)]" aria-hidden /> Poruka polaznicima
        </div>
        <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
          Vidimo se u subotu u 10:00. Ponesite omiljene poslastice i kraći povodac.
        </p>
        <Button className="mt-4 w-full" variant="teal">Pošalji poruku svim polaznicima</Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--pp-radius-card-20)] bg-white/75 p-4 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
          <Bell className="mb-2 size-5 text-[color:var(--pp-color-orange-primary)]" /> Automatski podsjetnik 24h prije treninga.
        </div>
        <div className="rounded-[var(--pp-radius-card-20)] bg-white/75 p-4 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
          <Repeat2 className="mb-2 size-5 text-[color:var(--pp-color-teal-accent)]" /> Ponavljanje termina svake subote.
        </div>
      </div>
    </Card>
  );
}

function TrainingBookingPanel() {
  return (
    <Card radius="28" className="p-5 lg:sticky lg:top-28 lg:self-start">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-orange-primary)]">Rezervacija</p>
      <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Rezerviraj točan trening</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Odaberi termin i psa za grupni trening. Ovo je statični UI preview bez stvarne rezervacije.</p>

      <div className="mt-5 space-y-3">
        {sessions.slice(0, 3).map((session, index) => (
          <label key={session.title} className={cn('block cursor-pointer rounded-[var(--pp-radius-card-20)] border p-4 transition', index === 0 ? 'border-[color:var(--pp-color-orange-primary)] bg-[color:var(--pp-color-warning-surface)]' : 'border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)]')}>
            <div className="flex items-start gap-3">
              <span className={cn('mt-1 inline-flex size-4 rounded-full border-2', index === 0 ? 'border-[color:var(--pp-color-orange-primary)] bg-[color:var(--pp-color-orange-primary)]' : 'border-[color:var(--pp-color-warm-border)]')} />
              <span className="min-w-0 flex-1">
                <span className="block font-black text-[color:var(--pp-color-forest-text)]">{session.title}</span>
                <span className="mt-1 block text-xs font-bold text-[color:var(--pp-color-muted-text)]">{session.date} · {session.time}</span>
                <span className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-black', levelClasses[session.level])}>{session.level}</span>
                  <span className="text-xs font-extrabold text-[color:var(--pp-color-muted-text)]">{session.capacity - session.registered} mjesta</span>
                  <span className="ml-auto text-sm font-black text-[color:var(--pp-color-forest-text)]">{session.price}</span>
                </span>
              </span>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-5 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[color:var(--pp-color-teal-accent)]">Odabrani pas</p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar initials="MA" />
          <div>
            <p className="font-black text-[color:var(--pp-color-forest-text)]">Maks</p>
            <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">Border collie · 2 godine</p>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-4">
        <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Ana L.</p>
        <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">ana@example.com · +385 91 000 0000</p>
      </div>

      <Button className="mt-5 w-full" size="lg">Rezerviraj ovaj trening</Button>

      <div className="mt-4 rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warm-border)] bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-black text-[color:var(--pp-color-success)]"><CheckCircle2 className="size-4" /> Potvrda nakon odobrenja trenera</div>
        <p className="mt-2 text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">Podsjetnik stiže 24h prije treninga. Otkazivanje ostaje fleksibilno prema pravilima trenera.</p>
      </div>
    </Card>
  );
}

export function GroupTrainingsPage() {
  return (
    <main data-petpark-route="grupni-treninzi" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/kalendar" size="sm">Kalendar</ButtonLink>} />

      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[520px] hidden scale-125 -rotate-12 lg:block" />
        <PawDecoration className="right-[10%] top-56 hidden xl:flex" />

        <div className="mx-auto max-w-[var(--pp-content-width)]">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <TrainerSidebar />

            <div className="order-1 min-w-0 space-y-6 lg:order-none">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="rounded-[var(--pp-radius-card-28)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-6 shadow-[var(--pp-shadow-soft-card)] lg:p-8">
                  <Badge variant="orange">Trainer workspace</Badge>
                  <h1 className="mt-4 max-w-[440px] text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] sm:text-5xl">Grupni treninzi</h1>
                  <p className="mt-4 max-w-[560px] text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">
                    Organiziraj grupne termine, prati prijave i šalji obavijesti polaznicima bez ručnog prepisivanja.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <ButtonLink href="/kalendar"><Plus className="size-4" aria-hidden /> Novi termin</ButtonLink>
                    <ButtonLink href="/kalendar/dan" variant="secondary"><Bell className="size-4" aria-hidden /> Dnevni raspored</ButtonLink>
                  </div>
                </div>

                <Card radius="28" tone="teal" className="relative overflow-hidden p-6">
                  <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/40" />
                  <Trophy className="relative size-10 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                  <h2 className="relative mt-5 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Grupe koje se pune same</h2>
                  <p className="relative mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">PetPark kasnije može spojiti prijave, podsjetnike i ček-liste za svaki termin.</p>
                  <div className="relative mt-5 flex items-center gap-2 text-sm font-black text-[color:var(--pp-color-teal-accent)]">Plan za 7 dana <ChevronRight className="size-4" /></div>
                </Card>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard value="4" label="Aktivni treninzi" icon={CalendarDays} tone="sage" />
                <StatCard value="26" label="Ukupno prijava" icon={UsersRound} tone="teal" />
                <StatCard value="8" label="Slobodna mjesta" icon={PawPrint} tone="cream" />
                <StatCard value="14" label="Poslane obavijesti" icon={Bell} tone="orange" />
              </div>

              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                  <TrainingSessionList />
                  <SessionDetailsPanel />
                </div>
                <TrainingBookingPanel />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
