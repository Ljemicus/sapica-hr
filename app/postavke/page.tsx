import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CreditCard,
  Eye,
  FileText,
  Globe2,
  Home,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
} from 'lucide-react';
import {
  AppHeader,
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  Input,
  LeafDecoration,
  PawDecoration,
  Select,
} from '@/components/shared/petpark/design-foundation';
import { getAuthUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Postavke | PetPark',
  description: 'PetPark postavke računa, sigurnosti, privatnosti, obavijesti i plaćanja.',
};

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/profil', label: 'Profil' },
  { href: '/poruke', label: 'Poruke' },
  { href: '/pet-passport', label: 'Pet Passport' },
];

const dashboardNav = [
  { label: 'Pregled', icon: Home, href: '/moje-usluge' },
  { label: 'Profil', icon: UserRound, href: '/profil' },
  { label: 'Poruke', icon: MessageCircle, href: '/poruke' },
  { label: 'Kalendar', icon: CalendarDays, href: '/kalendar' },
  { label: 'Postavke', icon: ShieldCheck, href: '/postavke', active: true },
];

const settingSections = [
  { id: 'opcenito', label: 'Općenito', icon: UserRound },
  { id: 'sigurnost', label: 'Sigurnost', icon: LockKeyhole },
  { id: 'obavijesti', label: 'Obavijesti', icon: Bell },
  { id: 'privatnost', label: 'Privatnost', icon: Eye },
  { id: 'placanja', label: 'Plaćanja', icon: CreditCard },
  { id: 'brisanje', label: 'Brisanje računa', icon: Trash2 },
];

const notificationRows = [
  ['Email poruke', 'Obavijesti kad primite novu poruku u PetPark inboxu.', true],
  ['Ažuriranja rezervacija', 'Potvrde, promjene termina i podsjetnici za dogovorene usluge.', true],
  ['Izgubljeno / pronađeno', 'Upozorenja za izgubljene ljubimce u odabranom području.', true],
  ['Odgovori zajednice', 'Forum, komentari i korisni odgovori na vaše objave.', false],
  ['Podsjetnik prije rezervacije', 'Kratki podsjetnik prije početka usluge ili termina.', true],
] as const;

const privacyRows = [
  ['Javni profil', 'Dopusti vlasnicima i providerima da vide osnovni profil.', true],
  ['Telefon tek nakon rezervacije', 'Broj telefona se dijeli samo nakon potvrđenog dogovora.', true],
  ['Pet Passport sažetak', 'Provider može vidjeti osnovni zdravstveni sažetak ljubimca.', false],
] as const;

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function SettingsSidebar() {
  return (
    <aside className="hidden xl:block">
      <Card radius="28" className="sticky top-28 p-4">
        <div className="flex items-center gap-3 rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-sage-surface)] p-3">
          <Avatar initials="PP" alt="PetPark" size="md" />
          <div>
            <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Postavke</p>
            <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">Račun i sigurnost</p>
          </div>
        </div>
        <nav aria-label="Dashboard navigacija" className="mt-5 space-y-2">
          {dashboardNav.map((item) => (
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

function SectionNav() {
  return (
    <Card radius="24" className="p-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {settingSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              'flex items-center justify-center gap-2 rounded-[var(--pp-radius-control)] px-3 py-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]',
              section.id === 'opcenito'
                ? 'bg-[color:var(--pp-color-orange-primary)] text-white shadow-[var(--pp-shadow-small-card)]'
                : 'text-[color:var(--pp-color-muted-text)] hover:bg-[color:var(--pp-color-sage-surface)] hover:text-[color:var(--pp-color-forest-text)]',
            )}
          >
            <section.icon className="size-4" aria-hidden />
            {section.label}
          </a>
        ))}
      </div>
    </Card>
  );
}

function ToggleRow({ title, description, enabled }: { title: string; description: string; enabled: boolean }) {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--pp-radius-card-24)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{title}</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-[color:var(--pp-color-muted-text)]">{description}</p>
      </div>
      <button
        type="button"
        aria-pressed={enabled}
        disabled
        className={cn(
          'relative h-8 w-14 shrink-0 rounded-full border transition',
          enabled
            ? 'border-[color:var(--pp-color-teal-accent)] bg-[color:var(--pp-color-teal-accent)]'
            : 'border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-sage-surface)]',
        )}
      >
        <span className={cn('absolute top-1 size-6 rounded-full bg-white shadow-[var(--pp-shadow-small-card)] transition', enabled ? 'left-7' : 'left-1')} />
      </button>
    </div>
  );
}

function SettingsCard({ id, badge, title, description, icon: Icon, children, tone = 'default' }: {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: typeof UserRound;
  children: React.ReactNode;
  tone?: 'default' | 'sage' | 'cream' | 'teal' | 'orange';
}) {
  return (
    <Card id={id} radius="28" tone={tone} className="scroll-mt-28 p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="teal"><Icon className="size-3" /> {badge}</Badge>
          <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{description}</p>
        </div>
        <Badge variant="sage">UI preview</Badge>
      </div>
      <div className="mt-6">{children}</div>
    </Card>
  );
}

export default async function SettingsPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fpostavke');

  const displayName = user.name || 'Lana Petrović';
  const email = user.email || 'lana@petpark.hr';
  const city = user.city || 'Zagreb';
  const phone = user.phone || '+385 91 000 0000';

  return (
    <main data-petpark-route="postavke" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/profil" size="sm">Profil</ButtonLink>} />

      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[820px] hidden scale-110 -rotate-12 lg:block" />
        <PawDecoration className="right-[13%] top-[380px] hidden size-16 rotate-12 opacity-40 xl:block" />

        <div className="mx-auto grid max-w-[1500px] gap-6 xl:grid-cols-[260px_1fr]">
          <SettingsSidebar />

          <div className="space-y-6">
            <Card radius="28" className="relative overflow-hidden p-6 sm:p-8">
              <div className="absolute right-8 top-8 hidden size-28 rounded-full bg-[color:var(--pp-color-warning-surface)] lg:block" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <Avatar initials={initials(displayName)} alt={displayName} size="lg" className="size-20 text-xl" />
                  <div>
                    <Badge variant="orange"><ShieldCheck className="size-3" /> Račun · sigurnost · privatnost</Badge>
                    <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] sm:text-6xl">Postavke</h1>
                    <p className="mt-4 max-w-[740px] text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">
                      Upravljajte profilom, sigurnošću, obavijestima, privatnošću i preferencama plaćanja na jednom mjestu.
                    </p>
                  </div>
                </div>
                <Button disabled size="lg"><ShieldCheck className="size-5" /> Spremi promjene</Button>
              </div>
            </Card>

            <SectionNav />

            <SettingsCard id="opcenito" badge="Općenito" title="Osnovni podaci" description="Pregled kontakt podataka i jezika. Spremanje je isključeno dok ne odobrimo backend writeove." icon={UserRound}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-sm font-black"><UserRound className="size-4" /> Ime</span>
                  <Input readOnly value={displayName} />
                </label>
                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-sm font-black"><Mail className="size-4" /> Email</span>
                  <Input readOnly value={email} />
                </label>
                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-sm font-black"><Phone className="size-4" /> Telefon</span>
                  <Input readOnly value={phone} />
                </label>
                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-sm font-black"><MapPin className="size-4" /> Grad</span>
                  <Input readOnly value={city} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="flex items-center gap-2 text-sm font-black"><Globe2 className="size-4" /> Jezik</span>
                  <Select value="Hrvatski" disabled>
                    <option>Hrvatski</option>
                  </Select>
                </label>
              </div>
            </SettingsCard>

            <SettingsCard id="sigurnost" badge="Sigurnost" title="Lozinka i pristup" description="Placeholder za sigurnosne akcije bez promjene auth konfiguracije." icon={LockKeyhole} tone="sage">
              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  ['Promjena lozinke', 'Pošaljite siguran link za promjenu lozinke.', KeyRound],
                  ['Dvofaktorska zaštita', 'Priprema za dodatnu provjeru identiteta.', ShieldCheck],
                  ['Aktivne sesije', 'Pregled uređaja koji imaju pristup računu.', Smartphone],
                ].map(([title, description, Icon]) => (
                  <Card key={title as string} radius="24" shadow="small" className="p-5">
                    <Icon className="size-6 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                    <h3 className="mt-4 text-lg font-black text-[color:var(--pp-color-forest-text)]">{title as string}</h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{description as string}</p>
                    <Button disabled variant="secondary" size="sm" className="mt-5">Uskoro</Button>
                  </Card>
                ))}
              </div>
            </SettingsCard>

            <SettingsCard id="obavijesti" badge="Obavijesti" title="Što želite primati" description="Email, rezervacije, izgubljeni ljubimci i community podsjetnici — bez stvarnog slanja u ovom prolazu." icon={Bell}>
              <div className="space-y-3">
                {notificationRows.map(([title, description, enabled]) => (
                  <ToggleRow key={title} title={title} description={description} enabled={enabled} />
                ))}
              </div>
            </SettingsCard>

            <SettingsCard id="privatnost" badge="Privatnost" title="Kontrola vidljivosti" description="Odaberite što drugi korisnici smiju vidjeti prije i poslije rezervacije." icon={Eye} tone="cream">
              <div className="space-y-3">
                {privacyRows.map(([title, description, enabled]) => (
                  <ToggleRow key={title} title={title} description={description} enabled={enabled} />
                ))}
              </div>
            </SettingsCard>

            <SettingsCard id="placanja" badge="Plaćanja" title="Isplate i računi" description="Pregled budućih provider isplata i računa. Ne diramo stvarnu Stripe konfiguraciju u ovom passu." icon={CreditCard}>
              <div className="grid gap-4 md:grid-cols-2">
                <Card radius="24" tone="sage" shadow="small" className="p-5">
                  <CreditCard className="size-6 text-[color:var(--pp-color-orange-primary)]" aria-hidden />
                  <h3 className="mt-4 text-lg font-black text-[color:var(--pp-color-forest-text)]">Payout račun</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Placeholder za provider isplate bez povezivanja s produkcijskim Stripeom.</p>
                  <Badge variant="orange" className="mt-5">Nije spojeno</Badge>
                </Card>
                <Card radius="24" tone="sage" shadow="small" className="p-5">
                  <FileText className="size-6 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                  <h3 className="mt-4 text-lg font-black text-[color:var(--pp-color-forest-text)]">Računi i potvrde</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Mjesto za budući pregled računa, potvrda i poreznih dokumenata.</p>
                  <Button disabled variant="secondary" size="sm" className="mt-5">Uskoro</Button>
                </Card>
              </div>
            </SettingsCard>

            <SettingsCard id="brisanje" badge="Brisanje računa" title="Opasna zona" description="Akcije su prikazane samo kao UI preview. Nema deaktivacije ni brisanja podataka u ovom prolazu." icon={AlertTriangle} tone="orange">
              <div className="grid gap-4 md:grid-cols-2">
                <Card radius="24" shadow="small" className="border-[color:var(--pp-color-warning)] p-5">
                  <h3 className="text-lg font-black text-[color:var(--pp-color-forest-text)]">Deaktiviraj račun</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Privremeno sakrij profil i zaustavi nove upite.</p>
                  <Button disabled variant="secondary" size="sm" className="mt-5">Deaktiviraj račun</Button>
                </Card>
                <Card radius="24" shadow="small" className="border-[color:var(--pp-color-error)] p-5">
                  <h3 className="text-lg font-black text-[color:var(--pp-color-forest-text)]">Zatraži brisanje podataka</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Zahtjev za GDPR brisanje mora proći ručnu potvrdu.</p>
                  <Button disabled variant="danger" size="sm" className="mt-5"><Trash2 className="size-4" /> Zatraži brisanje</Button>
                </Card>
              </div>
            </SettingsCard>
          </div>
        </div>
      </section>
    </main>
  );
}
