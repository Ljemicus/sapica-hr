import type { Metadata } from 'next';
import { Baby } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import { BreedersContent } from './breeders-content';
import { getBreeders } from '@/lib/mock-breeders';

export const metadata: Metadata = {
  title: 'Uzgajivači — Certificirani uzgajivači u Hrvatskoj',
  description: 'Pronađite certificirane uzgajivače pasa i mačaka u Hrvatskoj. Pregledajte uzgajivače s FCI registracijom, dostupne legla i ocjene vlasnika.',
  keywords: ['uzgajivači pasa hrvatska', 'uzgajivač pasa', 'štenci na prodaju', 'uzgajivači mačaka', 'FCI uzgajivač', 'legla štenaca'],
  openGraph: {
    title: 'Uzgajivači — Certificirani uzgajivači | PetPark',
    description: 'Pronađite certificirane uzgajivače pasa i mačaka u Hrvatskoj.',
    url: 'https://petpark.hr/uzgajivacnice',
    type: 'website',
  },
  alternates: {
    canonical: 'https://petpark.hr/uzgajivacnice',
  },
};

interface UzgajivacnicePageProps {
  searchParams: Promise<{ species?: string; city?: string; breed?: string; sort?: string }>;
}

export default async function UzgajivacnicePage({ searchParams }: UzgajivacnicePageProps) {
  const params = await searchParams;
  const breeders = getBreeders(params);

  return (
    <div>
      <ServiceJsonLd
        name="Uzgajivači"
        description="Pronađite certificirane uzgajivače pasa i mačaka u Hrvatskoj."
        url="https://petpark.hr/uzgajivacnice"
        serviceType="Pet Breeder"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Varaždin']}
      />
      <Breadcrumbs items={[{ label: 'Uzgajivači', href: '/uzgajivacnice' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-0 text-sm px-5 py-2 animate-fade-in-up rounded-full font-semibold">
              <Baby className="h-3.5 w-3.5 mr-1.5" />
              Uzgajivači
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              🐾 Pronađite{' '}
              <span className="text-gradient">uzgajivače</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 animate-fade-in-up delay-200 leading-relaxed max-w-xl mx-auto">
              Pronađite certificirane uzgajivače u Hrvatskoj — pregledajte
              dostupna legla, ocjene i certifikate.
            </p>
          </div>
        </div>
      </section>

      <BreedersContent breeders={breeders} initialParams={params} />
    </div>
  );
}
