import type { Metadata } from 'next';

import { VerificationPageShell } from '../page';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: { absolute: 'Sitter verification | PetPark' },
  description: 'Learn about PetPark profile statuses — basic profile, checks and additional badges that help owners choose.',
  openGraph: {
    title: 'Sitter verification | PetPark',
    description: 'Learn about PetPark profile statuses — basic profile, checks and additional badges.',
    type: 'website',
    ...buildLocaleOpenGraph('/verifikacija/en'),
  },
  alternates: buildLocaleAlternates('/verifikacija/en'),
};

export default function VerificationEnPage() {
  return <VerificationPageShell language="en" />;
}
