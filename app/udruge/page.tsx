import type { Metadata } from 'next';
import { getActiveRescueAppeals, getRescueOrganizations } from '@/lib/db';
import { RescueOrganizationsContent } from './rescue-organizations-content';

export const metadata: Metadata = {
  title: 'Rescue udruge i organizacije | PetPark',
  description: 'Pregled aktivnih rescue organizacija na PetParku spojen na stvarne podatke iz baze. Pretražuj i filtriraj po gradu.',
};

export default async function RescueOrganizationsPage() {
  const [organizations, activeAppeals] = await Promise.all([
    getRescueOrganizations('active'),
    getActiveRescueAppeals(),
  ]);

  return (
    <RescueOrganizationsContent 
      organizations={organizations} 
      activeAppeals={activeAppeals} 
    />
  );
}
