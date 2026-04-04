import type { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, Scissors, Search, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-indigo-950/20 dark:via-background dark:to-teal-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-0 text-sm px-5 py-2 animate-fade-in-up rounded-full font-semibold">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
              Dog training and behaviour work
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Professional <span className="text-gradient">dog training</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 animate-fade-in-up delay-200 leading-relaxed max-w-xl mx-auto">
              From basic obedience to agility, find certified trainers who use a positive and practical training approach.
            </p>
          </div>
        </div>
      </section>

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

      <section className="py-10 md:py-14 bg-warm-section">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8 font-[var(--font-heading)]">Explore related services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link href="/pretraga" className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-background hover:border-orange-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                  <Search className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm group-hover:text-orange-500 transition-colors">Pet sitting</h3>
                  <p className="text-xs text-muted-foreground">Reliable sitters in your city</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
              </div>
            </Link>
            <Link href="/njega/en" className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-background hover:border-pink-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-500">
                  <Scissors className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm group-hover:text-pink-500 transition-colors">Grooming salons</h3>
                  <p className="text-xs text-muted-foreground">Haircuts, baths, and coat care</p>
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
