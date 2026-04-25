import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Forum tema uskoro | PetPark' },
  description: 'Forum teme su privremeno skrivene dok ne završimo stabilan backend.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Forum tema uskoro" description="Forum teme su privremeno skrivene dok ne završimo stabilan backend." />;
}
