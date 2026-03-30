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
  'from-orange-400 to-yellow-300',
  'from-cyan-400 to-blue-300',
];

export const MOCK_BREEDERS: Breeder[] = [
  {
    id: 'breeder-001',
    name: 'Uzgajivačnica Zlatna Šapa',
    city: 'Zagreb',
    bio: 'Obiteljska uzgajivačnica s 15 godina iskustva u uzgoju labradora i zlatnih retrivera. Svi naši psi su zdravstveno testirani i dolaze s kompletnom dokumentacijom.',
    breeds: ['Labrador', 'Zlatni retriver'],
    species: 'dog',
    rating: 4.9,
    reviewCount: 87,
    verified: true,
    fciRegistered: true,
    certified: true,
    yearsExperience: 15,
    phone: '+385 91 234 5678',
    email: 'zlatna.sapa@email.hr',
    availableLitters: [
      { breed: 'Labrador', count: 5, ageWeeks: 8, priceFrom: 800, priceTo: 1200, status: 'available' },
      { breed: 'Zlatni retriver', count: 3, ageWeeks: 6, priceFrom: 900, priceTo: 1300, status: 'available' },
    ],
    gradient: gradients[0],
  },
  {
    id: 'breeder-002',
    name: 'Von Kroatien Kennel',
    city: 'Zagreb',
    bio: 'Specijalizirani uzgoj njemačkih ovčara s FCI rodovnicom. Naši psi su prvaci na izložbama i imaju izvrsne radne linije.',
    breeds: ['Njemački ovčar'],
    species: 'dog',
    rating: 4.8,
    reviewCount: 62,
    verified: true,
    fciRegistered: true,
    certified: true,
    yearsExperience: 20,
    phone: '+385 98 765 4321',
    email: 'vonkroatien@email.hr',
    availableLitters: [
      { breed: 'Njemački ovčar', count: 7, ageWeeks: 10, priceFrom: 1000, priceTo: 1800, status: 'available' },
      { breed: 'Njemački ovčar', count: 4, ageWeeks: 0, priceFrom: 1200, priceTo: 2000, status: 'upcoming' },
    ],
    gradient: gradients[1],
  },
  {
    id: 'breeder-003',
    name: 'Mali Princ Kennel',
    city: 'Split',
    bio: 'Uzgajivačnica posvećena malim pasminama — francuski buldozi i maltezeri. Svaki štene odrasta u toplom obiteljskom okruženju s puno ljubavi.',
    breeds: ['Francuski buldog', 'Maltezeri'],
    species: 'dog',
    rating: 4.7,
    reviewCount: 45,
    verified: true,
    fciRegistered: true,
    certified: false,
    yearsExperience: 8,
    phone: '+385 91 111 2233',
    email: 'maliprinc@email.hr',
    availableLitters: [
      { breed: 'Francuski buldog', count: 4, ageWeeks: 9, priceFrom: 1500, priceTo: 2500, status: 'available' },
      { breed: 'Maltezeri', count: 3, ageWeeks: 7, priceFrom: 700, priceTo: 1000, status: 'reserved' },
    ],
    gradient: gradients[2],
  },
  {
    id: 'breeder-004',
    name: 'Adriatic Cats',
    city: 'Rijeka',
    bio: 'Profesionalna uzgajivačnica britanskih kratkodlakih mačaka. Naše mačke su testirane na nasljedne bolesti i dolaze s veterinarskim certifikatom.',
    breeds: ['Britanska kratkodlaka'],
    species: 'cat',
    rating: 4.9,
    reviewCount: 38,
    verified: true,
    fciRegistered: false,
    certified: true,
    yearsExperience: 10,
    phone: '+385 91 333 4455',
    email: 'adriaticcats@email.hr',
    availableLitters: [
      { breed: 'Britanska kratkodlaka', count: 4, ageWeeks: 12, priceFrom: 600, priceTo: 1000, status: 'available' },
    ],
    gradient: gradients[3],
  },
  {
    id: 'breeder-005',
    name: 'Bernski Raj',
    city: 'Zagreb',
    bio: 'Uzgajamo bernske planinske pse iz zdravih linija s izvrsnim karakterom. Naši psi žive na velikom imanju s puno prostora za trčanje i igru.',
    breeds: ['Bernski planinski pas'],
    species: 'dog',
    rating: 4.6,
    reviewCount: 29,
    verified: true,
    fciRegistered: true,
    certified: true,
    yearsExperience: 12,
    phone: '+385 98 555 6677',
    email: 'bernskiraj@email.hr',
    availableLitters: [
      { breed: 'Bernski planinski pas', count: 6, ageWeeks: 0, priceFrom: 1100, priceTo: 1600, status: 'upcoming' },
    ],
    gradient: gradients[4],
  },
  {
    id: 'breeder-006',
    name: 'Yorkshire Dreams',
    city: 'Osijek',
    bio: 'Specijalizirani uzgoj yorkshire terijera i bichon frisea. Više od 10 godina iskustva u uzgoju malih pasmina s naglaskom na zdravlje i temperament.',
    breeds: ['Yorkshire terrier', 'Bichon'],
    species: 'dog',
    rating: 4.5,
    reviewCount: 33,
    verified: true,
    fciRegistered: false,
    certified: false,
    yearsExperience: 11,
    phone: '+385 91 777 8899',
    email: 'yorkshiredreams@email.hr',
    availableLitters: [
      { breed: 'Yorkshire terrier', count: 3, ageWeeks: 8, priceFrom: 600, priceTo: 900, status: 'available' },
      { breed: 'Bichon', count: 2, ageWeeks: 10, priceFrom: 500, priceTo: 800, status: 'available' },
    ],
    gradient: gradients[5],
  },
  {
    id: 'breeder-007',
    name: 'Dalmatian Heritage',
    city: 'Split',
    bio: 'Ponosni uzgajivači dalmatinaca — naša nacionalna pasmina! Uzgajamo iz originalnih hrvatskih linija s izvrsnim zdravstvenim rezultatima.',
    breeds: ['Dalmatinac'],
    species: 'dog',
    rating: 4.8,
    reviewCount: 51,
    verified: true,
    fciRegistered: true,
    certified: true,
    yearsExperience: 18,
    phone: '+385 91 222 3344',
    email: 'dalmatianheritage@email.hr',
    availableLitters: [
      { breed: 'Dalmatinac', count: 8, ageWeeks: 7, priceFrom: 700, priceTo: 1100, status: 'available' },
    ],
    gradient: gradients[6],
  },
  {
    id: 'breeder-008',
    name: 'Maine Coon Hrvatska',
    city: 'Rijeka',
    bio: 'Uzgajivačnica Maine Coon i Ragdoll mačaka. Naše mačke su poznate po divovskom šarmu i nježnoj naravi. Svi mačići su socijalizirani i navikli na djecu.',
    breeds: ['Maine Coon', 'Ragdoll'],
    species: 'cat',
    rating: 4.7,
    reviewCount: 27,
    verified: true,
    fciRegistered: false,
    certified: true,
    yearsExperience: 7,
    phone: '+385 98 444 5566',
    email: 'mainecoonhr@email.hr',
    availableLitters: [
      { breed: 'Maine Coon', count: 3, ageWeeks: 14, priceFrom: 800, priceTo: 1400, status: 'available' },
      { breed: 'Ragdoll', count: 2, ageWeeks: 0, priceFrom: 700, priceTo: 1200, status: 'upcoming' },
    ],
    gradient: gradients[7],
  },
  {
    id: 'breeder-009',
    name: 'Husky Land Croatia',
    city: 'Zagreb',
    bio: 'Strastveni uzgajivači sibirskih haskija. Naši psi su aktivni, zdravi i savršeni za sportske obitelji. Pružamo doživotnu podršku novim vlasnicima.',
    breeds: ['Husky'],
    species: 'dog',
    rating: 4.6,
    reviewCount: 41,
    verified: true,
    fciRegistered: true,
    certified: false,
    yearsExperience: 9,
    phone: '+385 91 888 9900',
    email: 'huskyland@email.hr',
    availableLitters: [
      { breed: 'Husky', count: 5, ageWeeks: 6, priceFrom: 800, priceTo: 1300, status: 'reserved' },
    ],
    gradient: gradients[0],
  },
  {
    id: 'breeder-010',
    name: 'Border Collie Farm',
    city: 'Osijek',
    bio: 'Uzgajivačnica border collija na obiteljskom gospodarstvu. Naši psi su iznimno inteligentni, trenirani i idealni za aktivne vlasnike i agility natjecanja.',
    breeds: ['Border collie'],
    species: 'dog',
    rating: 4.9,
    reviewCount: 56,
    verified: true,
    fciRegistered: true,
    certified: true,
    yearsExperience: 14,
    phone: '+385 98 111 0022',
    email: 'bordercolliefarm@email.hr',
    availableLitters: [
      { breed: 'Border collie', count: 6, ageWeeks: 9, priceFrom: 700, priceTo: 1100, status: 'available' },
    ],
    gradient: gradients[1],
  },
  {
    id: 'breeder-011',
    name: 'Royal Cavaliers',
    city: 'Varaždin',
    bio: 'Uzgajivačnica Cavalier King Charles španijela. Naši psi su poznati po izuzetno nježnoj naravi i savršeni su za obitelji s djecom.',
    breeds: ['Cavalier King Charles'],
    species: 'dog',
    rating: 4.7,
    reviewCount: 34,
    verified: true,
    fciRegistered: true,
    certified: false,
    yearsExperience: 6,
    phone: '+385 91 555 0011',
    email: 'royalcavaliers@email.hr',
    availableLitters: [
      { breed: 'Cavalier King Charles', count: 4, ageWeeks: 8, priceFrom: 900, priceTo: 1400, status: 'available' },
    ],
    gradient: gradients[2],
  },
  {
    id: 'breeder-012',
    name: 'Mediteran Kennel',
    city: 'Zadar',
    bio: 'Obiteljska uzgajivačnica labradora i francuskih buldoga na sunčanoj obali. Naši psi uživaju u mediteranskom načinu života i odrastaju uz more.',
    breeds: ['Labrador', 'Francuski buldog'],
    species: 'dog',
    rating: 4.5,
    reviewCount: 22,
    verified: true,
    fciRegistered: false,
    certified: false,
    yearsExperience: 5,
    phone: '+385 98 666 7788',
    email: 'mediterankennel@email.hr',
    availableLitters: [
      { breed: 'Labrador', count: 4, ageWeeks: 11, priceFrom: 700, priceTo: 1000, status: 'available' },
      { breed: 'Francuski buldog', count: 2, ageWeeks: 0, priceFrom: 1300, priceTo: 2200, status: 'upcoming' },
    ],
    gradient: gradients[3],
  },
  {
    id: 'breeder-013',
    name: 'Zagreb Premium Dogs',
    city: 'Zagreb',
    bio: 'Premium uzgajivačnica s naglaskom na kvalitetu, a ne kvantitetu. Uzgajamo zlatne retrivere i bernske planinske pse iz prvačkih linija.',
    breeds: ['Zlatni retriver', 'Bernski planinski pas'],
    species: 'dog',
    rating: 4.8,
    reviewCount: 48,
    verified: true,
    fciRegistered: true,
    certified: true,
    yearsExperience: 16,
    phone: '+385 91 999 0011',
    email: 'zgpremiumdogs@email.hr',
    availableLitters: [
      { breed: 'Zlatni retriver', count: 5, ageWeeks: 8, priceFrom: 1000, priceTo: 1500, status: 'available' },
      { breed: 'Bernski planinski pas', count: 3, ageWeeks: 5, priceFrom: 1200, priceTo: 1800, status: 'reserved' },
    ],
    gradient: gradients[4],
  },
  {
    id: 'breeder-014',
    name: 'Ragdoll Paradise',
    city: 'Zagreb',
    bio: 'Mala obiteljska uzgajivačnica ragdoll mačaka. Naši mačići odrastaju u kući s djecom i drugim kućnim ljubimcima, savršeno socijalizirani.',
    breeds: ['Ragdoll'],
    species: 'cat',
    rating: 4.6,
    reviewCount: 19,
    verified: true,
    fciRegistered: false,
    certified: false,
    yearsExperience: 4,
    phone: '+385 98 222 3311',
    email: 'ragdollparadise@email.hr',
    availableLitters: [
      { breed: 'Ragdoll', count: 3, ageWeeks: 13, priceFrom: 600, priceTo: 1000, status: 'available' },
    ],
    gradient: gradients[5],
  },
];

export function getBreeder(id: string): Breeder | undefined {
  return MOCK_BREEDERS.find((b) => b.id === id);
}

export function getBreeders(filters?: {
  species?: string;
  city?: string;
  breed?: string;
  sort?: string;
}): Breeder[] {
  let results = [...MOCK_BREEDERS];

  if (filters?.species && filters.species !== 'all') {
    results = results.filter((b) => b.species === filters.species || b.species === 'both');
  }

  if (filters?.city) {
    results = results.filter((b) => b.city === filters.city);
  }

  if (filters?.breed) {
    const search = filters.breed.toLowerCase();
    results = results.filter((b) =>
      b.breeds.some((br) => br.toLowerCase().includes(search))
    );
  }

  if (filters?.sort === 'name') {
    results.sort((a, b) => a.name.localeCompare(b.name, 'hr'));
  } else {
    // Default: sort by rating
    results.sort((a, b) => b.rating - a.rating);
  }

  return results;
}
