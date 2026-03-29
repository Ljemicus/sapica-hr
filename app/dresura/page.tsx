import type { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, Scissors, Search, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getTrainers } from '@/lib/db';
import { TrainingContent } from './training-content';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import type { TrainingType } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Školovanje pasa — treneri i programi',
  description: 'Pronađite certificirane trenere pasa za školovanje, agility, korekciju ponašanja i rad sa štencima u Hrvatskoj.',
  keywords: ['školovanje pasa', 'trener pasa', 'dresura pasa', 'agility', 'korekcija ponašanja', 'obuka štenaca'],
  openGraph: {
    title: 'Školovanje pasa — treneri i programi | PetPark',
    description: 'Pronađite certificirane trenere pasa za školovanje, agility i korekciju ponašanja.',
    url: 'https://petpark.hr/dresura',
    type: 'website',
  },
  alternates: {
    canonical: 'https://petpark.hr/dresura',
  },
};

interface DresuraPageProps {
  searchParams: Promise<{ city?: string; type?: string }>;
}

export default async function DresuraPage({ searchParams }: DresuraPageProps) {
  const params = await searchParams;
  const trainers = await getTrainers({ city: params.city, type: params.type as TrainingType | undefined });

  return (
    <div>
      <ServiceJsonLd
        name="Školovanje pasa"
        description="Pronađite certificirane trenere pasa za školovanje, agility, korekciju ponašanja i rad sa štencima."
        url="https://petpark.hr/dresura"
        serviceType="Dog Training"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      />
      <Breadcrumbs items={[{ label: 'Školovanje pasa', href: '/dresura' }]} />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-indigo-950/20 dark:via-background dark:to-teal-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-0 text-sm px-5 py-2 animate-fade-in-up rounded-full font-semibold">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
              Školovanje pasa i trening
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Profesionalna{' '}
              <span className="text-gradient">školovanje pasa</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 animate-fade-in-up delay-200 leading-relaxed max-w-xl mx-auto">
              Od osnove poslušnosti do agility-ja — pronađite certificirane trenere
              koji koriste pozitivan pristup školovanju pasa.
            </p>
          </div>
        </div>
      </section>

      {/* Video Testimonials Placeholder */}
      <section className="py-10 md:py-14 bg-warm-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-0 rounded-full font-semibold">Testimonijali</Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)]">Što kažu vlasnici</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
            {[
              { name: 'Marko & Rex', desc: 'Agility trening transformirao je Rexovo ponašanje!', color: 'from-indigo-200 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/30' },
              { name: 'Ana & Luna', desc: 'Luna je naučila osnove u samo 4 tjedna.', color: 'from-emerald-200 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/30' },
              { name: 'Petra & Buddy', desc: 'Profesionalan pristup i puno strpljenja.', color: 'from-amber-200 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/30' },
            ].map((item) => (
              <div key={item.name} className={`rounded-2xl bg-gradient-to-br ${item.color} p-6 md:p-8 text-center`}>
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/60 dark:bg-white/10 mx-auto mb-3 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 md:h-10 md:w-10 text-indigo-500 dark:text-indigo-400" />
                </div>
                <p className="font-bold text-sm md:text-base font-[var(--font-heading)]">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1 italic">&ldquo;{item.desc}&rdquo;</p>
                <p className="text-xs text-muted-foreground mt-2">Video uskoro</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrainingContent trainers={trainers} initialParams={params} />

      {/* Cross-links to related services */}
      <section className="py-10 md:py-14 bg-warm-section">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8 font-[var(--font-heading)]">Istražite druge usluge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link href="/pretraga" className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-background hover:border-orange-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                  <Search className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm group-hover:text-orange-500 transition-colors">Čuvanje ljubimaca</h3>
                  <p className="text-xs text-muted-foreground">Pouzdani sitteri u vašem gradu</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
              </div>
            </Link>
            <Link href="/njega" className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-background hover:border-pink-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-500">
                  <Scissors className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm group-hover:text-pink-500 transition-colors">Grooming saloni</h3>
                  <p className="text-xs text-muted-foreground">Šišanje, kupanje i njega</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-pink-500 transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
