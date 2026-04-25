import { htmlResponse, staticHtml } from '@/lib/static-public-html';

export const dynamic = 'force-static';
export const revalidate = 3600;

export function GET() {
  return htmlResponse(staticHtml({
    title: 'Blog — savjeti za vlasnike ljubimaca | PetPark',
    description: 'Korisni članci o zdravlju, prehrani, šetnji, školovanju pasa i boljoj brizi za ljubimce.',
    canonical: 'https://petpark.hr/blog',
    kicker: 'Blog',
    heading: 'Savjeti za vlasnike ljubimaca.',
    body: 'Kratki vodiči i korisni članci za odgovorne vlasnike — bez teškog app shella na početnom učitavanju.',
    primaryHref: '/blog/setnja-psa-kompletni-vodic',
    primaryLabel: 'Pročitaj vodič',
    secondaryHref: '/pretraga',
    secondaryLabel: 'Pronađi uslugu',
    cards: [
      { title: 'Šetnja psa', body: 'Koliko, kada i kako šetati psa kroz dan.', href: '/blog/setnja-psa-kompletni-vodic' },
      { title: 'Prehrana', body: 'Praktični savjeti za bolju prehranu ljubimaca.', href: '/blog/domaca-hrana-za-pse-recepti' },
      { title: 'Sigurnost', body: 'Sezonske opasnosti i prevencija za ljubimce.', href: '/blog/proljetne-opasnosti-za-ljubimce' },
    ],
  }), 3600);
}
