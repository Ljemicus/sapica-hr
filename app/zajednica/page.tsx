import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Bookmark,
  Camera,
  CheckCircle2,
  Heart,
  HeartHandshake,
  MapPin,
  MessageCircle,
  PawPrint,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
} from 'lucide-react';
import {
  AppHeader,
  Avatar,
  Badge,
  ButtonLink,
  Card,
  LeafDecoration,
  PawDecoration,
} from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: { absolute: 'Zajednica ljubitelja ljubimaca | PetPark' },
  description: 'PetPark zajednica okuplja vlasnike, sittere, groomere, trenere i sve ljubitelje ljubimaca na jednom mjestu.',
  alternates: {
    canonical: 'https://petpark.hr/zajednica',
  },
};

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/pretraga', label: 'Pretraga' },
  { href: '/forum', label: 'Forum' },
  { href: '/blog', label: 'Blog' },
  { href: '/izgubljeni', label: 'Izgubljeni' },
];

const tabs = [
  { label: 'Sve', href: '/zajednica', icon: Sparkles, active: true },
  { label: 'Forum', href: '/forum', icon: MessageCircle },
  { label: 'Izgubljeni / pronađeni', href: '/izgubljeni', icon: Bell },
  { label: 'Udomljavanje', href: '/udomljavanje', icon: HeartHandshake },
  { label: 'Savjeti', href: '/blog', icon: BookOpen },
];

const posts = [
  {
    author: 'Maja i Roko',
    initials: 'MR',
    category: 'Forum',
    title: 'Kako ste riješili anksioznost kod psa nakon preseljenja?',
    excerpt: 'Roko se nakon preseljenja u novi stan teže opušta kad ostane sam. Tražim praktične savjete i iskustva prije nego krenemo s trenerom.',
    location: 'Zagreb · Trešnjevka',
    href: '/forum',
    tone: 'teal' as const,
    likes: 24,
    comments: 11,
  },
  {
    author: 'Petra',
    initials: 'P',
    category: 'Izgubljeni / pronađeni',
    title: 'Pronađena mlada maca kod parka Mlaka',
    excerpt: 'Maca je pitoma, ima sivu ogrlicu bez privjeska. Trenutno je na sigurnom, molim dijeljenje ako netko zna vlasnika.',
    location: 'Rijeka · Mlaka',
    href: '/izgubljeni',
    tone: 'orange' as const,
    likes: 58,
    comments: 19,
    urgent: true,
  },
  {
    author: 'Udruga Šapice',
    initials: 'UŠ',
    category: 'Udomljavanje',
    title: 'Mila traži miran dom i strpljive ljude',
    excerpt: 'Mila je nježna kujica od dvije godine, cijepljena i socijalizirana. Odlično reagira na mirne šetnje i rutinu.',
    location: 'Osijek',
    href: '/udomljavanje',
    tone: 'sage' as const,
    likes: 41,
    comments: 8,
  },
  {
    author: 'PetPark tim',
    initials: 'PP',
    category: 'Savjeti',
    title: 'Mini vodič: što pripremiti za prvo čuvanje',
    excerpt: 'Hrana, rutina, kontakt veterinara, navike u šetnji i napomena za alergije — mali checklist prije predaje ljubimca sitteru.',
    location: 'Blog',
    href: '/blog',
    tone: 'cream' as const,
    likes: 36,
    comments: 5,
  },
];

const popularTopics = ['prvo čuvanje', 'socijalizacija šteneta', 'grooming preporuke', 'izgubljeni ljubimci', 'udomljavanje mačke'];
const activeMembers = [
  { name: 'Maja', detail: 'savjeti za pse', initials: 'M' },
  { name: 'Dario', detail: 'trener · Rijeka', initials: 'D' },
  { name: 'Ana', detail: 'udomljavanje', initials: 'A' },
];

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: typeof PawPrint }) {
  return (
    <Card radius="24" tone="sage" shadow="small" className="p-5">
      <Icon className="size-5 text-[color:var(--pp-color-orange-primary)]" aria-hidden />
      <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--pp-color-muted-text)]">{label}</p>
    </Card>
  );
}

function PostCard({ post }: { post: (typeof posts)[number] }) {
  return (
    <Link href={post.href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2">
      <Card radius="28" tone={post.tone} interactive className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <Avatar initials={post.initials} alt={post.author} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-black text-[color:var(--pp-color-forest-text)]">{post.author}</p>
              <Badge variant={post.urgent ? 'warning' : 'teal'}>{post.category}</Badge>
              {post.urgent ? <Badge variant="error"><AlertTriangle className="size-3" /> Hitno</Badge> : null}
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] group-hover:text-[color:var(--pp-color-orange-primary)]">{post.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-black text-[color:var(--pp-color-muted-text)]">
              <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {post.location}</span>
              <span className="inline-flex items-center gap-1"><Heart className="size-4" /> {post.likes}</span>
              <span className="inline-flex items-center gap-1"><MessageCircle className="size-4" /> {post.comments}</span>
              <span className="inline-flex items-center gap-1"><Bookmark className="size-4" /> Spremi</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function SidebarCard({ title, icon: Icon, children, tone = 'default' }: { title: string; icon: typeof PawPrint; children: React.ReactNode; tone?: 'default' | 'sage' | 'cream' | 'teal' | 'orange' }) {
  return (
    <Card radius="28" tone={tone} className="p-5">
      <h2 className="flex items-center gap-2 text-lg font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">
        <Icon className="size-5 text-[color:var(--pp-color-orange-primary)]" aria-hidden />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

export default function ZajednicaPage() {
  return (
    <main data-petpark-route="zajednica" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/zajednica/feed" size="sm"><PlusCircle className="size-4" /> Nova objava</ButtonLink>} />

      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[760px] hidden scale-110 -rotate-12 lg:block" />
        <PawDecoration className="right-[12%] top-[360px] hidden size-16 rotate-12 opacity-40 xl:block" />

        <div className="mx-auto max-w-[1500px] space-y-6">
          <Card radius="28" className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="absolute right-8 top-8 hidden size-32 rounded-full bg-[color:var(--pp-color-warning-surface)] lg:block" />
            <div className="relative grid gap-8 xl:grid-cols-[1fr_430px] xl:items-end">
              <div>
                <Badge variant="orange"><UsersRound className="size-3" /> PetPark Community</Badge>
                <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[color:var(--pp-color-forest-text)] sm:text-7xl lg:text-8xl">PetPark zajednica</h1>
                <p className="mt-6 max-w-3xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)] sm:text-lg">
                  Savjeti, objave, izgubljeni ljubimci, udomljavanje i iskustva vlasnika — sve na jednom toplom mjestu.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ButtonLink href="/zajednica/feed" size="lg"><PlusCircle className="size-5" /> Nova objava</ButtonLink>
                  <ButtonLink href="/izgubljeni/prijavi" variant="secondary" size="lg"><Bell className="size-5" /> Prijavi nestanak</ButtonLink>
                  <ButtonLink href="/blog" variant="teal" size="lg"><BookOpen className="size-5" /> Čitaj savjete</ButtonLink>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard value="20+" label="savjeta" icon={BookOpen} />
                <StatCard value="4" label="ulaza" icon={Sparkles} />
                <StatCard value="24/7" label="pomoć" icon={HeartHandshake} />
              </div>
            </div>
          </Card>

          <Card radius="24" className="p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-[var(--pp-radius-control)] px-4 py-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]',
                    tab.active
                      ? 'bg-[color:var(--pp-color-orange-primary)] text-white shadow-[var(--pp-shadow-small-card)]'
                      : 'text-[color:var(--pp-color-muted-text)] hover:bg-[color:var(--pp-color-sage-surface)] hover:text-[color:var(--pp-color-forest-text)]',
                  )}
                >
                  <tab.icon className="size-4" aria-hidden />
                  {tab.label}
                </Link>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <div className="flex flex-col gap-3 rounded-[var(--pp-radius-card-24)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-5 shadow-[var(--pp-shadow-small-card)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]">Aktualno u zajednici</p>
                  <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Objave i preporuke</h2>
                </div>
                <ButtonLink href="/pretraga?category=zajednica" variant="secondary" size="sm"><Search className="size-4" /> Pretraži</ButtonLink>
              </div>

              {posts.map((post) => <PostCard key={post.title} post={post} />)}

              <Card radius="28" tone="sage" className="p-8 text-center">
                <Camera className="mx-auto size-12 text-[color:var(--pp-color-orange-primary)]" aria-hidden />
                <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Feed zajednice se puni postupno.</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
                  Objavljivanje je trenutno UI-first placeholder. Kad odobrimo backend, ovdje ide stvarni feed, komentari i spremanje objava.
                </p>
                <ButtonLink href="/zajednica/feed" className="mt-6" variant="secondary">Pogledaj feed</ButtonLink>
              </Card>
            </div>

            <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
              <SidebarCard title="Popularne teme" icon={Star}>
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map((topic) => <Badge key={topic} variant="sage">#{topic}</Badge>)}
                </div>
              </SidebarCard>

              <SidebarCard title="Aktivni članovi" icon={UsersRound} tone="sage">
                <div className="space-y-3">
                  {activeMembers.map((member) => (
                    <div key={member.name} className="flex items-center gap-3 rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] p-3">
                      <Avatar initials={member.initials} alt={member.name} size="sm" />
                      <div>
                        <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{member.name}</p>
                        <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">{member.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SidebarCard>

              <SidebarCard title="Pravila zajednice" icon={ShieldCheck} tone="cream">
                <ul className="space-y-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--pp-color-success)]" /> Budite konkretni i pristojni.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--pp-color-success)]" /> Ne dijelite tuđe podatke bez dopuštenja.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--pp-color-success)]" /> Hitne slučajeve prvo rješavajte s veterinarom ili policijom.</li>
                </ul>
              </SidebarCard>

              <SidebarCard title="Hitna pomoć zajednice" icon={AlertTriangle} tone="orange">
                <p className="text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Za izgubljenog ljubimca odmah pripremite sliku, lokaciju, kontakt i zadnje vrijeme viđenja.</p>
                <ButtonLink href="/izgubljeni/prijavi" className="mt-5 w-full" variant="primary"><Bell className="size-4" /> Prijavi nestanak</ButtonLink>
              </SidebarCard>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
