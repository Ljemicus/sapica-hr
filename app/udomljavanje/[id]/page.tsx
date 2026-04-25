import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Oglas za udomljavanje uskoro | PetPark' },
  description: 'Oglasi za udomljavanje su privremeno maknuti iz javnog indexa dok ne provjerimo inventory.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Oglas za udomljavanje uskoro" description="Oglasi za udomljavanje su privremeno maknuti iz javnog indexa dok ne provjerimo inventory." />;
}
