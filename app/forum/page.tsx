import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquare, BookOpen, Users } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

export function buildForumMetadata(lang: string = 'hr'): Metadata {
  const titles: Record<string, string> = {
    hr: 'Forum za vlasnike ljubimaca | PetPark',
    en: 'Pet Owner Forum | PetPark',
  };

  const descriptions: Record<string, string> = {
    hr: 'PetPark forum okuplja vlasnike ljubimaca za pitanja, savjete, iskustva i rasprave o svakodnevnom životu sa psima i mačkama.',
    en: 'PetPark forum brings pet owners together for questions, advice, experiences, and discussions about everyday life with pets.',
  };

  return {
    title: { absolute: titles[lang] || titles.hr },
    description: descriptions[lang] || descriptions.hr,
    alternates: {
      canonical: lang === 'en' ? 'https://petpark.hr/forum/en' : 'https://petpark.hr/forum',
    },
  };
}

export const metadata: Metadata = buildForumMetadata('hr');

const cards = [
  {
    title: 'Pitanja i savjeti',
    description: 'Pronađi odgovore o ponašanju, zdravlju, prehrani i svakodnevnoj brizi za ljubimce.',
    href: '/blog',
    icon: MessageSquare,
  },
  {
    title: 'Zajednica',
    description: 'Istraži PetPark zajednicu, priče, vodiče i sadržaj za vlasnike ljubimaca.',
    href: '/zajednica',
    icon: Users,
  },
  {
    title: 'Blog i vodiči',
    description: 'Provjeri uređene članke i praktične vodiče dok forum teme postupno širimo.',
    href: '/blog',
    icon: BookOpen,
  },
];

export default function ForumPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Forum', href: '/forum' }]} />
      <main className="container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20">
        <section className="max-w-3xl mb-10 md:mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600 mb-3">PetPark Forum</p>
          <h1 className="text-4xl md:text-5xl font-extrabold font-[var(--font-heading)] tracking-tight text-slate-900 mb-4">
            Forum za vlasnike ljubimaca
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Mjesto za pitanja, razmjenu iskustava i korisne rasprave o životu s ljubimcima. Dok širimo pune forum funkcije, ovdje možeš doći do najvažnijih PetPark sadržaja i tema zajednice.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href + card.title}
                href={card.href}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Icon className="h-6 w-6 text-orange-600 mb-4" />
                <h2 className="text-2xl font-bold font-[var(--font-heading)] text-slate-900 mb-3">{card.title}</h2>
                <p className="text-slate-600 leading-relaxed">{card.description}</p>
              </Link>
            );
          })}
        </section>
      </main>
    </>
  );
}
