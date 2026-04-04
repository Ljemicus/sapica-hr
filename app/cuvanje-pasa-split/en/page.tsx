import type { Metadata } from 'next';

import { buildEnglishCityMetadata, CityLandingPageEn } from '@/components/seo/city-landing-page-en';

import { splitEnPageData } from './page-data';

export const metadata: Metadata = buildEnglishCityMetadata(splitEnPageData);

export default function DogSittingSplitEn() {
  return <CityLandingPageEn config={splitEnPageData} />;
}
