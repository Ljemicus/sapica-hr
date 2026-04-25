import { htmlResponse, staticHtml } from '@/lib/static-public-html';

export const dynamic = 'force-static';
export const revalidate = 300;

export function GET() {
  return htmlResponse(staticHtml({
    title: 'PetPark — pouzdani sitteri u vašem kvartu',
    description: 'Zagreb, beta. Pronađite čuvara, šetača ili boarding za svog ljubimca — bez izmišljenih brojki.',
    canonical: 'https://petpark.hr/',
    kicker: 'PetPark Hrvatska',
    heading: 'Pouzdani sitteri u vašem kvartu.',
    body: 'Zagreb, beta. Brza, jednostavna i iskrena pretraga provjerenih profila za brigu o ljubimcima.',
    primaryHref: '/pretraga',
    primaryLabel: 'Pronađi sittera',
    secondaryHref: '/postani-sitter',
    secondaryLabel: 'Postani partner',
    cards: [
      { title: 'Provjereni profili', body: 'Objavljujemo samo profile koji prolaze provjeru prije prikaza.', href: '/pretraga' },
      { title: 'Zagreb beta', body: 'Fokus je na stvarnom tržištu i korisnom inventoryju, bez napuhanih KPI tvrdnji.', href: '/pretraga' },
      { title: 'Za vlasnike i partnere', body: 'Jednostavan ulaz za vlasnike ljubimaca i nove sittere.', href: '/postani-sitter' },
    ],
  }), 300);
}
