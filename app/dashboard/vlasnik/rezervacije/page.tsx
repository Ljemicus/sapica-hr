import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getWalksForUser, getUser, getPetsByOwner } from '@/lib/db';
import { WalkHistoryList } from './components/walk-history-list';

export const metadata: Metadata = {
  title: 'Povijest šetnji — Vlasnik',
};

export default async function WalkHistoryPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fdashboard%2Fvlasnik%2Frezervacije');
  if (user.role !== 'owner') redirect('/dashboard/sitter');

  const walks = await getWalksForUser(user.id);
  const pets = await getPetsByOwner(user.id);
  
  const petNamesById = new Map(pets.map((pet) => [pet.id, pet.name]));
  
  // Get unique sitter IDs and fetch their names
  const sitterIds = [...new Set(walks.map((w) => w.sitter_id))];
  const sitters = await Promise.all(sitterIds.map((id) => getUser(id)));
  const sitterNamesById = new Map(sitters.filter(Boolean).map((s) => [s!.id, s!.name]));

  const walksWithNames = walks
    .filter((walk) => petNamesById.has(walk.pet_id))
    .map((walk) => ({
      ...walk,
      petName: petNamesById.get(walk.pet_id) || 'Nepoznato',
      sitterName: sitterNamesById.get(walk.sitter_id) || 'Nepoznato',
    }))
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  return <WalkHistoryList walks={walksWithNames} />;
}
