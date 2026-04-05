import type { Metadata } from 'next';
import Link from 'next/link';
import { Scissors, Search, ArrowRight } from 'lucide-react';
import { getTrainers } from '@/lib/db';
import { TrainingContent } from './training-content';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import { InternalLinkSection } from '@/components/shared/internal-link-section';
import { TRAINING_HUB_LINKS, CONTENT_DISCOVERY_LINKS } from '@/lib/seo/internal-links';
import type { TrainingType } from '@/lib/types';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Školovanje pasa — treneri i programi',
  description: 'Pronađite certificirane trenere pasa za školovanje, agility, korekciju ponašanja i rad sa štencima u Hrvatskoj.',
  keywords: ['školovanje pasa', 'trener pasa', 'dresura pasa', 'agility', 'korekcija ponašanja', 'obuka štenaca'],
  openGraph: {
    title: 'Školovanje pasa — treneri i programi | PetPark',
    description: 'Pronađite certificirane trenere pasa za školovanje, agility i korekciju ponašanja.',
    type: 'website',
    ...buildLocaleOpenGraph('/dresura'),
  },
  alternates: buildLocaleAlternates('/dresura'),
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

      <TrainingContent trainers={trainers} initialParams={params} />

      <InternalLinkSection
        eyebrow="Gradovi s ponudom"
        title="Tražite trening u određenom gradu?"
        description="Umjesto novih thin landingica, ovdje vodimo na filtrirane training rute za gradove gdje već postoji realan supply trenera."
        items={[
          ...TRAINING_HUB_LINKS,
          ...CONTENT_DISCOVERY_LINKS,
        ]}
      />

      <section className="py-14 md:py-20 bg-warm-section">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-4 font-semibold">
              Druge usluge
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)]">Istražite druge usluge</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <Link href="/pretraga" className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-white dark:bg-card hover:border-orange-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-500">
                  <Search className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm font-[var(--font-heading)] group-hover:text-orange-500 transition-colors">Čuvanje ljubimaca</h3>
                  <p className="text-xs text-muted-foreground">Pouzdani sitteri u vašem gradu</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
            <Link href="/njega" className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-white dark:bg-card hover:border-pink-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-900/30 text-pink-500">
                  <Scissors className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm font-[var(--font-heading)] group-hover:text-pink-500 transition-colors">Grooming saloni</h3>
                  <p className="text-xs text-muted-foreground">Šišanje, kupanje i njega</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
