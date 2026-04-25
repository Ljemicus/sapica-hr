import { htmlResponse, staticHtml } from '@/lib/static-public-html';

export const dynamic = 'force-static';
export const revalidate = 60;

export function GET() {
  return htmlResponse(staticHtml({
    title: 'Find pet sitters and services | PetPark',
    description: 'Browse verified pet sitters, groomers, and trainers. Zagreb beta, honest inventory only.',
    canonical: 'https://petpark.hr/pretraga/en',
    kicker: 'Search',
    heading: 'Find the right care for your pet.',
    body: 'PetPark shows reviewed profiles and a simple path to booking. The beta focuses on real supply.',
    primaryHref: '/registracija',
    primaryLabel: 'Start search',
    secondaryHref: '/postani-sitter',
    secondaryLabel: 'Join as partner',
  }), 60);
}
