import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Camera, Crown, HeartHandshake, MessageCircle, Sparkles, UsersRound } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: { absolute: 'Zajednica ljubitelja ljubimaca | PetPark' },
  description: 'PetPark zajednica okuplja vlasnike, sittere, groomere, trenere i sve ljubitelje ljubimaca na jednom mjestu.',
  alternates: {
    canonical: 'https://petpark.hr/zajednica',
  },
};

const sections = [
  {
    eyebrow: 'Magazin',
    title: 'Savjeti i priče',
    description: 'Članci o zdravlju, prehrani, ponašanju i svakodnevici s ljubimcima.',
    href: '/blog',
    icon: BookOpen,
    tone: 'from-orange-500 to-amber-500',
  },
  {
    eyebrow: 'Objave',
    title: 'Feed zajednice',
    description: 'Fotke, iskustva i novosti iz PetPark zajednice — kad želiš vidjeti što rade drugi vlasnici.',
    href: '/zajednica/feed',
    icon: Camera,
    tone: 'from-teal-500 to-cyan-500',
  },
  {
    eyebrow: 'Aktivnosti',
    title: 'Izazovi',
    description: 'Lagane aktivnosti i teme za ljubimce i vlasnike. Otvaramo ih postupno kako zajednica raste.',
    href: '/zajednica/izazovi',
    cta: 'Pogledaj status',
    icon: Sparkles,
    tone: 'from-purple-500 to-pink-500',
  },
  {
    eyebrow: 'Istaknuto',
    title: 'Najbolji ljubimci',
    description: 'Prostor za favorite zajednice i objave koje vrijedi istaknuti, bez obećanja nagrada ili posebnih pogodnosti.',
    href: '/zajednica/najbolji',
    cta: 'Saznaj više',
    icon: Crown,
    tone: 'from-yellow-500 to-orange-500',
  },
];

const stats = [
  { label: 'članci i vodiči', value: '20+' },
  { label: 'teme zajednice', value: '4' },
  { label: 'jedan PetPark', value: 'sve' },
];

export default function ZajednicaPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Zajednica', href: '/zajednica' }]} />
      <div className="min-h-screen overflow-x-clip bg-background">
        <section className="relative overflow-hidden organizations-hero-gradient">
          <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
          <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-warm-orange/15 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-warm-teal/15 blur-3xl" />

          <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 relative">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div className="max-w-3xl animate-fade-in-up">
                <p className="section-kicker mb-5">PetPark Community</p>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-[var(--font-heading)] tracking-tight leading-[1.05] mb-6">
                  Zajednica za ljude koji žive s ljubimcima
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  Savjeti, priče, fotke, izgubljeni ljubimci i mali rituali koji čine život s psima i mačkama jednostavnijim.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link href="/blog">
                    <Button size="lg" className="h-12 rounded-full bg-warm-orange px-7 text-white hover:bg-warm-orange/90">
                      Čitaj savjete
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/izgubljeni">
                    <Button size="lg" variant="outline" className="h-12 rounded-full border-warm-orange/30 px-7 text-warm-orange hover:bg-warm-orange/5">
                      Izgubljeni ljubimci
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="community-section-card p-5 md:p-6 animate-fade-in-up delay-200">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-orange/10 text-warm-orange">
                    <HeartHandshake className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold font-[var(--font-heading)]">Što je ovdje?</p>
                    <p className="text-sm text-muted-foreground">Praktičan community hub, bez buke.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-muted/50 p-4 text-center">
                      <div className="text-2xl font-extrabold font-[var(--font-heading)] text-foreground">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker mb-3">Ulazi u zajednicu</p>
              <h2 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)] tracking-tight">Odaberi što ti treba danas</h2>
            </div>
            <p className="max-w-md text-muted-foreground">Magazine-style početna za sadržaj, objave i korisne community akcije.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {sections.map((section, index) => (
              <Link
                key={section.href}
                href={section.href}
                className="community-section-card group overflow-hidden p-6 md:p-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-orange animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 90, 360)}ms` }}
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-warm-orange mb-3">{section.eyebrow}</p>
                    <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] tracking-tight mb-3 group-hover:text-warm-orange transition-colors">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{section.description}</p>
                  </div>
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${section.tone} text-white shadow-sm`}>
                    <section.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-warm-orange">
                  {section.cta ?? 'Otvori'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 md:px-10 lg:px-16 pb-16 md:pb-20">
          <div className="appeal-card p-8 md:p-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="section-kicker mb-3">Hitno i korisno</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] mb-3">Zajednica najviše vrijedi kad netko treba pomoć.</h2>
              <p className="text-muted-foreground max-w-2xl">Ako je ljubimac nestao, kreni s oglasom i dijeljenjem. Ako tražiš savjet, blog je najbrži ulaz.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/izgubljeni/prijavi">
                <Button className="h-12 rounded-full bg-rose-600 px-6 text-white hover:bg-rose-700">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Prijavi nestanak
                </Button>
              </Link>
              <Link href="/zajednica/feed">
                <Button variant="outline" className="h-12 rounded-full px-6">
                  <UsersRound className="mr-2 h-4 w-4" />
                  Feed
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
