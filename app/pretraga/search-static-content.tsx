import Link from 'next/link';
import type { UnifiedProvider } from './types';
import { CATEGORY_BADGE_STYLES, CATEGORY_EMOJI, CATEGORY_LABELS } from './types';

export function SearchStaticContent({ providers }: { providers: UnifiedProvider[] }) {
  return (
    <div>
      <section className="relative browse-hero-gradient overflow-hidden">
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-8 md:py-24 relative">
          <div className="max-w-2xl">
            <p className="section-kicker">Pretraga</p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] mb-3 md:mb-6 font-[var(--font-heading)]">
              Pronađite pravu brigu za svog ljubimca.
            </h1>
            <p className="hidden md:block text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
              Pretražite verificirane sittere, groomere i trenere. Svaki profil je provjeren prije objave.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 md:px-10 lg:px-16 py-8 md:py-12">
        <div className="hidden md:flex mb-6 flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-warm-orange">{providers.length} profila odgovara</p>
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)]">Dostupni profili</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link prefetch={false} href="/pretraga?category=sitter" className="filter-pill bg-white border border-border/40">🐾 Sitteri</Link>
            <Link prefetch={false} href="/pretraga?category=grooming" className="filter-pill bg-white border border-border/40">✂️ Grooming</Link>
            <Link prefetch={false} href="/pretraga?category=dresura" className="filter-pill bg-white border border-border/40">🎓 Dresura</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {providers.map((provider) => (
            <Link prefetch={false} key={provider.id} href={provider.profileUrl} className="group block h-full">
              <article className="community-section-card h-full overflow-hidden">
                <div className="relative h-32 md:h-40 bg-gradient-to-br from-orange-300 to-teal-300 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full border-4 border-white bg-white text-gray-700 shadow-xl flex items-center justify-center text-2xl font-bold">
                    {provider.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${CATEGORY_BADGE_STYLES[provider.category]}`}>
                    {CATEGORY_EMOJI[provider.category]} {CATEGORY_LABELS[provider.category]}
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg font-[var(--font-heading)] group-hover:text-warm-orange">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">{provider.city || 'Hrvatska'}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700">
                      ★ {provider.rating.toFixed(1)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{provider.bio || 'Provjeren profil za brigu o ljubimcima.'}</p>
                  <div className="flex items-center justify-between border-t border-border/40 pt-3 text-sm">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">Verificiran</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-warm-orange">Pogledaj →</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
