import type { Metadata } from 'next';

import { buildEnglishCityMetadata, CityLandingPageEn } from '@/components/seo/city-landing-page-en';

import { zagrebEnPageData } from './page-data';

export const metadata: Metadata = buildEnglishCityMetadata(zagrebEnPageData);

export default function DogSittingZagrebEn() {
  return <CityLandingPageEn config={zagrebEnPageData} />;
}
