import type { Metadata } from 'next';

import { buildEnglishCityMetadata, CityLandingPageEn } from '@/components/seo/city-landing-page-en';

import { rijekaEnPageData } from './page-data';

export const metadata: Metadata = buildEnglishCityMetadata(rijekaEnPageData);

export default function DogSittingRijekaEn() {
  return <CityLandingPageEn config={rijekaEnPageData} />;
}
