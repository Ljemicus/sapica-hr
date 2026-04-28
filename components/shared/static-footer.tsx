import Link from 'next/link';
import { BrandLogo } from '@/components/shared/brand-logo';

const footerColumns = [
  {
    title: 'PetPark',
    links: [
      { href: '/o-nama', label: 'O nama' },
      { href: '/faq', label: 'Kako funkcionira' },
      { href: '/verifikacija', label: 'Sigurnost' },
      { href: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Usluge',
    links: [
      { href: '/pretraga?category=sitter', label: 'Sitteri' },
      { href: '/njega', label: 'Groomeri' },
      { href: '/dresura', label: 'Treneri' },
      { href: '/izgubljeni', label: 'Izgubljeni ljubimci' },
    ],
  },
  {
    title: 'Podrška',
    links: [
      { href: '/faq', label: 'Pomoć / FAQ' },
      { href: '/kontakt', label: 'Kontakt' },
      { href: '/uvjeti', label: 'Uvjeti korištenja' },
      { href: '/privatnost', label: 'Politika privatnosti' },
    ],
  },
];

export function StaticFooter() {
  return (
    <footer className="border-t border-[color:var(--pp-forest-soft)] bg-[color:var(--pp-forest-dark)] text-[color:var(--pp-cream)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr_1fr]">
          <section aria-label="PetPark sažetak" className="space-y-5">
            <Link
              prefetch={false}
              href="/"
              aria-label="PetPark početna"
              className="inline-flex rounded-[var(--pp-radius-pill)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--pp-forest-dark)]"
            >
              <BrandLogo size="md" theme="dark" />
            </Link>
            <p className="max-w-sm text-sm leading-6 text-[color:var(--pp-sand)]">
              PetPark je marketplace i zajednica za ljude koji vole životinje.
            </p>
            <div className="inline-flex rounded-[var(--pp-radius-pill)] border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-[color:var(--pp-logo-yellow)]">
              Hrvatska platforma za brigu o ljubimcima
            </div>
          </section>

          <nav className="grid gap-8 sm:grid-cols-3" aria-label="Footer navigacija">
            {footerColumns.map((column) => (
              <div key={column.title} className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--pp-logo-yellow)]">
                  {column.title}
                </h2>
                <ul className="space-y-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        prefetch={false}
                        href={link.href}
                        className="text-[color:var(--pp-sand)] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-yellow)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <section aria-labelledby="footer-updates-title" className="rounded-[var(--pp-radius-24)] border border-white/10 bg-white/[0.06] p-5 shadow-[var(--pp-shadow-card)]">
            <h2 id="footer-updates-title" className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--pp-logo-yellow)]">
              Budi u tijeku
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--pp-sand)]">
              Novosti o sitterima, grooming partnerima i korisnim PetPark vodičima uskoro stižu ovdje.
            </p>
            <div className="mt-5 rounded-[var(--pp-radius-pill)] border border-white/10 bg-[color:var(--pp-warm-white)]/10 px-4 py-3 text-sm text-[color:var(--pp-sand)]" aria-label="Newsletter placeholder">
              Newsletter uskoro
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[color:var(--pp-sand)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PetPark. Sva prava pridržana.</p>
          <p>Made for pet people, with care.</p>
        </div>
      </div>
    </footer>
  );
}
