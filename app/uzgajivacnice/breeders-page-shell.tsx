import { Baby } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DiscoveryPageShell } from '@/components/shared/discovery-page-shell';
import { BreedersContent } from './breeders-content';
import { getBreeders } from '@/lib/db/breeders';

export type BreedersPageLocale = 'hr' | 'en';

const BREEDERS_COPY = {
  hr: {
    breadcrumbLabel: 'Uzgajivači',
    jsonLdName: 'Uzgajivači',
    jsonLdDescription: 'Pronađite certificirane uzgajivače pasa i mačaka u Hrvatskoj.',
    pathname: '/uzgajivacnice',
    badge: 'Uzgajivači',
    titlePrefix: 'Pronađite',
    titleHighlight: 'uzgajivače',
    description:
      'Pregledajte uzgajivače pasa i mačaka u Hrvatskoj, usporedite profile i brzo pronađite kontakt koji vam odgovara.',
  },
  en: {
    breadcrumbLabel: 'Breeders',
    jsonLdName: 'Breeders',
    jsonLdDescription: 'Find certified dog and cat breeders in Croatia.',
    pathname: '/uzgajivacnice/en',
    badge: 'Breeders',
    titlePrefix: 'Find',
    titleHighlight: 'breeders',
    description:
      'Browse dog and cat breeders in Croatia, compare profiles, and quickly find the right contact for your next companion.',
  },
} as const;

interface BreedersPageShellProps {
  locale: BreedersPageLocale;
  params: { species?: string; city?: string; breed?: string; sort?: string };
}

export async function BreedersPageShell({ locale, params }: BreedersPageShellProps) {
  const breeders = await getBreeders(params);
  const copy = BREEDERS_COPY[locale];

  return (
    <DiscoveryPageShell
      breadcrumbLabel={copy.breadcrumbLabel}
      breadcrumbHref={copy.pathname}
      jsonLdName={copy.jsonLdName}
      jsonLdDescription={copy.jsonLdDescription}
      serviceType="Pet Breeder"
      areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Varaždin']}
    >
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-5 animate-fade-in-up">
              <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-0 text-sm px-5 py-2 rounded-full font-semibold">
                <Baby className="h-3.5 w-3.5 mr-1.5" />
                {copy.badge}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              {copy.titlePrefix}{' '}
              <span className="text-gradient">{copy.titleHighlight}</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 animate-fade-in-up delay-200 leading-relaxed max-w-xl mx-auto">
              {copy.description}
            </p>
          </div>
        </div>
      </section>

      <BreedersContent breeders={breeders} initialParams={params} forcedLanguage={locale === 'en' ? 'en' : undefined} />
    </DiscoveryPageShell>
  );
}
