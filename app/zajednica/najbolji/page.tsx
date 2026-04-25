import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Najbolji iz zajednice uskoro | PetPark' },
  description: 'Ovaj dio zajednice je privremeno skriven dok modul nije spreman.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Najbolji iz zajednice uskoro" description="Ovaj dio zajednice je privremeno skriven dok modul nije spreman." />;
}
