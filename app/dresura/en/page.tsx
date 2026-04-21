import type { Metadata } from 'next';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';
import { TrainingPageShell } from '../training-page-shell';

export const metadata: Metadata = {
  title: 'Dog training — trainers and programmes',
  description: 'Find certified dog trainers in Croatia for obedience, agility, behaviour work, and puppy training.',
  keywords: ['dog training croatia', 'dog trainer croatia', 'puppy training croatia', 'agility trainer croatia', 'behaviour training dog'],
  openGraph: {
    title: 'Dog training — trainers and programmes | PetPark',
    description: 'Find certified dog trainers in Croatia for obedience, agility, and behaviour work.',
    type: 'website',
    ...buildLocaleOpenGraph('/dresura/en'),
  },
  alternates: buildLocaleAlternates('/dresura/en'),
};

interface DresuraEnPageProps {
  searchParams: Promise<{ city?: string; type?: string }>;
}

export default function DresuraEnPage({ searchParams }: DresuraEnPageProps) {
  return <TrainingPageShell searchParams={searchParams} locale="en" />;
}
