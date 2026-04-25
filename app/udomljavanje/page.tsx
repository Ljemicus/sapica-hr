import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Udomljavanje uskoro | PetPark' },
  description: 'Prikazat ćemo samo stvarne oglase za udomljavanje kad inventory i udruge budu dovoljno provjereni.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Udomljavanje uskoro" description="Prikazat ćemo samo stvarne oglase za udomljavanje kad inventory i udruge budu dovoljno provjereni." />;
}
