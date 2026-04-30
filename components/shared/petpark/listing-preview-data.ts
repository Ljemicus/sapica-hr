export type ListingPreviewKind = 'grooming' | 'training';

export type ListingPreviewProvider = {
  id: string;
  kind: ListingPreviewKind;
  name: string;
  city: string;
  summary: string;
  services: string[];
  badges: string[];
  profileHref: string;
  rating?: number | null;
  reviewCount?: number | null;
  priceFrom?: number | null;
  responseLabel?: string;
  verified?: boolean;
};

export type ListingPreviewSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  resultSummary: string;
  accent: ListingPreviewKind;
  chips: string[];
  providers: ListingPreviewProvider[];
};

export const listingPreviewSections: ListingPreviewSection[] = [
  {
    id: 'groomeri',
    eyebrow: 'Groomeri / njega',
    title: 'Njega koja izgleda jasno već prije prvog upita.',
    description: 'Preview pokazuje kako budući listing može spojiti usluge, grad, cijenu i status recenzija bez lažnog dojma ponude.',
    resultSummary: 'Preview listinga za groomere',
    accent: 'grooming',
    chips: ['Rijeka', 'Zagreb', 'Split', 'Kupanje', 'Šišanje', 'Njega šapa'],
    providers: [
      {
        id: 'grooming-rijeka-new',
        kind: 'grooming',
        name: 'Petra Groomer',
        city: 'Split',
        summary: 'Salon za osnovno kupanje, šišanje i njegu dlake s jasnim opisom usluga prije slanja upita.',
        services: ['Kupanje', 'Psi', 'Njega dlake'],
        badges: ['Verificiran', 'Novo na PetParku'],
        profileHref: '/njega?city=Split',
        rating: null,
        reviewCount: 0,
        priceFrom: null,
        responseLabel: 'Upit kroz PetPark',
        verified: true,
      },
      {
        id: 'grooming-zagreb-reviewed',
        kind: 'grooming',
        name: 'Maja Pet Studio',
        city: 'Zagreb',
        summary: 'Uređivanje pasa, kupanje i osnovno šišanje s naglaskom na miran pristup ljubimcima.',
        services: ['Šišanje', 'Kupanje', 'Nokti'],
        badges: ['Popularno za male pse'],
        profileHref: '/pretraga?category=grooming&city=Zagreb',
        rating: 4.9,
        reviewCount: 12,
        priceFrom: 25,
        responseLabel: 'Odgovor obično isti dan',
        verified: true,
      },
      {
        id: 'grooming-rijeka-price',
        kind: 'grooming',
        name: 'Rijeka Grooming Corner',
        city: 'Rijeka',
        summary: 'Praktična njega šapa, četkanje i kupanje za vlasnike koji žele brzu usporedbu usluga.',
        services: ['Četkanje', 'Njega šapa', 'Mačke'],
        badges: ['Lokalni partner'],
        profileHref: '/pretraga?category=grooming&city=Rijeka',
        rating: 4.8,
        reviewCount: 7,
        priceFrom: 18,
        responseLabel: 'Slobodni termini po dogovoru',
        verified: false,
      },
    ],
  },
  {
    id: 'treneri',
    eyebrow: 'Treneri / dresura',
    title: 'Trening bez prenapuhanih obećanja.',
    description: 'Treneri se uspoređuju po području rada, gradu i recenzijama, uz posebnu pažnju da novi profili ne dobiju lažnu ocjenu.',
    resultSummary: 'Preview listinga za trenere',
    accent: 'training',
    chips: ['Rijeka', 'Zagreb', 'Osnovna poslušnost', 'Štenci', 'Reaktivnost'],
    providers: [
      {
        id: 'training-rijeka-new',
        kind: 'training',
        name: 'Maja Trainer',
        city: 'Rijeka',
        summary: 'Pozitivan rad sa štencima i osnovna poslušnost, prikazano bez brojčane ocjene dok nema recenzija.',
        services: ['Osnovna poslušnost', 'Štenci'],
        badges: ['Certificiran', 'Novo na PetParku'],
        profileHref: '/dresura?city=Rijeka',
        rating: 0,
        reviewCount: 0,
        priceFrom: 0,
        responseLabel: 'Programi prema dogovoru',
        verified: true,
      },
      {
        id: 'training-zagreb-reviewed',
        kind: 'training',
        name: 'Zagreb Dog Coach',
        city: 'Zagreb',
        summary: 'Individualni treninzi za svakodnevne rutine, šetnje i smirenije ponašanje u gradu.',
        services: ['Reaktivnost', 'Šetnja', 'Individualno'],
        badges: ['Provjeren pristup'],
        profileHref: '/pretraga?category=dresura&city=Zagreb',
        rating: 4.9,
        reviewCount: 18,
        priceFrom: 35,
        responseLabel: 'Prvi razgovor prije plana',
        verified: true,
      },
      {
        id: 'training-split-reviewed',
        kind: 'training',
        name: 'Split Puppy School',
        city: 'Split',
        summary: 'Rani odgoj, socijalizacija i osnovne navike za pse koji tek ulaze u obitelj.',
        services: ['Štenci', 'Socijalizacija', 'Osnove'],
        badges: ['Grupni i individualni rad'],
        profileHref: '/pretraga?category=dresura&city=Split',
        rating: 4.7,
        reviewCount: 9,
        priceFrom: 30,
        responseLabel: 'Dostupnost ovisi o grupi',
        verified: false,
      },
    ],
  },
];

export const listingPreviewTrustItems = [
  {
    title: 'Verificirani partneri',
    description: 'Status profila je jasan, bez skrivanja tko je novi, a tko već ima recenzije.',
    icon: '✓',
  },
  {
    title: 'Jasne informacije',
    description: 'Grad, usluga, cijena i način upita čitaju se brzo i bez nepotrebnog kopanja.',
    icon: '↗',
  },
  {
    title: 'Bez lažnih ocjena',
    description: 'Profil bez recenzija prikazuje se kao nov, bez zvjezdica i bez brojčane ocjene.',
    icon: '★',
  },
  {
    title: 'Bez javnih kontakata prije procesa',
    description: 'Kartice vode prema PetPark rutama i ne izbacuju telefone ili emailove u javni listing.',
    icon: '●',
  },
];
