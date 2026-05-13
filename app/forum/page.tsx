import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HeartPulse,
  MapPin,
  MessageCircle,
  PawPrint,
  Plane,
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
  Input,
  LeafDecoration,
  PawDecoration,
} from '@/components/shared/petpark/design-foundation';

export function buildForumMetadata(lang: string = 'hr'): Metadata {
  const titles: Record<string, string> = {
    hr: 'Forum za vlasnike ljubimaca | PetPark',
    en: 'Pet Owner Forum | PetPark',
  };

  const descriptions: Record<string, string> = {
    hr: 'PetPark forum okuplja vlasnike ljubimaca za pitanja, savjete, iskustva i rasprave o svakodnevnom životu sa psima i mačkama.',
    en: 'PetPark forum brings pet owners together for questions, advice, experiences, and discussions about everyday life with pets.',
  };

  return {
    title: { absolute: titles[lang] || titles.hr },
    description: descriptions[lang] || descriptions.hr,
    alternates: {
      canonical: lang === 'en' ? 'https://petpark.hr/forum/en' : 'https://petpark.hr/forum',
    },
  };
}

export const metadata: Metadata = buildForumMetadata('hr');

const navItems = [
  { href: '/zajednica', label: 'Zajednica' },
  { href: '/blog', label: 'Savjeti' },
  { href: '/izgubljeni', label: 'Izgubljeni' },
  { href: '/pretraga', label: 'Pretraga' },
];

const categories = [
  { title: 'Savjeti za njegu', icon: PawPrint, href: '/forum?category=njega', topics: 42, replies: 180, latest: 'Kako održavati šape nakon kišnih šetnji?', tone: 'sage' as const },
  { title: 'Obuka i trening', icon: Sparkles, href: '/forum?category=trening', topics: 37, replies: 154, latest: 'Štene grize povodac — što pomaže?', tone: 'orange' as const },
  { title: 'Zdravlje i prehrana', icon: HeartPulse, href: '/forum?category=zdravlje', topics: 58, replies: 221, latest: 'Osjetljiv želudac i prelazak na novu hranu', tone: 'teal' as const },
  { title: 'Putovanja s ljubimcima', icon: Plane, href: '/forum?category=putovanja', topics: 21, replies: 75, latest: 'Trajekt i pas — što pripremiti?', tone: 'cream' as const },
  { title: 'Preporuke usluga', icon: Star, href: '/forum?category=preporuke', topics: 33, replies: 119, latest: 'Grooming za male pasmine u Rijeci', tone: 'sage' as const },
  { title: 'Izgubljeni i pronađeni', icon: MapPin, href: '/izgubljeni', topics: 16, replies: 64, latest: 'Pronađena maca kod parka Mlaka', tone: 'orange' as const },
];

const popularTopics = ['anksioznost psa', 'prehrana mačke', 'prvi sitter', 'grooming cijene', 'putovanje autom'];
const activeMembers = [
  { name: 'Maja', initials: 'M', meta: 'psi · trening' },
  { name: 'Petra', initials: 'P', meta: 'mačke · prehrana' },
  { name: 'Dario', initials: 'D', meta: 'sitter · Rijeka' },
];

export default function ForumPage() {
  return (
    <main data-petpark-route="forum" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/zajednica" size="sm">Zajednica</ButtonLink>} />

      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[740px] hidden scale-110 -rotate-12 lg:block" />
        <PawDecoration className="right-[12%] top-[370px] hidden size-16 rotate-12 opacity-40 xl:block" />

        <div className="mx-auto max-w-[1500px] space-y-6">
          <Card radius="28" className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="absolute right-8 top-8 hidden size-32 rounded-full bg-[color:var(--pp-color-warning-surface)] lg:block" />
            <div className="relative grid gap-8 xl:grid-cols-[1fr_460px] xl:items-end">
              <div>
                <Badge variant="orange"><MessageCircle className="size-3" /> PetPark Forum</Badge>
                <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[color:var(--pp-color-forest-text)] sm:text-7xl lg:text-8xl">Forum za vlasnike ljubimaca</h1>
                <p className="mt-6 max-w-3xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)] sm:text-lg">
                  Pitanja, iskustva i korisne rasprave o životu sa psima, mačkama i drugim ljubimcima.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ButtonLink href="/zajednica" size="lg"><MessageCircle className="size-5" /> Nova tema u zajednici</ButtonLink>
                  <ButtonLink href="/zajednica" variant="secondary" size="lg"><UsersRound className="size-5" /> Pogledaj zajednicu</ButtonLink>
                </div>
              </div>

              <Card radius="28" tone="cream" className="p-4 sm:p-5">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[color:var(--pp-color-teal-accent)]" />
                  <Input placeholder="Pretraži forum..." className="pl-12" />
                </label>
              </Card>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <section className="space-y-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]">Kategorije</p>
                <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Odaberi temu</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link key={category.title} href={category.href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2">
                      <Card radius="28" tone={category.tone} interactive className="h-full p-5">
                        <div className="flex items-start justify-between gap-4">
                          <span className="flex size-14 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-small-card)]">
                            <Icon className="size-6" />
                          </span>
                          <Badge variant="teal">{category.topics} tema</Badge>
                        </div>
                        <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] group-hover:text-[color:var(--pp-color-orange-primary)]">{category.title}</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge variant="sage">{category.replies} odgovora</Badge>
                          <Badge variant="cream">Aktivno danas</Badge>
                        </div>
                        <p className="mt-4 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Zadnje: {category.latest}</p>
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[color:var(--pp-color-orange-primary)]">Otvori temu <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>

            <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
              <Card radius="28" tone="cream" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]"><Sparkles className="size-5 text-[color:var(--pp-color-orange-primary)]" /> Popularne teme</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {popularTopics.map((topic) => <Badge key={topic} variant="sage">#{topic}</Badge>)}
                </div>
              </Card>

              <Card radius="28" tone="sage" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]"><ShieldCheck className="size-5 text-[color:var(--pp-color-teal-accent)]" /> Pravila</h2>
                <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--pp-color-success)]" /> Budite konkretni i pristojni.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--pp-color-success)]" /> Medicinske odluke provjerite s veterinarom.</li>
                  <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--pp-color-success)]" /> Ne dijelite privatne podatke javno.</li>
                </ul>
              </Card>

              <Card radius="28" tone="teal" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]"><UsersRound className="size-5 text-[color:var(--pp-color-teal-accent)]" /> Aktivni članovi</h2>
                <div className="mt-4 space-y-3">
                  {activeMembers.map((member) => (
                    <div key={member.name} className="flex items-center gap-3 rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] p-3 shadow-[var(--pp-shadow-small-card)]">
                      <Avatar initials={member.initials} alt={member.name} size="sm" />
                      <div>
                        <p className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{member.name}</p>
                        <p className="text-xs font-bold text-[color:var(--pp-color-muted-text)]">{member.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card radius="28" tone="orange" className="p-5">
                <BookOpen className="size-6 text-[color:var(--pp-color-orange-primary)]" />
                <h2 className="mt-4 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">Trebaš uređeni vodič?</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Forum je za iskustva, a blog za strukturirane savjete.</p>
                <ButtonLink href="/blog" className="mt-5 w-full" variant="secondary">Otvori blog</ButtonLink>
              </Card>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
