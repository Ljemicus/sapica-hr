import Link from 'next/link';
import { Scissors, Search, ArrowRight } from 'lucide-react';
import { TrainingContent, type PublicTrainingListingItem } from './training-content';
import { DiscoveryPageShell } from '@/components/shared/discovery-page-shell';
import { TRAINING_HUB_LINKS, CONTENT_DISCOVERY_LINKS } from '@/lib/seo/internal-links';
import { getProviderTrainers } from '@/lib/db/provider-trainers';
import type { Trainer, TrainingType } from '@/lib/types';

export type TrainingPageLocale = 'hr' | 'en';

export const TRAINING_PAGE_COPY = {
  hr: {
    breadcrumbLabel: 'Školovanje pasa',
    jsonLdName: 'Školovanje pasa',
    jsonLdDescription: 'Pronađite trenere pasa za školovanje, agility, korekciju ponašanja i rad sa štencima.',
    pathname: '/dresura',
    eyebrow: 'Gradovi s ponudom',
    internalTitle: 'Tražite trening u određenom gradu?',
    internalDescription: 'Vodimo vas na filtrirane rezultate za gradove gdje su dostupni treneri.',
    relatedEyebrow: 'Druge usluge',
    relatedTitle: 'Istražite druge usluge',
    petSittingTitle: 'Čuvanje ljubimaca',
    petSittingDescription: 'Pouzdani sitteri u vašem gradu',
    groomingTitle: 'Grooming saloni',
    groomingDescription: 'Šišanje, kupanje i njega',
    groomingHref: '/njega',
  },
  en: {
    breadcrumbLabel: 'Dog training',
    jsonLdName: 'Dog training',
    jsonLdDescription: 'Find dog trainers in Croatia for obedience, agility, behaviour work, and puppy training.',
    pathname: '/dresura/en',
    eyebrow: 'Cities with supply',
    internalTitle: 'Looking for a trainer in a specific city?',
    internalDescription: 'We route you to filtered results in cities where trainers are available.',
    relatedEyebrow: 'Related services',
    relatedTitle: 'Explore related services',
    petSittingTitle: 'Pet sitting',
    petSittingDescription: 'Reliable sitters in your city',
    groomingTitle: 'Grooming salons',
    groomingDescription: 'Haircuts, baths, and coat care',
    groomingHref: '/njega/en',
  },
} as const;


function toPublicTrainingListingItem(trainer: Trainer): PublicTrainingListingItem {
  return {
    id: trainer.id,
    name: trainer.name,
    city: trainer.city,
    profileHref: `/trener/${trainer.id}`,
    description: trainer.bio,
    specializations: trainer.specializations,
    serviceTags: trainer.specializations,
    certificates: trainer.certificates,
    certified: trainer.certified,
    rating: trainer.review_count > 0 ? trainer.rating : null,
    reviewCount: trainer.review_count ?? 0,
    priceFrom: trainer.price_per_hour > 0 ? trainer.price_per_hour : null,
  };
}

interface TrainingPageShellProps {
  searchParams: Promise<{ city?: string; type?: string }>;
  locale: TrainingPageLocale;
}

export async function TrainingPageShell({ searchParams, locale }: TrainingPageShellProps) {
  const params = await searchParams;
  const trainers = (await getProviderTrainers({ city: params.city, type: params.type as TrainingType | undefined })).map(toPublicTrainingListingItem);
  const copy = TRAINING_PAGE_COPY[locale];

  return (
    <DiscoveryPageShell
      breadcrumbLabel={copy.breadcrumbLabel}
      breadcrumbHref={copy.pathname}
      jsonLdName={copy.jsonLdName}
      jsonLdDescription={copy.jsonLdDescription}
      serviceType="Dog Training"
      areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      internalLinks={{
        eyebrow: copy.eyebrow,
        title: copy.internalTitle,
        description: copy.internalDescription,
        items: [...TRAINING_HUB_LINKS, ...CONTENT_DISCOVERY_LINKS],
      }}
      afterContent={<section className="py-14 md:py-20 bg-warm-section">
        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-4 font-semibold">
              {copy.relatedEyebrow}
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)]">{copy.relatedTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <Link href="/pretraga" className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-white dark:bg-card hover:border-orange-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-500">
                  <Search className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm font-[var(--font-heading)] group-hover:text-orange-500 transition-colors">{copy.petSittingTitle}</h3>
                  <p className="text-xs text-muted-foreground">{copy.petSittingDescription}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
            <Link href={copy.groomingHref} className="group">
              <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-white dark:bg-card hover:border-pink-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-900/30 text-pink-500">
                  <Scissors className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm font-[var(--font-heading)] group-hover:text-pink-500 transition-colors">{copy.groomingTitle}</h3>
                  <p className="text-xs text-muted-foreground">{copy.groomingDescription}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </section>}
    >
      <TrainingContent trainers={trainers} initialParams={params} forcedLanguage={locale} />
    </DiscoveryPageShell>
  );
}
