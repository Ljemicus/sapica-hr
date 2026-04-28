import Link from 'next/link';
import { BrandLogo } from '@/components/shared/brand-logo';

const navItems = [
  { href: '/o-nama', label: 'O nama' },
  { href: '/pretraga', label: 'Usluge' },
  { href: '/zajednica', label: 'Zajednica' },
  { href: '/izgubljeni', label: 'Izgubljeni', highlight: true },
  { href: '/prijava', label: 'Prijava' },
];

export function StaticNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)]/92 shadow-[var(--pp-shadow-soft)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color:var(--pp-warm-white)]/86">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link
          prefetch={false}
          href="/"
          className="group inline-flex shrink-0 rounded-[var(--pp-radius-pill)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--pp-warm-white)]"
          aria-label="PetPark početna"
        >
          <BrandLogo size="md" className="transition-transform duration-200 group-hover:scale-[1.02]" />
        </Link>

        <nav
          className="order-3 flex w-full flex-wrap items-center gap-2 lg:order-2 lg:w-auto lg:flex-1 lg:justify-end"
          aria-label="Glavna navigacija"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              prefetch={false}
              href={item.href}
              className={item.highlight
                ? 'inline-flex items-center justify-center rounded-[var(--pp-radius-pill)] border border-[color:var(--pp-lost-accent)]/20 bg-[color:var(--pp-lost-bg)] px-3 py-2 text-xs font-extrabold text-[color:var(--pp-lost-accent)] transition hover:-translate-y-0.5 hover:shadow-[var(--pp-shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-lost-accent)] sm:px-4 sm:text-sm'
                : 'inline-flex items-center justify-center rounded-[var(--pp-radius-pill)] px-3 py-2 text-xs font-extrabold text-[color:var(--pp-muted)] transition hover:bg-white/70 hover:text-[color:var(--pp-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)] sm:px-4 sm:text-sm'}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          prefetch={false}
          href="/pretraga"
          className="order-2 inline-flex shrink-0 items-center justify-center rounded-[var(--pp-radius-pill)] bg-[color:var(--pp-forest)] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(14,83,56,.22)] transition hover:-translate-y-0.5 hover:bg-[color:var(--pp-forest-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--pp-warm-white)] lg:order-3"
        >
          Pronađi uslugu
        </Link>
      </div>
    </header>
  );
}
