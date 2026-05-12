import type { Metadata } from 'next';
import { GroupTrainingsPage } from '@/components/shared/petpark/group-trainings-page';

export const metadata: Metadata = {
  title: 'Grupni treninzi | PetPark',
  description: 'Upravljanje grupnim treninzima, prijavama, kapacitetima i obavijestima za PetPark trenere.',
};

export default function GrupniTreninziPage() {
  return <GroupTrainingsPage />;
}
