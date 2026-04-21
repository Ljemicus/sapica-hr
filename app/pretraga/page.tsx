import type { Metadata } from 'next';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { SearchPageShell, SEARCH_PAGE_COPY, getSearchPagePath, type SearchPageLocale } from './search-page-shell';
function buildSearchMetadata(locale: SearchPageLocale): Metadata {
  const copy = SEARCH_PAGE_COPY[locale];
  const pathname = getSearchPagePath(locale);

  return {
    title: copy.title,
    description: copy.description,
    keywords: [...copy.keywords],
    openGraph: {
      title: copy.openGraphTitle,
      description: copy.openGraphDescription,
      type: 'website',
      ...buildLocaleOpenGraph(pathname),
    },
    alternates: buildLocaleAlternates(pathname),
  };
}

// ISR: Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

export const metadata: Metadata = buildSearchMetadata('hr');

interface SearchPageProps {
  searchParams: Promise<{
    category?: string;
    city?: string;
    service?: string;
    min_price?: string;
    max_price?: string;
    min_rating?: string;
    sort?: string;
  }>;
}

export async function SearchPageView({ searchParams, locale }: SearchPageProps & { locale: SearchPageLocale }) {
  return <SearchPageShell searchParams={searchParams} locale={locale} />;
}

export default function SearchPage(props: SearchPageProps) {
  return <SearchPageView {...props} locale="hr" />;
}

export { buildSearchMetadata };
