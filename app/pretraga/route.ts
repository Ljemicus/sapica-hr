import { htmlResponse, staticHtml } from '@/lib/static-public-html';
import { getUnifiedProviders } from '@/lib/search/providers';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  const providers = await getUnifiedProviders({ city: 'Zagreb', category: 'sitter' });
  const providerCards = providers.map((provider) => ({
    title: provider.name,
    body: `${provider.city || 'Zagreb'} · ${provider.services.slice(0, 3).join(', ') || 'sitting'} · ${provider.rating.toFixed(1)} (${provider.reviews})`,
    href: provider.profileUrl,
  }));

  return htmlResponse(staticHtml({
    title: 'Pretraga sittera i usluga za ljubimce | PetPark',
    description: 'Pretražite provjerene sittere, groomere i trenere za ljubimce. Zagreb beta, stvarni profili bez izmišljenog inventoryja.',
    canonical: 'https://petpark.hr/pretraga',
    kicker: 'Pretraga',
    heading: 'Pronađite pravu brigu za svog ljubimca.',
    body: providers.length >= 5
      ? 'Zagreb Tier A profili su dostupni za sitting, boarding, walking i daycare.'
      : 'Zagreb beta je u tijeku. Ako ne vidiš dovoljno dostupnih profila, ostavi interes i javimo se.',
    primaryHref: '/registracija',
    primaryLabel: 'Kreni s pretragom',
    secondaryHref: '/postani-sitter',
    secondaryLabel: 'Prijavi profil',
    cards: providerCards.length ? providerCards : [
      { title: 'Sitteri Zagreb', body: 'Čuvanje, šetanje i boarding za ljubimce. Otvaramo dostupnost po kvartovima.', href: '/postani-sitter' },
    ],
    waitlist: providerCards.length < 5,
  }), 60);
}
