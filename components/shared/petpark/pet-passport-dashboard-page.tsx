import Link from 'next/link';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  HeartPulse,
  Home,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Pill,
  Printer,
  QrCode,
  ShieldCheck,
  Share2,
  Sparkles,
  Stethoscope,
  Syringe,
  UserRound,
} from 'lucide-react';
import {
  AppHeader,
  Avatar,
  Badge,
  Button,
  Card,
  LeafDecoration,
  PawDecoration,
} from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';

type Status = 'ok' | 'soon' | 'warning';

type HealthItem = {
  title: string;
  meta: string;
  date: string;
  status: Status;
};

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/kalendar', label: 'Kalendar' },
  { href: '/grupni-treninzi', label: 'Grupni treninzi' },
  { href: '/pet-passport', label: 'Pet Passport' },
];

const sidebarItems = [
  { label: 'Pregled', icon: Home, href: '#' },
  { label: 'Ljubimci', icon: PawPrint, href: '#' },
  { label: 'Pet Passport', icon: FileText, href: '/pet-passport', active: true },
  { label: 'Veterinar', icon: Stethoscope, href: '#' },
  { label: 'Profil', icon: UserRound, href: '#' },
];

const vaccinations: HealthItem[] = [
  { title: 'Bjesnoća', meta: 'Vet Centar Rijeka · dr. Marić', date: '12. ožu 2026.', status: 'ok' },
  { title: 'DHPPi/L', meta: 'Godišnje cjepivo', date: '02. lip 2026.', status: 'soon' },
  { title: 'Zaštita od parazita', meta: 'Tableta + ampula', date: '28. svi 2026.', status: 'soon' },
];

const allergies = [
  { title: 'Piletina', level: 'Umjerena', note: 'Izbjegavati poslastice s pilećim proteinom.' },
  { title: 'Osjetljive šapice', level: 'Blaga', note: 'Koristiti blaži šampon nakon dužih šetnji.' },
];

const medications = [
  { title: 'Omega ulje', dose: '1 žličica dnevno', until: 'kontinuirano' },
  { title: 'Probiotik', dose: '1 kapsula ujutro', until: 'do 18. svi' },
];

const timeline = [
  { date: '12. svi', title: 'Grooming tretman', text: 'Kupanje, raščešljavanje i pregled kože.' },
  { date: '08. svi', title: 'Šetnja s čuvalicom', text: 'Mirna šetnja, bez reakcija na druge pse.' },
  { date: '30. tra', title: 'Vet kontrola', text: 'Težina stabilna, preporuka nastaviti prehranu.' },
];

const statusClasses: Record<Status, string> = {
  ok: 'border-[color:var(--pp-color-success)]/25 bg-[color:var(--pp-color-success-surface)] text-[color:var(--pp-color-success)]',
  soon: 'border-[color:var(--pp-color-warning)]/25 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-warning)]',
  warning: 'border-[color:var(--pp-color-error)]/25 bg-[color:var(--pp-color-error-surface)] text-[color:var(--pp-color-error)]',
};

function StatusBadge({ status, children }: { status: Status; children: string }) {
  return <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-black leading-none', statusClasses[status])}>{children}</span>;
}

function OwnerSidebar() {
  return (
    <aside className="order-2 lg:order-none lg:sticky lg:top-28 lg:self-start">
      <Card radius="28" className="p-5">
        <div className="flex items-center gap-3 border-b border-[color:var(--pp-color-warm-border)] pb-5">
          <Avatar initials="AL" size="lg" />
          <div>
            <p className="text-sm font-extrabold text-[color:var(--pp-color-forest-text)]">Ana Lukić</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">Vlasnica · Rijeka</p>
            <div className="mt-2 flex items-center gap-1 text-xs font-extrabold text-[color:var(--pp-color-success)]">
              <ShieldCheck className="size-4" aria-hidden /> Verificirano
            </div>
          </div>
        </div>

        <nav aria-label="Owner navigacija" className="mt-5 space-y-2">
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
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-teal-accent)]">Privatnost</p>
          <p className="mt-2 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">Dijeljenje kartona je kontrolirano i vremenski ograničeno.</p>
        </div>
      </Card>
    </aside>
  );
}

function PetIdentityHero() {
  return (
    <Card radius="28" tone="sage" className="relative overflow-hidden p-6 lg:p-7">
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/45" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-[28px] bg-[color:var(--pp-color-orange-primary)] text-5xl shadow-[var(--pp-shadow-button-glow)]">🐶</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-4xl font-black leading-none tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Maks</h2>
              <Badge variant="teal">Aktivan karton</Badge>
            </div>
            <p className="mt-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">Border collie · 2 godine · 18 kg · mikročip 191001000234567</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold text-[color:var(--pp-color-muted-text)]">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-3 py-1.5"><MapPin className="size-3.5" /> Rijeka</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-3 py-1.5"><Stethoscope className="size-3.5" /> Vet Centar Rijeka</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-3 py-1.5"><CalendarDays className="size-3.5" /> ažurirano danas</span>
            </div>
          </div>
        </div>
        <div className="rounded-[var(--pp-radius-card-20)] bg-white/80 p-4 text-center shadow-[var(--pp-shadow-small-card)]">
          <QrCode className="mx-auto size-14 text-[color:var(--pp-color-teal-accent)]" />
          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]">QR pristup</p>
        </div>
      </div>
    </Card>
  );
}

function ActionRail() {
  return (
    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
      <Button className="min-h-14 justify-start" variant="secondary"><Download className="size-4" /> PDF karton</Button>
      <Button className="min-h-14 justify-start" variant="secondary"><Printer className="size-4" /> Ispiši</Button>
      <Button className="min-h-14 justify-start" variant="teal"><Share2 className="size-4" /> Podijeli</Button>
    </div>
  );
}

function VaccinationCard() {
  return (
    <Card radius="28" className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-orange-primary)]">Cijepljenja</p>
          <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Zdravstveni podsjetnici</h2>
        </div>
        <StatusBadge status="soon">2 uskoro</StatusBadge>
      </div>
      <div className="mt-5 space-y-3">
        {vaccinations.map((item) => (
          <div key={item.title} className="flex flex-col gap-3 rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warm-border)] bg-white/78 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--pp-color-info-surface)] text-[color:var(--pp-color-teal-accent)]"><Syringe className="size-5" /></span>
              <div>
                <p className="font-black text-[color:var(--pp-color-forest-text)]">{item.title}</p>
                <p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">{item.meta}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{item.date}</p>
              <StatusBadge status={item.status}>{item.status === 'ok' ? 'Uredno' : 'Termin uskoro'}</StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function HealthCards() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card radius="28" tone="orange" className="p-5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-6 text-[color:var(--pp-color-orange-primary)]" />
          <h2 className="text-2xl font-black text-[color:var(--pp-color-forest-text)]">Alergije</h2>
        </div>
        <div className="mt-5 space-y-3">
          {allergies.map((item) => (
            <div key={item.title} className="rounded-[var(--pp-radius-card-20)] bg-white/78 p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-black text-[color:var(--pp-color-forest-text)]">{item.title}</p><Badge variant="orange">{item.level}</Badge></div>
              <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{item.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card radius="28" tone="teal" className="p-5">
        <div className="flex items-center gap-3">
          <Pill className="size-6 text-[color:var(--pp-color-teal-accent)]" />
          <h2 className="text-2xl font-black text-[color:var(--pp-color-forest-text)]">Terapije</h2>
        </div>
        <div className="mt-5 space-y-3">
          {medications.map((item) => (
            <div key={item.title} className="rounded-[var(--pp-radius-card-20)] bg-white/78 p-4">
              <p className="font-black text-[color:var(--pp-color-forest-text)]">{item.title}</p>
              <p className="mt-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{item.dose} · {item.until}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ContactAndTrust() {
  return (
    <div className="space-y-4">
      <Card radius="28" className="p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-teal-accent)]">Kontakt za hitno</p>
        <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Ana Lukić</h2>
        <div className="mt-4 space-y-3 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
          <p className="flex items-center gap-2"><Phone className="size-4 text-[color:var(--pp-color-orange-primary)]" /> +385 91 000 0000</p>
          <p className="flex items-center gap-2"><Mail className="size-4 text-[color:var(--pp-color-teal-accent)]" /> ana@example.com</p>
          <p className="flex items-center gap-2"><Stethoscope className="size-4 text-[color:var(--pp-color-success)]" /> Vet Centar Rijeka</p>
        </div>
      </Card>
      <Card radius="28" tone="sage" className="p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 size-6 shrink-0 text-[color:var(--pp-color-success)]" />
          <div>
            <h3 className="font-black text-[color:var(--pp-color-forest-text)]">Sigurno dijeljenje</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Ovaj ekran je UI preview. PDF, ispis i dijeljenje nisu spojeni na stvarne zapise bez dodatnog odobrenja.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Timeline() {
  return (
    <Card radius="28" className="p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[color:var(--pp-color-orange-primary)]">Aktivnosti</p>
      <h2 className="mt-1 text-2xl font-black text-[color:var(--pp-color-forest-text)]">Zadnje bilješke</h2>
      <div className="mt-5 space-y-3">
        {timeline.map((item) => (
          <div key={item.title} className="flex gap-3 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-4">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[color:var(--pp-color-teal-accent)] shadow-[var(--pp-shadow-small-card)]">{item.date}</span>
            <div>
              <p className="font-black text-[color:var(--pp-color-forest-text)]">{item.title}</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PetPassportDashboardPage() {
  return (
    <main data-petpark-route="pet-passport" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<Button size="sm"><Sparkles className="size-4" /> Novi ljubimac</Button>} />
      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[640px] hidden scale-110 -rotate-12 lg:block" />
        <PawDecoration className="right-[14%] top-72 hidden xl:flex" />

        <div className="mx-auto max-w-[var(--pp-content-width)]">
          <div className="grid gap-6 lg:grid-cols-[235px_1fr]">
            <OwnerSidebar />
            <div className="order-1 min-w-0 space-y-6 lg:order-none">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_190px]">
                <Card radius="28" className="p-6 lg:p-8">
                  <Badge variant="teal">Pet health hub</Badge>
                  <h1 className="mt-4 max-w-[360px] text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] sm:text-5xl">Pet Passport</h1>
                  <p className="mt-4 max-w-[500px] text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">Digitalni karton za cijepljenja, alergije, terapije i sigurno dijeljenje s čuvalicama, groomerima i veterinarima.</p>
                </Card>
                <ActionRail />
              </div>

              <PetIdentityHero />

              <div className="grid gap-6 xl:grid-cols-[minmax(0,520px)_1fr]">
                <div className="space-y-6">
                  <VaccinationCard />
                  <Timeline />
                </div>
                <div className="space-y-6">
                  <HealthCards />
                  <ContactAndTrust />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card radius="24" tone="sage" className="p-5"><CheckCircle2 className="mb-3 size-5 text-[color:var(--pp-color-success)]" /><p className="text-3xl font-black">8</p><p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">zapisa u kartonu</p></Card>
                <Card radius="24" tone="orange" className="p-5"><HeartPulse className="mb-3 size-5 text-[color:var(--pp-color-orange-primary)]" /><p className="text-3xl font-black">2</p><p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">aktivne napomene</p></Card>
                <Card radius="24" tone="teal" className="p-5"><Share2 className="mb-3 size-5 text-[color:var(--pp-color-teal-accent)]" /><p className="text-3xl font-black">0</p><p className="text-sm font-bold text-[color:var(--pp-color-muted-text)]">aktivnih dijeljenja</p></Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
