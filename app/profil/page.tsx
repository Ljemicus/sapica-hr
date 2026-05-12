import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Dog,
  FileText,
  Heart,
  Home,
  Languages,
  Mail,
  MapPin,
  MessageCircle,
  PawPrint,
  Phone,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from 'lucide-react';
import {
  AppHeader,
  Avatar,
  Badge,
  ButtonLink,
  Card,
  Input,
  LeafDecoration,
  PawDecoration,
  Rating,
  Select,
} from '@/components/shared/petpark/design-foundation';
import { getAuthUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Profil | PetPark',
  description: 'PetPark profil, ljubimci, usluge, Pet Passport i pregled računa.',
};

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/kalendar', label: 'Kalendar' },
  { href: '/poruke', label: 'Poruke' },
  { href: '/pet-passport', label: 'Pet Passport' },
];

const sidebarItems = [
  { label: 'Pregled', icon: Home, href: '/moje-usluge' },
  { label: 'Profil', icon: UserRound, href: '/profil', active: true },
  { label: 'Poruke', icon: MessageCircle, href: '/poruke' },
  { label: 'Kalendar', icon: CalendarDays, href: '/kalendar' },
  { label: 'Postavke', icon: Settings, href: '/dashboard/postavke' },
];

const tabs = [
  { label: 'Profil', href: '/profil', active: true },
  { label: 'Moji ljubimci', href: '/pet-passport' },
  { label: 'Moje usluge', href: '/moje-usluge' },
  { label: 'Pet Passport', href: '/pet-passport/pdf' },
  { label: 'Postavke', href: '/dashboard/postavke' },
];

const pets = [
  {
    name: 'Luna',
    species: 'Pas · Lagotto romagnolo',
    note: 'Mikročip potvrđen · cijepljenje ažurno',
    status: 'Passport spreman',
    tone: 'teal' as const,
  },
  {
    name: 'Milo',
    species: 'Mačka · Europska kratkodlaka',
    note: 'Nedostaje zadnja kontrola parazita',
    status: 'Dopuniti karton',
    tone: 'orange' as const,
  },
];

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function memberYear(createdAt?: string | null) {
  if (!createdAt) return '2026.';
  return `${new Date(createdAt).getFullYear()}.`;
}

function StatCard({ label, value, helper, icon: Icon, tone = 'sage' }: {
  label: string;
  value: string;
  helper: string;
  icon: typeof PawPrint;
  tone?: 'sage' | 'teal' | 'orange' | 'cream';
}) {
  return (
    <Card radius="24" tone={tone} shadow="small" className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">{value}</p>
          <p className="mt-1 text-xs font-bold text-[color:var(--pp-color-muted-text)]">{helper}</p>
        </div>
        <span className="flex size-12 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-small-card)]">
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </Card>
  );
}

function DashboardSidebar() {
  return (
    <aside className="hidden xl:block">
      <Card radius="28" className="sticky top-28 p-4">
        <div className="flex items-center gap-3 rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-sage-surface)] p-3">
          <Avatar initials="PP" alt="PetPark" size="md" />
          <div>
            <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Profil centar</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">Identitet i ljubimci</p>
          </div>
        </div>
        <nav aria-label="Profil navigacija" className="mt-5 space-y-2">
          {sidebarItems.map((item) => (
            <ButtonLink
              href={item.href}
              key={item.label}
              variant={item.active ? 'primary' : 'ghost'}
              size="md"
              className="w-full justify-start"
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </ButtonLink>
          ))}
        </nav>
      </Card>
    </aside>
  );
}

function ProfilePreviewCard({ name, city }: { name: string; city: string }) {
  return (
    <Card radius="28" className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="teal"><Sparkles className="size-3" /> Javni prikaz</Badge>
          <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Kako vas drugi vide</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
            Sažetak koji se može koristiti za upite, recenzije i javne provider kartice.
          </p>
        </div>
        <Avatar initials={initials(name)} alt={name} size="lg" />
      </div>
      <div className="mt-6 rounded-[var(--pp-radius-card-24)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-cream-surface)] p-5">
        <div className="flex items-start gap-4">
          <Avatar initials={initials(name)} alt={name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-[color:var(--pp-color-forest-text)]">{name}</h3>
              <Badge variant="success"><ShieldCheck className="size-3" /> Verificirano</Badge>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]"><MapPin className="size-4" /> {city}, Hrvatska</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Rating value={4.9} count={24} />
              <span className="text-xs font-black text-[color:var(--pp-color-teal-accent)]">Odgovara brzo</span>
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
              Voli jasne dogovore, sigurnu komunikaciju i redovite updateove o ljubimcima.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default async function ProfilePage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fprofil');

  const displayName = user.name || 'Lana Petrović';
  const email = user.email || 'lana@petpark.hr';
  const city = user.city || 'Zagreb';
  const phone = user.phone || '+385 91 000 0000';
  const roleLabel = user.role === 'sitter' ? 'Provider' : user.role === 'admin' ? 'Admin' : 'Vlasnik ljubimca';

  return (
    <main data-petpark-route="profil" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/dashboard/postavke" size="sm">Postavke</ButtonLink>} />

      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[700px] hidden scale-110 -rotate-12 lg:block" />
        <PawDecoration className="right-[12%] top-[360px] hidden size-16 rotate-12 opacity-40 xl:block" />

        <div className="mx-auto grid max-w-[1500px] gap-6 xl:grid-cols-[260px_1fr]">
          <DashboardSidebar />

          <div className="space-y-6">
            <Card radius="28" className="relative overflow-hidden p-6 sm:p-8">
              <div className="absolute right-8 top-8 hidden size-28 rounded-full bg-[color:var(--pp-color-warning-surface)] lg:block" />
              <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <Avatar initials={initials(displayName)} alt={displayName} size="lg" className="size-24 text-2xl" />
                  <div>
                    <Badge variant="teal"><ShieldCheck className="size-3" /> Verificirano</Badge>
                    <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] sm:text-6xl">{displayName}</h1>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
                      <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {city}, Hrvatska</span>
                      <span>Član od {memberYear(user.created_at)}</span>
                      <span className="inline-flex items-center gap-1"><Star className="size-4 fill-[color:var(--pp-color-orange-primary)] text-[color:var(--pp-color-orange-primary)]" /> 4.9</span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge variant="success">Verificirano</Badge>
                      <Badge variant="orange">{roleLabel}</Badge>
                      <Badge variant="teal">Vlasnik ljubimca</Badge>
                    </div>
                  </div>
                </div>
                <ButtonLink href="/dashboard/profile" size="lg"><UserRound className="size-5" /> Uredi profil</ButtonLink>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Ljubimci" value="2" helper="u Pet Passportu" icon={PawPrint} tone="sage" />
              <StatCard label="Aktivne usluge" value="3" helper="objavljene ponude" icon={Sparkles} tone="orange" />
              <StatCard label="Rezervacije" value="12" helper="zadnjih 90 dana" icon={CalendarDays} tone="teal" />
              <StatCard label="Recenzije" value="24" helper="prosjek 4.9" icon={Star} tone="cream" />
            </div>

            <Card radius="24" className="p-3">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    className={cn(
                      'rounded-[var(--pp-radius-control)] px-4 py-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]',
                      tab.active
                        ? 'bg-[color:var(--pp-color-orange-primary)] text-white shadow-[var(--pp-shadow-small-card)]'
                        : 'text-[color:var(--pp-color-muted-text)] hover:bg-[color:var(--pp-color-sage-surface)] hover:text-[color:var(--pp-color-forest-text)]',
                    )}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
              <div className="space-y-6">
                <Card radius="28" className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Badge variant="orange"><FileText className="size-3" /> Profil</Badge>
                      <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Pregled podataka</h2>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
                        UI preview profila — promjene se još ne spremaju u ovom prolazu.
                      </p>
                    </div>
                    <Badge variant="sage">Samo pregled</Badge>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="flex items-center gap-2 text-sm font-black text-[color:var(--pp-color-forest-text)]"><UserRound className="size-4" /> Ime za prikaz</span>
                      <Input readOnly value={displayName} />
                    </label>
                    <label className="space-y-2">
                      <span className="flex items-center gap-2 text-sm font-black text-[color:var(--pp-color-forest-text)]"><Mail className="size-4" /> Email</span>
                      <Input readOnly value={email} />
                    </label>
                    <label className="space-y-2">
                      <span className="flex items-center gap-2 text-sm font-black text-[color:var(--pp-color-forest-text)]"><Phone className="size-4" /> Telefon</span>
                      <Input readOnly value={phone} />
                    </label>
                    <label className="space-y-2">
                      <span className="flex items-center gap-2 text-sm font-black text-[color:var(--pp-color-forest-text)]"><MapPin className="size-4" /> Grad</span>
                      <Input readOnly value={city} />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                      <span className="flex items-center gap-2 text-sm font-black text-[color:var(--pp-color-forest-text)]"><Heart className="size-4" /> Kratki bio</span>
                      <textarea
                        readOnly
                        rows={4}
                        value="Volim jasne dogovore, redovite updateove i sigurne PetPark rezervacije. Profil je spreman za vlasničke i provider tokove."
                        className="w-full resize-none rounded-[var(--pp-radius-control)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] px-4 py-4 text-sm font-semibold leading-7 text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)] outline-none"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="flex items-center gap-2 text-sm font-black text-[color:var(--pp-color-forest-text)]"><Languages className="size-4" /> Preferirani jezik</span>
                      <Select value="Hrvatski" disabled>
                        <option>Hrvatski</option>
                      </Select>
                    </label>
                  </div>
                </Card>

                <Card radius="28" className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant="teal"><Dog className="size-3" /> Moji ljubimci</Badge>
                      <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Pet Passport sažetak</h2>
                    </div>
                    <ButtonLink href="/pet-passport" variant="secondary" size="sm">Otvori</ButtonLink>
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {pets.map((pet) => (
                      <Link
                        href="/pet-passport"
                        key={pet.name}
                        className="group rounded-[var(--pp-radius-card-24)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-4 shadow-[var(--pp-shadow-small-card)] transition hover:-translate-y-0.5 hover:border-[color:var(--pp-color-teal-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex size-12 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-teal-accent)]">
                            <PawPrint className="size-5" aria-hidden />
                          </span>
                          <Badge variant={pet.tone}>{pet.status}</Badge>
                        </div>
                        <h3 className="mt-4 text-lg font-black text-[color:var(--pp-color-forest-text)]">{pet.name}</h3>
                        <p className="mt-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{pet.species}</p>
                        <p className="mt-3 text-xs font-semibold leading-5 text-[color:var(--pp-color-muted-text)]">{pet.note}</p>
                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-[color:var(--pp-color-orange-primary)]">
                          Pet Passport <ChevronRight className="size-4 transition group-hover:translate-x-1" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <ProfilePreviewCard name={displayName} city={city} />
                <Card tone="orange" radius="28" className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-small-card)]">
                      <Bell className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h2 className="text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Sljedeći korak</h2>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
                        Nakon UI prolaza možemo spojiti stvarno uređivanje profila i postavke bez promjene schema modela.
                      </p>
                      <ButtonLink href="/dashboard/profile" className="mt-5" variant="secondary" size="md">Stari edit profil</ButtonLink>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
