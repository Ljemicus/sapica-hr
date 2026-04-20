import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

export const metadata: Metadata = {
  title: { absolute: 'Zajednica ljubitelja ljubimaca | PetPark' },
  description: 'PetPark zajednica okuplja vlasnike, sittere, groomere, trenere i sve ljubitelje ljubimaca na jednom mjestu.',
  alternates: {
    canonical: 'https://petpark.hr/zajednica',
  },
};

const sections = [
  {
    title: 'Savjeti i priče',
    description: 'Blog članci, iskustva i korisni savjeti za svakodnevni život s ljubimcima.',
    href: '/blog',
  },
  {
    title: 'Feed zajednice',
    description: 'Pratite objave, novosti i sadržaj iz PetPark zajednice.',
    href: '/zajednica/feed',
  },
  {
    title: 'Izazovi',
    description: 'Sudjelujte u zabavnim izazovima i aktivnostima za ljubimce i njihove vlasnike.',
    href: '/zajednica/izazovi',
  },
  {
    title: 'Najbolji',
    description: 'Pogledajte istaknute profile, objave i favorite zajednice.',
    href: '/zajednica/najbolji',
  },
];

export default function ZajednicaPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Zajednica', href: '/zajednica' }]} />
      <main className="container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20">
        <section className="max-w-3xl mb-10 md:mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600 mb-3">PetPark Community</p>
          <h1 className="text-4xl md:text-5xl font-extrabold font-[var(--font-heading)] tracking-tight text-slate-900 mb-4">
            Zajednica ljubitelja ljubimaca
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Mjesto za vlasnike, sittere, groomere, trenere i sve koji žele pratiti korisne savjete, dijeliti iskustva i otkriti što se događa u PetPark zajednici.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <h2 className="text-2xl font-bold font-[var(--font-heading)] text-slate-900 mb-3">{section.title}</h2>
              <p className="text-slate-600 leading-relaxed">{section.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </>
  );
}
