import type { BlogCategory } from '@/lib/types';
import type { InternalLinkItem } from '@/components/shared/internal-link-section';

const CITY_ORDER = ['Zagreb', 'Split', 'Rijeka'] as const;

type SupportedCity = typeof CITY_ORDER[number];

const CITY_PAGE_MAP: Record<SupportedCity, string> = {
  Zagreb: '/cuvanje-pasa-zagreb',
  Split: '/cuvanje-pasa-split',
  Rijeka: '/cuvanje-pasa-rijeka',
};

export function getSiblingCityLinks(currentCity: SupportedCity): InternalLinkItem[] {
  return CITY_ORDER.filter((city) => city !== currentCity).map((city) => ({
    href: CITY_PAGE_MAP[city],
    title: `Čuvanje pasa u ${city === 'Split' ? 'Splitu' : city === 'Rijeka' ? 'Rijeci' : 'Zagrebu'}`,
    description: `Pogledajte opcije za čuvanje ljubimaca u ${city === 'Split' ? 'Splitu' : city === 'Rijeka' ? 'Rijeci' : 'Zagrebu'} — kvartovi, savjeti i lokalni pristup.`,
    badge: 'Grad',
  }));
}

export function getCityServiceLinks(city: SupportedCity): InternalLinkItem[] {
  return [
    {
      href: `/pretraga?city=${encodeURIComponent(city)}`,
      title: `Pretraga usluga u ${city}`,
      description: 'Pregledajte dostupne profile i usluge u vašem gradu.',
      badge: 'Pretraga',
    },
    {
      href: city === 'Zagreb' ? '/grooming-zagreb' : `/pretraga?category=grooming&city=${encodeURIComponent(city)}`,
      title: `Njega ljubimaca u ${city}`,
      description: city === 'Zagreb'
        ? 'Grooming saloni, cijene i praktični savjeti za njegu u Zagrebu.'
        : 'Pregledajte grooming usluge dostupne u vašem gradu.',
      badge: 'Njega',
    },
    {
      href: `/dresura?city=${encodeURIComponent(city)}`,
      title: `Školovanje pasa u ${city}`,
      description: 'Treneri i programi školovanja pasa u vašem gradu.',
      badge: 'Dresura',
    },
    {
      href: '/zajednica',
      title: 'Savjeti iz zajednice',
      description: 'Vodiči i članci koji pomažu prije rezervacije ili odabira usluge.',
      badge: 'Sadržaj',
    },
    {
      href: '/forum',
      title: 'Pitajte zajednicu',
      description: 'Stvarna iskustva i praktični odgovori od drugih vlasnika ljubimaca.',
      badge: 'Forum',
    },
    {
      href: '/dog-friendly',
      title: 'Dog-friendly lokacije',
      description: 'Kafići, parkovi i druga mjesta prilagođena psima u vašem gradu.',
      badge: 'Lifestyle',
    },
  ];
}

export const GROOMING_HUB_LINKS: InternalLinkItem[] = [
  {
    href: '/grooming-zagreb',
    title: 'Grooming u Zagrebu',
    description: 'Saloni, cijene i savjeti za njegu ljubimaca u Zagrebu.',
    badge: 'Landing',
  },
  {
    href: '/pretraga?category=grooming&city=Split',
    title: 'Grooming u Splitu',
    description: 'Pregledajte grooming usluge dostupne u Splitu.',
    badge: 'Split',
  },
  {
    href: '/pretraga?category=grooming&city=Rijeka',
    title: 'Grooming u Rijeci',
    description: 'Pregledajte grooming usluge dostupne u Rijeci.',
    badge: 'Rijeka',
  },
];

export const TRAINING_HUB_LINKS: InternalLinkItem[] = [
  {
    href: '/dresura?city=Zagreb',
    title: 'Dresura u Zagrebu',
    description: 'Treneri i programi školovanja pasa u Zagrebu.',
    badge: 'Zagreb',
  },
  {
    href: '/dresura?city=Split',
    title: 'Dresura u Splitu',
    description: 'Treneri i programi školovanja pasa u Splitu.',
    badge: 'Split',
  },
  {
    href: '/dresura?city=Rijeka',
    title: 'Dresura u Rijeci',
    description: 'Treneri i programi školovanja pasa u Rijeci.',
    badge: 'Rijeka',
  },
];

export const CONTENT_DISCOVERY_LINKS: InternalLinkItem[] = [
  {
    href: '/zajednica',
    title: 'Zajednica i vodiči',
    description: 'Članci i savjeti za vlasnike koji istražuju opcije prije odabira usluge.',
    badge: 'Blog',
  },
  {
    href: '/forum',
    title: 'Forum pitanja i iskustva',
    description: 'Konkretna pitanja, iskustva drugih vlasnika i brzi odgovori iz zajednice.',
    badge: 'Forum',
  },
  {
    href: '/dog-friendly',
    title: 'Dog-friendly mjesta',
    description: 'Kafići, parkovi i lokacije u vašem gradu prilagođene psima.',
    badge: 'Lifestyle',
  },
];

export const SEARCH_DISCOVERY_LINKS: InternalLinkItem[] = [
  {
    href: '/cuvanje-pasa-zagreb',
    title: 'Čuvanje pasa u Zagrebu',
    description: 'Sve o čuvanju ljubimaca u Zagrebu — kvartovi, savjeti i lokalni pristup.',
    badge: 'City page',
  },
  {
    href: '/cuvanje-pasa-split',
    title: 'Čuvanje pasa u Splitu',
    description: 'Vodič za vlasnike koji traže čuvanje ljubimaca u Splitu i okolici.',
    badge: 'City page',
  },
  {
    href: '/cuvanje-pasa-rijeka',
    title: 'Čuvanje pasa u Rijeci',
    description: 'Praktične informacije za čuvanje ljubimaca u Rijeci.',
    badge: 'City page',
  },
  {
    href: '/grooming-zagreb',
    title: 'Grooming Zagreb',
    description: 'Njega, šišanje i kupanje ljubimaca u Zagrebu — saloni i cijene.',
    badge: 'Landing',
  },
  {
    href: '/njega',
    title: 'Njega ljubimaca',
    description: 'Grooming, kupanje i šišanje — pregledajte dostupne usluge po gradovima.',
    badge: 'Service',
  },
  {
    href: '/dresura',
    title: 'Školovanje pasa',
    description: 'Treneri i programi školovanja pasa u vašem gradu.',
    badge: 'Service',
  },
];

export function getArticleActionLinks(category: BlogCategory): InternalLinkItem[] {
  switch (category) {
    case 'dresura':
      return [
        {
          href: '/dresura',
          title: 'Pregledaj trenere i programe',
          description: 'Pronađite trenera u svom gradu i zakažite termin.',
          badge: 'Dresura',
        },
        {
          href: '/forum',
          title: 'Postavi pitanje zajednici',
          description: 'Pitajte za iskustva drugih vlasnika prije odabira trenera.',
          badge: 'Forum',
        },
        {
          href: '/pretraga',
          title: 'Otvori pretragu svih usluga',
          description: 'Usporedite i ostale usluge — čuvanje, grooming i više.',
          badge: 'Pretraga',
        },
      ];
    case 'putovanje':
      return [
        {
          href: '/dog-friendly',
          title: 'Dog-friendly lokacije',
          description: 'Kafići, parkovi i mjesta za izlazak ili putovanje sa psom.',
          badge: 'Lifestyle',
        },
        {
          href: '/pretraga',
          title: 'Nađi pomoć u svom gradu',
          description: 'Treba vam sitter, grooming ili trener za vrijeme puta? Krenite ovdje.',
          badge: 'Pretraga',
        },
        {
          href: '/forum',
          title: 'Iskustva drugih vlasnika',
          description: 'Lokalni savjeti i iskustva iz prve ruke od drugih vlasnika.',
          badge: 'Forum',
        },
      ];
    default:
      return [
        {
          href: '/pretraga',
          title: 'Pretraži usluge za ljubimce',
          description: 'Pronađite sittere, groomere i trenere u svom gradu.',
          badge: 'Pretraga',
        },
        {
          href: '/zajednica',
          title: 'Još vodiča iz zajednice',
          description: 'Nastavite čitati teme koje vas zanimaju.',
          badge: 'Blog',
        },
        {
          href: '/forum',
          title: 'Provjeri što pita zajednica',
          description: 'Iskustva i praktični odgovori od drugih vlasnika ljubimaca.',
          badge: 'Forum',
        },
      ];
  }
}
