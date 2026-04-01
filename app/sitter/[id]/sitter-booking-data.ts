import { getAuthUser } from '@/lib/auth';
import { getPetsByOwner } from '@/lib/db/marketplace';
import type { Pet } from '@/lib/types';

export async function getSitterBookingData(): Promise<{ currentUserId: string | null; pets: Pet[] }> {
  const user = await getAuthUser();
  if (!user || user.role !== 'owner') {
    return { currentUserId: user?.id || null, pets: [] };
  }

  const pets = await getPetsByOwner(user.id);
  return {
    currentUserId: user.id,
    pets,
  };
}
