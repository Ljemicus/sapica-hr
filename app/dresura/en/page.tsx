import type { Metadata } from 'next';
import Link from 'next/link';
import { Scissors, Search, ArrowRight } from 'lucide-react';
import { getTrainers } from '@/lib/db';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import { InternalLinkSection } from '@/components/shared/internal-link-section';
import { TRAINING_HUB_LINKS, CONTENT_DISCOVERY_LINKS } from '@/lib/seo/internal-links';
import type { TrainingType } from '@/lib/types';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { TrainingContent } from '../training-content';

export const metadata: Metadata = {
  title: 'Dog training — trainers and programmes',
  description: 'Find certified dog trainers in Croatia for obedience, agility, behaviour work, and puppy training.',
  keywords: ['dog training croatia', 'dog trainer croatia', 'puppy training croatia', 'agility trainer croatia', 'behaviour training dog'],
  openGraph: {
    title: 'Dog training — trainers and programmes | PetPark',
    description: 'Find certified dog trainers in Croatia for obedience, agility, and behaviour work.',
    type: 'website',
    ...buildLocaleOpenGraph('/dresura/en'),
  },
  alternates: buildLocaleAlternates('/dresura/en'),
};

interface DresuraEnPageProps {
  searchParams: Promise<{ city?: string; type?: string }>;
}

export default async function DresuraEnPage({ searchParams }: DresuraEnPageProps) {
  const params = await searchParams;
  const trainers = await getTrainers({ city: params.city, type: params.type as TrainingType | undefined });

  return (
    <div>
      <ServiceJsonLd
        name="Dog training"
        description="Find certified dog trainers in Croatia for obedience, agility, behaviour work, and puppy training."
        url="https://petpark.hr/dresura/en"
        serviceType="Dog Training"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      />
      <Breadcrumbs items={[{ label: 'Dog training', href: '/dresura/en' }]} />

      <TrainingContent trainers={trainers} initialParams={params} />

      <InternalLinkSection
        eyebrow="Cities with supply"
        title="Looking for a trainer in a specific city?"
        description="Instead of spinning up thin landing pages, we route people to filtered training results only where there is real trainer supply."
        items={[
          ...TRAINING_HUB_LINKS,
          ...CONTENT_DISCOVERY_LINKS,
        ]}
      />

      <section className="py-14 md:py-20 bg-warm-section">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-4 font-semibold">
              Related services
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)]">Explore related services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <Link href="/pretraga" className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-white dark:bg-card hover:border-orange-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-500">
                  <Search className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm font-[var(--font-heading)] group-hover:text-orange-500 transition-colors">Pet sitting</h3>
                  <p className="text-xs text-muted-foreground">Reliable sitters in your city</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
            <Link href="/njega/en" className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-white dark:bg-card hover:border-pink-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-900/30 text-pink-500">
                  <Scissors className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm font-[var(--font-heading)] group-hover:text-pink-500 transition-colors">Grooming salons</h3>
                  <p className="text-xs text-muted-foreground">Haircuts, baths, and coat care</p>
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
