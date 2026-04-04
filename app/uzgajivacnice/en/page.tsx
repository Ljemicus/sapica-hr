import type { Metadata } from 'next';
import { Baby } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import { BreedersContent } from '../breeders-content';
import { getBreeders } from '@/lib/db/breeders';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Breeders — Certified dog and cat breeders in Croatia',
  description: 'Find certified dog and cat breeders in Croatia. Browse breeder profiles with FCI registration, available litters, and owner ratings.',
  keywords: ['dog breeders croatia', 'cat breeders croatia', 'puppies for sale croatia', 'fci breeder croatia', 'kittens for sale croatia'],
  openGraph: {
    title: 'Breeders — Certified breeders | PetPark',
    description: 'Find certified dog and cat breeders in Croatia.',
    type: 'website',
    ...buildLocaleOpenGraph('/uzgajivacnice/en'),
  },
  alternates: buildLocaleAlternates('/uzgajivacnice/en'),
};

interface BreedersEnPageProps {
  searchParams: Promise<{ species?: string; city?: string; breed?: string; sort?: string }>;
}

export default async function BreedersEnPage({ searchParams }: BreedersEnPageProps) {
  const params = await searchParams;
  const breeders = await getBreeders(params);

  return (
    <div>
      <ServiceJsonLd
        name="Breeders"
        description="Find certified dog and cat breeders in Croatia."
        url="https://petpark.hr/uzgajivacnice/en"
        serviceType="Pet Breeder"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Varaždin']}
      />
      <Breadcrumbs items={[{ label: 'Breeders', href: '/uzgajivacnice/en' }]} />

      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-5 animate-fade-in-up">
              <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-0 text-sm px-5 py-2 rounded-full font-semibold">
                <Baby className="h-3.5 w-3.5 mr-1.5" />
                Breeders
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Find <span className="text-gradient">breeders</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 animate-fade-in-up delay-200 leading-relaxed max-w-xl mx-auto">
              Browse dog and cat breeders in Croatia, compare profiles, and quickly find the right contact for your next companion.
            </p>
          </div>
        </div>
      </section>

      <BreedersContent breeders={breeders} initialParams={params} />
    </div>
  );
}
