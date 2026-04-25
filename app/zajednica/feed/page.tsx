import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Feed zajednice uskoro | PetPark' },
  description: 'Feed je privremeno skriven dok social backend nije spreman.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Feed zajednice uskoro" description="Feed je privremeno skriven dok social backend nije spreman." />;
}
