import type { Metadata } from 'next';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { TrainingPageShell } from './training-page-shell';

export const metadata: Metadata = {
  title: 'Školovanje pasa — treneri i programi',
  description: 'Pronađite certificirane trenere pasa za školovanje, agility, korekciju ponašanja i rad sa štencima u Hrvatskoj.',
  keywords: ['školovanje pasa', 'trener pasa', 'dresura pasa', 'agility', 'korekcija ponašanja', 'obuka štenaca'],
  openGraph: {
    title: 'Školovanje pasa — treneri i programi | PetPark',
    description: 'Pronađite certificirane trenere pasa za školovanje, agility i korekciju ponašanja.',
    type: 'website',
    ...buildLocaleOpenGraph('/dresura'),
  },
  alternates: buildLocaleAlternates('/dresura'),
};

interface DresuraPageProps {
  searchParams: Promise<{ city?: string; type?: string }>;
}

export default function DresuraPage({ searchParams }: DresuraPageProps) {
  return <TrainingPageShell searchParams={searchParams} locale="hr" />;
}
