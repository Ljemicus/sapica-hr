import type { Metadata } from 'next';

import { SearchPageView, buildSearchMetadata } from '../page';

export const metadata: Metadata = buildSearchMetadata('en');

interface SearchPageEnProps {
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

export default function SearchPageEn(props: SearchPageEnProps) {
  return <SearchPageView {...props} locale="en" />;
}
