import type { Metadata } from 'next';

import { VerificationPageShell } from '../page';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Sitter verification | PetPark',
  description: 'Learn about PetPark verification levels — Basic, Verified, and Premium sitter. Build trust and attract more clients.',
  openGraph: {
    title: 'Sitter verification | PetPark',
    description: 'Learn about PetPark verification levels — Basic, Verified, and Premium sitter.',
    type: 'website',
    ...buildLocaleOpenGraph('/verifikacija/en'),
  },
  alternates: buildLocaleAlternates('/verifikacija/en'),
};

export default function VerificationEnPage() {
  return <VerificationPageShell />;
}
