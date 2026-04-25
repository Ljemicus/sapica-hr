import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Profil udruge za udomljavanje uskoro | PetPark' },
  description: 'Profile udruga prikazat ćemo kad podaci i aktivni oglasi budu provjereni.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Profil udruge za udomljavanje uskoro" description="Profile udruga prikazat ćemo kad podaci i aktivni oglasi budu provjereni." />;
}
