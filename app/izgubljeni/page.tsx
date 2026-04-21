import type { Metadata } from 'next';
import { LostPetsContent } from './lost-pets-content';
import { PublicPageShell } from '@/components/shared/public-page-shell';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const metadata: Metadata = {
  title: 'Izgubljeni ljubimci — prijavite ili pronađite',
  description: 'Pomozite pronaći izgubljene ljubimce u Hrvatskoj. Prijavite nestanak, pretražite oglase i podijelite — svako dijeljenje pomaže.',
  keywords: ['izgubljeni pas', 'izgubljena mačka', 'nestali ljubimci', 'pronađen pas', 'izgubljeni ljubimci hrvatska'],
  openGraph: {
    title: 'Izgubljeni ljubimci — prijavite ili pronađite | PetPark',
    description: 'Pomozite pronaći izgubljene ljubimce u Hrvatskoj. Svako dijeljenje pomaže!',
    type: 'website',
    ...buildLocaleOpenGraph('/izgubljeni'),
  },
  alternates: buildLocaleAlternates('/izgubljeni'),
};

export default function LostPetsPage() {
  return (
    <PublicPageShell breadcrumbItems={[{ label: 'Izgubljeni ljubimci', href: '/izgubljeni' }]}>
      <LostPetsContent />
    </PublicPageShell>
  );
}
