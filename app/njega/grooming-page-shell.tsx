import { GroomingContent } from '@/app/grooming/grooming-content';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import { PublicPageShell } from '@/components/shared/public-page-shell';
import { getProviderGroomers } from '@/lib/db/provider-groomers';
import type { GroomingServiceType } from '@/lib/types';

export type GroomingPageLocale = 'hr' | 'en';

export const GROOMING_PAGE_COPY = {
  hr: {
    breadcrumbLabel: 'Njega ljubimaca',
    jsonLdName: 'Njega ljubimaca',
    jsonLdDescription: 'Pronađite profesionalne groomere za šišanje, kupanje, trimanje i njegu noktiju ljubimaca u Hrvatskoj.',
    pathname: '/njega',
  },
  en: {
    breadcrumbLabel: 'Pet Grooming',
    jsonLdName: 'Pet Grooming',
    jsonLdDescription: 'Find professional groomers for haircuts, bathing, trimming and nail care for your pet in Croatia.',
    pathname: '/njega/en',
  },
} as const;

interface GroomingPageShellProps {
  searchParams: Promise<{ city?: string; service?: string }>;
  locale: GroomingPageLocale;
}

export async function GroomingPageShell({ searchParams, locale }: GroomingPageShellProps) {
  const params = await searchParams;
  const groomers = await getProviderGroomers({ city: params.city, service: params.service as GroomingServiceType | undefined });
  const copy = GROOMING_PAGE_COPY[locale];

  return (
    <PublicPageShell breadcrumbItems={[{ label: copy.breadcrumbLabel, href: copy.pathname }]}>
      <ServiceJsonLd
        name={copy.jsonLdName}
        description={copy.jsonLdDescription}
        url={`https://petpark.hr${copy.pathname}`}
        serviceType="Pet Grooming"
        areaServed={['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula']}
      />
      <GroomingContent groomers={groomers} initialParams={params} forcedLanguage={locale} />
    </PublicPageShell>
  );
}
