import {
  Sitter,
  Conversation,
  LostPet,
  Booking,
  Review,
  Pet,
  WalkSession,
  PhotoUpdate,
  PetPassport,
  GroomingService,
  TrainingProgram,
  Message,
} from '../types';

// ── 12 Sittera ──────────────────────────────────────────────────────

export const sitters: Sitter[] = [
  {
    id: '1',
    name: 'Ana Horvat',
    avatar: '',
    rating: 4.9,
    reviewCount: 127,
    city: 'Zagreb',
    services: ['Čuvanje', 'Šetnja', 'Dnevna briga'],
    pricePerHour: 12,
    description: 'Iskusna čuvarica s 5 godina iskustva. Obožavam pse i mačke! Imam vlastiti dvorište i uvijek se pobrinjem da se vaši ljubimci osjećaju kao kod kuće.',
    verified: true,
  },
  {
    id: '2',
    name: 'Marko Babić',
    avatar: '',
    rating: 4.8,
    reviewCount: 89,
    city: 'Split',
    services: ['Čuvanje', 'Dresura', 'Šetnja'],
    pricePerHour: 15,
    description: 'Profesionalni trener i čuvar. Specijaliziran za velike pasmine. Certificirani trener s pozitivnim pristupom.',
    verified: true,
  },
  {
    id: '3',
    name: 'Ivana Kovač',
    avatar: '',
    rating: 4.7,
    reviewCount: 64,
    city: 'Rijeka',
    services: ['Grooming', 'Čuvanje'],
    pricePerHour: 18,
    description: 'Profesionalna groomerica i ljubiteljica životinja. Nudim usluge njege i čuvanja u ugodnom okruženju.',
    verified: true,
  },
  {
    id: '4',
    name: 'Luka Jurić',
    avatar: '',
    rating: 4.6,
    reviewCount: 42,
    city: 'Rijeka',
    services: ['Šetnja', 'Dnevna briga'],
    pricePerHour: 10,
    description: 'Student veterine koji obožava životinje. Dostupan svaki dan za šetnje i dnevnu brigu o vašim ljubimcima.',
    verified: false,
  },
  {
    id: '5',
    name: 'Petra Novak',
    avatar: '',
    rating: 4.9,
    reviewCount: 156,
    city: 'Zagreb',
    services: ['Čuvanje', 'Grooming', 'Dresura', 'Šetnja'],
    pricePerHour: 20,
    description: 'Veterinarska tehničarka s dugogodišnjim iskustvom. Pružam kompletnu uslugu brige o kućnim ljubimcima.',
    verified: true,
  },
  {
    id: '6',
    name: 'Tomislav Matić',
    avatar: '',
    rating: 4.5,
    reviewCount: 31,
    city: 'Zadar',
    services: ['Šetnja', 'Čuvanje'],
    pricePerHour: 11,
    description: 'Aktivni sportaš i ljubitelj prirode. Vaš pas će uživati u dugim šetnjama uz more.',
    verified: false,
  },
  {
    id: '7',
    name: 'Maja Perić',
    avatar: '',
    rating: 4.8,
    reviewCount: 73,
    city: 'Split',
    services: ['Grooming', 'Čuvanje', 'Šetnja'],
    pricePerHour: 16,
    description: 'Certificirana groomerica s iskustvom u radu sa svim pasminama. Nudim mobilne grooming usluge.',
    verified: true,
  },
  {
    id: '8',
    name: 'Filip Đurđević',
    avatar: '',
    rating: 4.7,
    reviewCount: 58,
    city: 'Zagreb',
    services: ['Dresura', 'Šetnja', 'Agility'],
    pricePerHour: 22,
    description: 'Profesionalni trener pasa s 8 godina iskustva u agility natjecanjima. Radim individualno i u grupi.',
    verified: true,
  },
  {
    id: '9',
    name: 'Sara Blažević',
    avatar: '',
    rating: 4.6,
    reviewCount: 35,
    city: 'Rijeka',
    services: ['Čuvanje', 'Grooming'],
    pricePerHour: 14,
    description: 'Ljubiteljica životinja s vlastitim prostorom za čuvanje. Specijalizirana za male pasmine i mačke.',
    verified: false,
  },
  {
    id: '10',
    name: 'Ivan Šimić',
    avatar: '',
    rating: 4.9,
    reviewCount: 112,
    city: 'Zagreb',
    services: ['Dresura', 'Čuvanje', 'Šetnja'],
    pricePerHour: 19,
    description: 'Kinolog s diplomom. Specijaliziran za korekciju ponašanja i socijalizaciju pasa svih dobi.',
    verified: true,
  },
  {
    id: '11',
    name: 'Katarina Vuković',
    avatar: '',
    rating: 4.7,
    reviewCount: 48,
    city: 'Split',
    services: ['Grooming', 'Šetnja'],
    pricePerHour: 17,
    description: 'Profesionalna groomerica s iskustvom u salonu. Nudim kupanje, šišanje i kompletnu njegu.',
    verified: true,
  },
  {
    id: '12',
    name: 'Dino Kos',
    avatar: '',
    rating: 4.5,
    reviewCount: 27,
    city: 'Zadar',
    services: ['Čuvanje', 'Šetnja', 'Dnevna briga'],
    pricePerHour: 13,
    description: 'Umirovljenik i doživotni ljubitelj životinja. Imam veliko dvorište i puno slobodnog vremena za vaše ljubimce.',
    verified: false,
  },
];

// ── 8 Groomera (sitters s Grooming uslugom) ────────────────────────

export const groomers: Sitter[] = [
  sitters[2],  // Ivana Kovač
  sitters[4],  // Petra Novak
  sitters[6],  // Maja Perić
  sitters[8],  // Sara Blažević
  sitters[10], // Katarina Vuković
  {
    id: '13',
    name: 'Elena Radić',
    avatar: '',
    rating: 4.8,
    reviewCount: 82,
    city: 'Zagreb',
    services: ['Grooming'],
    pricePerHour: 25,
    description: 'Vlasnica grooming salona "Šapice" u centru Zagreba. 10 godina iskustva, specijalizacija za show preparaciju.',
    verified: true,
  },
  {
    id: '14',
    name: 'Marta Šarić',
    avatar: '',
    rating: 4.6,
    reviewCount: 39,
    city: 'Rijeka',
    services: ['Grooming', 'Čuvanje'],
    pricePerHour: 20,
    description: 'Mobilna groomerica — dolazim k vama doma! Manje stresa za ljubimca, više udobnosti za vas.',
    verified: true,
  },
  {
    id: '15',
    name: 'Nikola Bošnjak',
    avatar: '',
    rating: 4.5,
    reviewCount: 22,
    city: 'Split',
    services: ['Grooming'],
    pricePerHour: 18,
    description: 'Groomer s iskustvom u radu s velikim pasminama. Specijalizirani tretmani za gustu dlaku.',
    verified: false,
  },
];

// ── 6 Trenera (sitters s Dresura/Agility uslugom) ──────────────────

export const trainers: Sitter[] = [
  sitters[1],  // Marko Babić
  sitters[4],  // Petra Novak
  sitters[7],  // Filip Đurđević
  sitters[9],  // Ivan Šimić
  {
    id: '16',
    name: 'Anja Tomašević',
    avatar: '',
    rating: 4.9,
    reviewCount: 94,
    city: 'Zagreb',
    services: ['Dresura', 'Agility'],
    pricePerHour: 25,
    description: 'Certificirana trenerica s međunarodnim iskustvom. Pozitivan pristup, individualni programi za svaki par vlasnik-pas.',
    verified: true,
  },
  {
    id: '17',
    name: 'Bruno Kralj',
    avatar: '',
    rating: 4.7,
    reviewCount: 51,
    city: 'Rijeka',
    services: ['Dresura', 'Šetnja'],
    pricePerHour: 18,
    description: 'Trener specijaliziran za štence i mlade pse. Program rane socijalizacije i osnovna poslušnost.',
    verified: true,
  },
];

// ── 5 Ljubimaca ─────────────────────────────────────────────────────

export const myPets: Pet[] = [
  {
    id: '1',
    name: 'Luna',
    type: 'pas',
    breed: 'Labrador',
    age: 3,
    image: '',
  },
  {
    id: '2',
    name: 'Miki',
    type: 'macka',
    breed: 'Domaća',
    age: 5,
    image: '',
  },
  {
    id: '3',
    name: 'Rex',
    type: 'pas',
    breed: 'Njemački ovčar',
    age: 4,
    image: '',
  },
  {
    id: '4',
    name: 'Bella',
    type: 'macka',
    breed: 'Britanska kratkodlaka',
    age: 2,
    image: '',
  },
  {
    id: '5',
    name: 'Charlie',
    type: 'pas',
    breed: 'Golden Retriever',
    age: 6,
    image: '',
  },
];

// ── Recenzije ───────────────────────────────────────────────────────

export const reviews: Review[] = [
  {
    id: '1',
    userName: 'Maja Perić',
    userAvatar: '',
    rating: 5,
    text: 'Fantastična čuvarica! Naš pas je bio presretan i jedva čekao sljedeći put. Topla preporuka!',
    date: '2026-03-15',
  },
  {
    id: '2',
    userName: 'Ivan Šimić',
    userAvatar: '',
    rating: 5,
    text: 'Profesionalna i pouzdana. Slala nam je slike tijekom dana. Odlična komunikacija.',
    date: '2026-03-10',
  },
  {
    id: '3',
    userName: 'Katarina Blažević',
    userAvatar: '',
    rating: 4,
    text: 'Vrlo zadovoljna uslugom. Mačka je bila mirna i sretna kad smo se vratili.',
    date: '2026-03-05',
  },
  {
    id: '4',
    userName: 'Tomislav Horvat',
    userAvatar: '',
    rating: 5,
    text: 'Odlična usluga! Naša Luna se zaigrana vratila i odmah zaspala. Vidimo se opet!',
    date: '2026-02-28',
  },
  {
    id: '5',
    userName: 'Ana Matić',
    userAvatar: '',
    rating: 4,
    text: 'Jako sam zadovoljna, sitter je bio pažljiv i odgovoran. Jedino malo kasni s odgovorima na poruke.',
    date: '2026-02-20',
  },
];

// ── Konverzacije ────────────────────────────────────────────────────

export const conversations: Conversation[] = [
  {
    id: '1',
    participantName: 'Ana Horvat',
    participantAvatar: '',
    lastMessage: 'Super, vidimo se u subotu u 10h! 🐾',
    lastMessageTime: '14:30',
    unreadCount: 2,
  },
  {
    id: '2',
    participantName: 'Marko Babić',
    participantAvatar: '',
    lastMessage: 'Rex je bio super danas, poslat ću vam slike',
    lastMessageTime: '12:15',
    unreadCount: 0,
  },
  {
    id: '3',
    participantName: 'Ivana Kovač',
    participantAvatar: '',
    lastMessage: 'Mogu li doći po Bellu u petak?',
    lastMessageTime: 'Jučer',
    unreadCount: 1,
  },
  {
    id: '4',
    participantName: 'Petra Novak',
    participantAvatar: '',
    lastMessage: 'Hvala vam na povjerenju! ❤️',
    lastMessageTime: 'Pon',
    unreadCount: 0,
  },
  {
    id: '5',
    participantName: 'Filip Đurđević',
    participantAvatar: '',
    lastMessage: 'Trening za Rexa ide odlično, napreduje!',
    lastMessageTime: 'Pon',
    unreadCount: 0,
  },
];

// ── Chat poruke ─────────────────────────────────────────────────────

export const chatMessages: Message[] = [
  { id: '1', senderId: 'other', text: 'Bok! Zanima me čuvanje za vikend.', timestamp: '10:00', read: true },
  { id: '2', senderId: 'me', text: 'Bok! Naravno, koji datumi vam odgovaraju?', timestamp: '10:05', read: true },
  { id: '3', senderId: 'other', text: 'Subota i nedjelja, 15-16.3. Imam jednog labradora.', timestamp: '10:08', read: true },
  { id: '4', senderId: 'me', text: 'Super, slobodna sam taj vikend! Koliko ima godina?', timestamp: '10:12', read: true },
  { id: '5', senderId: 'other', text: '3 godine, jako je miran i socijaliziran 🐕', timestamp: '10:15', read: true },
  { id: '6', senderId: 'me', text: 'Odlično! Cijena za vikend je 200€. Odgovara vam?', timestamp: '10:20', read: true },
  { id: '7', senderId: 'other', text: 'Super, vidimo se u subotu u 10h! 🐾', timestamp: '14:30', read: false },
  { id: '8', senderId: 'me', text: 'Savršeno! Ponesite omiljenu igračku za Lunu 🧸', timestamp: '14:35', read: true },
  { id: '9', senderId: 'other', text: 'Hoću! Hvala vam puno!', timestamp: '14:38', read: false },
];

// ── Izgubljeni ljubimci ─────────────────────────────────────────────

export const lostPets: LostPet[] = [
  {
    id: '1',
    name: 'Rex',
    type: 'Pas',
    breed: 'Njemački ovčar',
    image: '',
    lastSeen: 'Maksimir, Zagreb',
    lastSeenDate: '2026-03-22',
    city: 'Zagreb',
    description: 'Veliki njemački ovčar, crno-smeđi, ima ogrlicu s imenom. Vrlo prijazan.',
    contactPhone: '+385 91 234 5678',
    found: false,
  },
  {
    id: '2',
    name: 'Maca',
    type: 'Mačka',
    breed: 'Perzijska',
    image: '',
    lastSeen: 'Spinut, Split',
    lastSeenDate: '2026-03-20',
    city: 'Split',
    description: 'Bijela perzijska mačka, zelene oči, nedostaje od utorka.',
    contactPhone: '+385 92 345 6789',
    found: false,
  },
  {
    id: '3',
    name: 'Buddy',
    type: 'Pas',
    breed: 'Golden Retriever',
    image: '',
    lastSeen: 'Trsat, Rijeka',
    lastSeenDate: '2026-03-21',
    city: 'Rijeka',
    description: 'Zlatni retriver, 5 godina, ima mikročip. Pobjegao iz dvorišta.',
    contactPhone: '+385 98 765 4321',
    found: false,
  },
  {
    id: '4',
    name: 'Lili',
    type: 'Mačka',
    breed: 'Sijamska',
    image: '',
    lastSeen: 'Poluotok, Zadar',
    lastSeenDate: '2026-03-19',
    city: 'Zadar',
    description: 'Sijamska mačka, plave oči, smeđe-bijela. Nestala s balkona.',
    contactPhone: '+385 95 111 2233',
    found: false,
  },
  {
    id: '5',
    name: 'Džeki',
    type: 'Pas',
    breed: 'Jack Russell Terrier',
    image: '',
    lastSeen: 'Kozala, Rijeka',
    lastSeenDate: '2026-03-18',
    city: 'Rijeka',
    description: 'Mali Jack Russell, bijelo-smeđi, energičan. Pobjegao tijekom šetnje.',
    contactPhone: '+385 91 555 6677',
    found: false,
  },
];

// ── Booking historija ───────────────────────────────────────────────

export const myBookings: Booking[] = [
  {
    id: '1',
    sitterId: '1',
    sitterName: 'Ana Horvat',
    service: 'Čuvanje',
    startDate: '2026-03-28',
    endDate: '2026-03-30',
    status: 'confirmed',
    totalPrice: 576,
  },
  {
    id: '2',
    sitterId: '3',
    sitterName: 'Ivana Kovač',
    service: 'Grooming',
    startDate: '2026-03-25',
    endDate: '2026-03-25',
    status: 'completed',
    totalPrice: 180,
  },
  {
    id: '3',
    sitterId: '8',
    sitterName: 'Filip Đurđević',
    service: 'Dresura',
    startDate: '2026-04-01',
    endDate: '2026-04-15',
    status: 'pending',
    totalPrice: 440,
  },
  {
    id: '4',
    sitterId: '2',
    sitterName: 'Marko Babić',
    service: 'Šetnja',
    startDate: '2026-03-10',
    endDate: '2026-03-10',
    status: 'completed',
    totalPrice: 60,
  },
  {
    id: '5',
    sitterId: '5',
    sitterName: 'Petra Novak',
    service: 'Dnevna briga',
    startDate: '2026-03-05',
    endDate: '2026-03-05',
    status: 'cancelled',
    totalPrice: 160,
  },
];

// ── GPS tracking - Rijeka korzo ruta ────────────────────────────────

export const walkSession: WalkSession = {
  id: '1',
  sitterName: 'Luka Jurić',
  sitterAvatar: '',
  petName: 'Luna',
  status: 'u_tijeku',
  startTime: '09:30',
  duration: '42 min',
  distance: '2.1 km',
  avgSpeed: '3.0 km/h',
  checkpoints: [
    { id: '1', time: '09:30', label: 'Početak — Trg 128. brigade HV', lat: 45.3271, lng: 14.4422 },
    { id: '2', time: '09:40', label: 'Korzo — Adamićeva ulica', lat: 45.3275, lng: 14.4408 },
    { id: '3', time: '09:52', label: 'Trg Ivana Koblera', lat: 45.3282, lng: 14.4382 },
    { id: '4', time: '10:05', label: 'Riva — obala uz more', lat: 45.3265, lng: 14.4395 },
    { id: '5', time: '10:12', label: 'Park Mlaka', lat: 45.3258, lng: 14.4410 },
  ],
  route: [
    { lat: 45.3271, lng: 14.4422 },
    { lat: 45.3273, lng: 14.4415 },
    { lat: 45.3275, lng: 14.4408 },
    { lat: 45.3278, lng: 14.4398 },
    { lat: 45.3282, lng: 14.4382 },
    { lat: 45.3280, lng: 14.4378 },
    { lat: 45.3275, lng: 14.4385 },
    { lat: 45.3268, lng: 14.4390 },
    { lat: 45.3265, lng: 14.4395 },
    { lat: 45.3260, lng: 14.4405 },
    { lat: 45.3258, lng: 14.4410 },
  ],
};

// ── Photo updates (Instagram stil) ──────────────────────────────────

export const photoUpdates: PhotoUpdate[] = [
  {
    id: '1',
    sitterName: 'Ana Horvat',
    sitterAvatar: '',
    petName: 'Luna',
    image: '',
    caption: 'Luna uživa u parku! Jako je vesela danas 🐾',
    timestamp: '10:15',
    liked: false,
  },
  {
    id: '2',
    sitterName: 'Ana Horvat',
    sitterAvatar: '',
    petName: 'Luna',
    image: '',
    caption: 'Odmor nakon šetnje. Zaslužila je poslasticu!',
    timestamp: '11:30',
    liked: true,
  },
  {
    id: '3',
    sitterName: 'Ana Horvat',
    sitterAvatar: '',
    petName: 'Luna',
    image: '',
    caption: 'Ručak je gotov! Pojela je sve do zadnje mrvice 🍖',
    timestamp: '13:00',
    liked: false,
  },
  {
    id: '4',
    sitterName: 'Ana Horvat',
    sitterAvatar: '',
    petName: 'Luna',
    image: '',
    caption: 'Popodnevna drzemka na suncu ☀️',
    timestamp: '15:20',
    liked: false,
  },
  {
    id: '5',
    sitterName: 'Luka Jurić',
    sitterAvatar: '',
    petName: 'Rex',
    image: '',
    caption: 'Rex na Korzu! Šetamo i uživamo u suncu 🌞',
    timestamp: '09:45',
    liked: true,
  },
];

// ── Pet passporti (zdravstveni kartoni) ─────────────────────────────

export const petPassports: PetPassport[] = [
  {
    id: '1',
    petId: '1',
    petName: 'Luna',
    petImage: '',
    breed: 'Labrador',
    type: 'Pas',
    birthDate: '15.06.2023.',
    weight: '28 kg',
    microchipId: 'HR-191-000123456',
    vaccinations: [
      { id: '1', name: 'Bjesnoća', date: '10.01.2026.', nextDate: '10.01.2027.', vet: 'dr. Marić' },
      { id: '2', name: 'DHPP', date: '15.03.2025.', nextDate: '15.03.2026.', vet: 'dr. Marić' },
      { id: '3', name: 'Leptospiroza', date: '20.06.2025.', nextDate: '20.06.2026.', vet: 'dr. Marić' },
      { id: '4', name: 'Bordetella', date: '01.09.2025.', nextDate: '01.09.2026.', vet: 'dr. Kovačević' },
    ],
    allergies: ['Piletina', 'Pelud trave'],
    medications: [
      { name: 'Antiparazitik', dosage: '1 tableta', frequency: 'Mjesečno' },
    ],
    vetContact: {
      name: 'dr. Ivan Marić',
      clinic: 'Veterinarska ambulanta Maksimir',
      phone: '+385 1 234 5678',
      address: 'Maksimirska 128, Zagreb',
    },
  },
  {
    id: '2',
    petId: '2',
    petName: 'Miki',
    petImage: '',
    breed: 'Domaća',
    type: 'Mačka',
    birthDate: '03.04.2021.',
    weight: '4.5 kg',
    microchipId: 'HR-191-000654321',
    vaccinations: [
      { id: '1', name: 'Bjesnoća', date: '05.02.2026.', nextDate: '05.02.2027.', vet: 'dr. Marić' },
      { id: '2', name: 'FVRCP', date: '20.04.2025.', nextDate: '20.04.2026.', vet: 'dr. Marić' },
    ],
    allergies: [],
    medications: [],
    vetContact: {
      name: 'dr. Ivan Marić',
      clinic: 'Veterinarska ambulanta Maksimir',
      phone: '+385 1 234 5678',
      address: 'Maksimirska 128, Zagreb',
    },
  },
  {
    id: '3',
    petId: '3',
    petName: 'Rex',
    petImage: '',
    breed: 'Njemački ovčar',
    type: 'Pas',
    birthDate: '22.11.2022.',
    weight: '35 kg',
    microchipId: 'HR-191-000789012',
    vaccinations: [
      { id: '1', name: 'Bjesnoća', date: '15.01.2026.', nextDate: '15.01.2027.', vet: 'dr. Kovačević' },
      { id: '2', name: 'DHPP', date: '10.05.2025.', nextDate: '10.05.2026.', vet: 'dr. Kovačević' },
    ],
    allergies: ['Goveda proteini'],
    medications: [
      { name: 'Glukozamin', dosage: '500mg', frequency: 'Dnevno' },
    ],
    vetContact: {
      name: 'dr. Maja Kovačević',
      clinic: 'Vet centar Rijeka',
      phone: '+385 51 321 654',
      address: 'Fiumara 12, Rijeka',
    },
  },
  {
    id: '4',
    petId: '4',
    petName: 'Bella',
    petImage: '',
    breed: 'Britanska kratkodlaka',
    type: 'Mačka',
    birthDate: '08.09.2024.',
    weight: '3.2 kg',
    microchipId: 'HR-191-000345678',
    vaccinations: [
      { id: '1', name: 'FVRCP', date: '10.11.2024.', nextDate: '10.11.2025.', vet: 'dr. Marić' },
    ],
    allergies: [],
    medications: [],
    vetContact: {
      name: 'dr. Ivan Marić',
      clinic: 'Veterinarska ambulanta Maksimir',
      phone: '+385 1 234 5678',
      address: 'Maksimirska 128, Zagreb',
    },
  },
  {
    id: '5',
    petId: '5',
    petName: 'Charlie',
    petImage: '',
    breed: 'Golden Retriever',
    type: 'Pas',
    birthDate: '01.03.2020.',
    weight: '32 kg',
    microchipId: 'HR-191-000901234',
    vaccinations: [
      { id: '1', name: 'Bjesnoća', date: '20.02.2026.', nextDate: '20.02.2027.', vet: 'dr. Marić' },
      { id: '2', name: 'DHPP', date: '05.06.2025.', nextDate: '05.06.2026.', vet: 'dr. Marić' },
      { id: '3', name: 'Leptospiroza', date: '15.07.2025.', nextDate: '15.07.2026.', vet: 'dr. Marić' },
    ],
    allergies: ['Kukuruz'],
    medications: [
      { name: 'Antiparazitik', dosage: '1 tableta', frequency: 'Mjesečno' },
      { name: 'Omega-3', dosage: '1 kapsula', frequency: 'Dnevno' },
    ],
    vetContact: {
      name: 'dr. Ivan Marić',
      clinic: 'Veterinarska ambulanta Maksimir',
      phone: '+385 1 234 5678',
      address: 'Maksimirska 128, Zagreb',
    },
  },
];

// ── Grooming usluge ─────────────────────────────────────────────────

export const groomingServices: GroomingService[] = [
  { id: '1', name: 'Kupanje', description: 'Kompletno kupanje sa šamponom i sušenjem', price: '25€', duration: '45 min', icon: 'water' },
  { id: '2', name: 'Šišanje', description: 'Profesionalno šišanje po pasmini', price: '35€', duration: '60 min', icon: 'cut' },
  { id: '3', name: 'Trimanje noktiju', description: 'Sigurno i precizno skraćivanje noktiju', price: '10€', duration: '15 min', icon: 'hand-left' },
  { id: '4', name: 'Čišćenje ušiju', description: 'Nježno čišćenje i pregled ušiju', price: '12€', duration: '15 min', icon: 'ear' },
  { id: '5', name: 'Kompletna njega', description: 'Kupanje + šišanje + nokti + uši', price: '65€', duration: '90 min', icon: 'sparkles' },
  { id: '6', name: 'Četkanje dlake', description: 'Detaljno četkanje i uklanjanje čvorova', price: '15€', duration: '30 min', icon: 'brush' },
  { id: '7', name: 'Spa tretman', description: 'Relaksirajući tretman s masažom i aromaterapijom', price: '45€', duration: '60 min', icon: 'leaf' },
  { id: '8', name: 'Dentalna higijena', description: 'Čišćenje zuba i pregled desni', price: '20€', duration: '20 min', icon: 'medical' },
];

// ── Training programi ───────────────────────────────────────────────

export const trainingPrograms: TrainingProgram[] = [
  { id: '1', name: 'Osnovna poslušnost', description: 'Sjedi, lezi, ostani, dođi — temelji dobre komunikacije', price: '150€', duration: '4 tjedna', sessions: 8, icon: 'school' },
  { id: '2', name: 'Agility', description: 'Prepreke, tuneli, slalom — zabava i fitness za psa', price: '120€', duration: '6 tjedana', sessions: 12, icon: 'fitness' },
  { id: '3', name: 'Socijalizacija', description: 'Rad u grupi, navikavanje na druge pse i ljude', price: '100€', duration: '3 tjedna', sessions: 6, icon: 'people' },
  { id: '4', name: 'Korekcija ponašanja', description: 'Rješavanje lajanja, skakanja, vuče na povodcu', price: '200€', duration: '6 tjedana', sessions: 12, icon: 'build' },
  { id: '5', name: 'Trikovi', description: 'Zabavni trikovi — daj šapu, okreni se, donesi', price: '80€', duration: '3 tjedna', sessions: 6, icon: 'star' },
  { id: '6', name: 'Napredna poslušnost', description: 'Hodanje bez povodca, ignoriranje distrakcija, poziv iz daljine', price: '180€', duration: '5 tjedana', sessions: 10, icon: 'ribbon' },
];

// ── Kategorije i usluge ─────────────────────────────────────────────

export const categories = [
  { id: '1', name: 'Sitteri', icon: 'heart' as const, color: '#f97316', bgColor: '#fff7ed' },
  { id: '2', name: 'Grooming', icon: 'cut' as const, color: '#ec4899', bgColor: '#fdf2f8' },
  { id: '3', name: 'Dresura', icon: 'school' as const, color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: '4', name: 'Izgubljeni', icon: 'search' as const, color: '#ef4444', bgColor: '#fef2f2' },
];

export const services = [
  { id: '1', name: 'Čuvanje kod kuće', price: 'od 12€/h' },
  { id: '2', name: 'Šetnja', price: 'od 8€/h' },
  { id: '3', name: 'Dnevna briga', price: 'od 25€/dan' },
  { id: '4', name: 'Grooming', price: 'od 18€' },
  { id: '5', name: 'Dresura', price: 'od 20€/h' },
  { id: '6', name: 'Agility', price: 'od 15€/h' },
];
