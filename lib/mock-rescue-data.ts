export interface RescueOrganization {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string;
  summary: string;
  mission: string;
  supportFocus: string[];
  helpTypes: string[];
  intakeNotes: string[];
  contactEmail: string;
  websiteLabel?: string;
  websiteUrl?: string;
}

export type RescueAppealStatus = 'open' | 'planning' | 'fulfilled';
export type RescueAppealUrgency = 'high' | 'medium' | 'low';

export interface RescueAppeal {
  id: string;
  slug: string;
  organizationSlug: string;
  title: string;
  summary: string;
  description: string;
  category: 'medical' | 'supplies' | 'transport' | 'foster';
  urgency: RescueAppealUrgency;
  status: RescueAppealStatus;
  updatedAt: string;
  needs: string[];
  nextSteps: string[];
}

export const rescueOrganizations: RescueOrganization[] = [
  {
    id: 'org-sapice-kvarner',
    slug: 'sapice-kvarner',
    name: 'Šapice Kvarner',
    city: 'Rijeka',
    region: 'Kvarner',
    summary: 'Lokalna rescue udruga fokusirana na hitne slučajeve, privremeni smještaj i pripremu pasa i mačaka za sigurno udomljenje.',
    mission: 'Pomažemo životinjama koje dolaze iz napuštanja, loših uvjeta ili veterinarski zahtjevnih situacija. Fokus nam je stabilizacija, siguran privremeni smještaj i odgovorno spajanje sa stalnim domom.',
    supportFocus: ['hitni veterinarski slučajevi', 'privremeni smještaj', 'priprema za udomljenje'],
    helpTypes: ['donacije opreme', 'troškovi veterine', 'foster mreža', 'prijevoz do ambulante'],
    intakeNotes: ['Prvo procjenjujemo hitnost i mogućnost smještaja.', 'Za udomljenje tražimo razgovor i osnovnu provjeru uvjeta.'],
    contactEmail: 'rescue@sapicekvarner.hr',
    websiteLabel: 'Instagram profil',
    websiteUrl: 'https://www.instagram.com/',
  },
  {
    id: 'org-novi-pocetak-zagreb',
    slug: 'novi-pocetak-zagreb',
    name: 'Novi Početak Zagreb',
    city: 'Zagreb',
    region: 'Središnja Hrvatska',
    summary: 'Mreža volontera koja koordinira rescue slučajeve, foster domove i pripremu životinja za put u stalni dom.',
    mission: 'Radimo s manjim timom i vanjskim partnerima kako bismo životinjama osigurali siguran oporavak, osnovnu veterinarsku obradu i transparentan put prema udomljenju.',
    supportFocus: ['foster koordinacija', 'ambulantni oporavak', 'rescue logistika'],
    helpTypes: ['pelene i podlošci', 'starter paketi hrane', 'gorivo i transport', 'volonterska pomoć'],
    intakeNotes: ['Novi slučajevi ovise o raspoloživim foster mjestima.', 'Apelacije objavljujemo samo za konkretne potrebe koje aktivno rješavamo.'],
    contactEmail: 'tim@novipocetak.hr',
  },
  {
    id: 'org-mirna-lapa-split',
    slug: 'mirna-lapa-split',
    name: 'Mirna Lapa Split',
    city: 'Split',
    region: 'Dalmacija',
    summary: 'Udruga koja pomaže životinjama nakon spašavanja s fokusem na oporavak, socijalizaciju i odgovorno udomljenje.',
    mission: 'Posebno pomažemo životinjama koje nakon spašavanja trebaju vrijeme, rutinu i sigurnost prije nego budu spremne za novi dom.',
    supportFocus: ['oporavak nakon spašavanja', 'socijalizacija', 'odgovorno udomljenje'],
    helpTypes: ['medicinska prehrana', 'dekice i ležajevi', 'oglašavanje udomljenja', 'foster vikendi'],
    intakeNotes: ['Prioritet dajemo slučajevima gdje možemo osigurati kontinuitet skrbi.', 'Ne obećavamo kapacitete koje nemamo — radije sporije nego neodgovorno.'],
    contactEmail: 'pomoc@mirnalapa.hr',
  },
];

export const rescueAppeals: RescueAppeal[] = [
  {
    id: 'appeal-luna-oporavak',
    slug: 'luna-oporavak-nakon-operacije',
    organizationSlug: 'sapice-kvarner',
    title: 'Luna treba miran oporavak nakon operacije',
    summary: 'Tražimo podršku za postoperativnu njegu, kontrolne preglede i privremeni foster bez stepenica.',
    description: 'Luna je stabilno nakon zahvata, ali sljedećih nekoliko tjedana treba rutinu, kontrolirane izlaske i logistiku oko pregleda. Ova apelacija je pripremna shell stranica za budući donation flow — trenutno služi za pregled potreba i konteksta.',
    category: 'medical',
    urgency: 'high',
    status: 'open',
    updatedAt: '2026-04-04',
    needs: ['kontrolni pregled i terapija', 'miran foster prostor', 'zaštitni ovratnik i podloge'],
    nextSteps: ['povezati donation modul kad Lane 1 isporuči backend entitete', 'dodati stvarni timeline promjena i update feed'],
  },
  {
    id: 'appeal-starter-paketi',
    slug: 'starter-paketi-za-nove-fostere',
    organizationSlug: 'novi-pocetak-zagreb',
    title: 'Starter paketi za nove foster domove',
    summary: 'Treba nam osnovna oprema kako bi novi foster domovi mogli preuzeti životinju bez improvizacije prvog dana.',
    description: 'Kad se otvori novo foster mjesto, najviše pomaže spreman paket: hrana za prve dane, podlošci, zdjelice, povodac i osnovna higijena. Ovdje zasad prikazujemo strukturu apelacije, bez lažnih iznosa i bez checkout toka.',
    category: 'supplies',
    urgency: 'medium',
    status: 'open',
    updatedAt: '2026-04-03',
    needs: ['početna hrana za 7 dana', 'zdjelice i ležaj', 'podlošci i sredstva za čišćenje'],
    nextSteps: ['dodati povezivanje sa skladišnim artiklima ili wish-list modelom', 'spojiti ownership i permissions na rescue dashboard'],
  },
  {
    id: 'appeal-jadran-transport',
    slug: 'transport-do-specijalista-za-jadrana',
    organizationSlug: 'mirna-lapa-split',
    title: 'Prijevoz Jadrana do specijalista',
    summary: 'Treba koordinirati prijevoz, termin i osobu za pratnju do pregleda izvan grada.',
    description: 'Neki slučajevi nisu stvar samo novca nego logistike. Ova apelacija pokriva transportni scenarij: tko vozi, kada je termin i što je sve potrebno pripremiti prije puta.',
    category: 'transport',
    urgency: 'medium',
    status: 'planning',
    updatedAt: '2026-04-02',
    needs: ['vozač za termin', 'transporter ili sigurnosni pojas', 'koordinacija s ambulantom'],
    nextSteps: ['uvesti statusne promjene iz stvarnog sustava apelacija', 'dodati kontakt workflow za volontere'],
  },
];

export function getRescueOrganizations() {
  return rescueOrganizations;
}

export function getRescueOrganization(slug: string) {
  return rescueOrganizations.find((organization) => organization.slug === slug) ?? null;
}

export function getRescueAppeals() {
  return rescueAppeals;
}

export function getRescueAppeal(slug: string) {
  return rescueAppeals.find((appeal) => appeal.slug === slug) ?? null;
}

export function getRescueAppealsByOrganization(organizationSlug: string) {
  return rescueAppeals.filter((appeal) => appeal.organizationSlug === organizationSlug);
}

export function getRescueOrganizationByAppeal(appeal: RescueAppeal) {
  return getRescueOrganization(appeal.organizationSlug);
}
