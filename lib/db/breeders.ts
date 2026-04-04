import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './helpers';

export interface AvailableLitter {
  breed: string;
  count: number;
  ageWeeks: number;
  priceFrom: number;
  priceTo: number;
  status: 'available' | 'reserved' | 'upcoming';
}

export interface Breeder {
  id: string;
  name: string;
  city: string;
  bio: string;
  breeds: string[];
  species: 'dog' | 'cat' | 'both';
  rating: number;
  reviewCount: number;
  verified: boolean;
  fciRegistered: boolean;
  certified: boolean;
  yearsExperience: number;
  phone: string;
  email: string;
  availableLitters: AvailableLitter[];
  gradient: string;
}

const gradients = [
  'from-amber-400 to-orange-300',
  'from-teal-400 to-cyan-300',
  'from-rose-400 to-pink-300',
  'from-blue-400 to-indigo-300',
  'from-emerald-400 to-green-300',
  'from-purple-400 to-violet-300',
];

function inferSpecies(text: string): 'dog' | 'cat' | 'both' {
  const lower = text.toLowerCase();
  const hasDog = /pas|psi|šten|dog|kennel/.test(lower);
  const hasCat = /mačk|cat|ragdoll|maine coon|britanska/.test(lower);
  if (hasDog && hasCat) return 'both';
  if (hasCat) return 'cat';
  return 'dog';
}

function inferBreeds(text: string): string[] {
  const known = [
    'Labrador', 'Zlatni retriver', 'Njemački ovčar', 'Francuski buldog', 'Maltezer',
    'Britanska kratkodlaka', 'Maine Coon', 'Ragdoll', 'Dalmatinac', 'Husky',
    'Border collie', 'Bernski planinski pas', 'Cavalier King Charles', 'Mješanac'
  ];
  return known.filter((breed) => text.toLowerCase().includes(breed.toLowerCase()));
}

function mapPublisherToBreeder(row: Record<string, unknown>, index: number): Breeder {
  const name = String(row.display_name || 'Uzgajivač');
  const bio = String(row.bio || 'Profil uzgajivača na PetParku.');
  const city = String(row.city || 'Hrvatska');
  const phone = String(row.phone || '');
  const email = typeof row.email === 'string' ? row.email : 'kontakt@petpark.hr';
  const sourceText = `${name} ${bio}`;
  const breeds = inferBreeds(sourceText);

  return {
    id: String(row.id),
    name,
    city,
    bio,
    breeds: breeds.length ? breeds : ['Leglo uskoro'],
    species: inferSpecies(sourceText),
    rating: 5,
    reviewCount: 0,
    verified: true,
    fciRegistered: false,
    certified: true,
    yearsExperience: 0,
    phone,
    email,
    availableLitters: [],
    gradient: gradients[index % gradients.length],
  };
}

export async function getBreeders(filters?: { city?: string; species?: string; breed?: string; sort?: string }): Promise<Breeder[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    let query = supabase
      .from('publisher_profiles')
      .select('id, display_name, bio, city, phone, type, user:users!user_id(email)')
      .eq('type', 'uzgajivač');

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let breeders = (data as Record<string, unknown>[]).map((row, index) => {
      const user = Array.isArray(row.user) ? row.user[0] : row.user;
      return mapPublisherToBreeder({ ...row, email: (user as { email?: string } | null)?.email || null }, index);
    });

    if (filters?.species && filters.species !== 'all') {
      breeders = breeders.filter((b) => b.species === filters.species || b.species === 'both');
    }

    if (filters?.breed) {
      const q = filters.breed.toLowerCase();
      breeders = breeders.filter((b) => b.breeds.some((breed) => breed.toLowerCase().includes(q)) || b.bio.toLowerCase().includes(q));
    }

    if (filters?.sort === 'name') {
      breeders.sort((a, b) => a.name.localeCompare(b.name, 'hr'));
    } else {
      breeders.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    }

    return breeders;
  } catch {
    return [];
  }
}

export async function getBreeder(id: string): Promise<Breeder | undefined> {
  const breeders = await getBreeders();
  return breeders.find((b) => b.id === id);
}
