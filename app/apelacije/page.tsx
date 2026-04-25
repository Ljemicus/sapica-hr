import type { Metadata } from 'next';
import { UskoroState } from '@/components/shared/uskoro-state';

export const metadata: Metadata = {
  title: { absolute: 'Apelacije uskoro | PetPark' },
  description: 'Javne apelacije vraćamo kad donation linkovi i organizacije budu provjereni end-to-end.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UskoroState title="Apelacije uskoro" description="Javne apelacije vraćamo kad donation linkovi i organizacije budu provjereni end-to-end." />;
}
