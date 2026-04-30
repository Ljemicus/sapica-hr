import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PetParkBadge } from './pp-badge';
import { PriceRange } from './price-range';
import { RatingSummary } from './rating-summary';
import type { ListingPreviewProvider } from './listing-preview-data';

type ListingProviderCardProps = {
  provider: ListingPreviewProvider;
  className?: string;
};

const accentClasses = {
  grooming: {
    ring: 'bg-[color:var(--pp-grooming-bg)] text-[color:var(--pp-grooming-accent)]',
    border: 'hover:border-[color:var(--pp-grooming-accent)]/35',
    cta: 'text-[color:var(--pp-grooming-accent)]',
    badge: 'grooming' as const,
  },
  training: {
    ring: 'bg-[color:var(--pp-trainer-bg)] text-[color:var(--pp-trainer-accent)]',
    border: 'hover:border-[color:var(--pp-trainer-accent)]/35',
    cta: 'text-[color:var(--pp-trainer-accent)]',
    badge: 'trainer' as const,
  },
};

export function ListingProviderCard({ provider, className }: ListingProviderCardProps) {
  const accent = accentClasses[provider.kind];
  const initials = provider.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={cn(
        'group flex h-full flex-col rounded-[var(--pp-radius-32)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] p-5 shadow-[var(--pp-shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--pp-shadow-soft)]',
        accent.border,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-14 w-14 items-center justify-center rounded-[var(--pp-radius-20)] text-lg font-black', accent.ring)} aria-hidden="true">
            {initials}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--pp-muted)]">{provider.city}</p>
            <h3 className="font-heading text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-ink)]">{provider.name}</h3>
          </div>
        </div>
        {provider.verified ? <PetParkBadge variant="verified">Verificiran</PetParkBadge> : null}
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-[color:var(--pp-muted)]">{provider.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {provider.services.map((service) => (
          <span key={service} className="rounded-[var(--pp-radius-pill)] bg-[color:var(--pp-cream)] px-3 py-1 text-xs font-extrabold text-[color:var(--pp-muted)]">
            {service}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 rounded-[var(--pp-radius-24)] bg-[color:var(--pp-cream)] p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--pp-muted)]">Recenzije</p>
          <RatingSummary rating={provider.rating} reviewCount={provider.reviewCount} newLabel="Novo na PetParku · još nema recenzija" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--pp-muted)]">Cijena</p>
          <PriceRange priceFrom={provider.priceFrom} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {provider.badges.map((badge) => (
          <PetParkBadge key={badge} variant={accent.badge}>{badge}</PetParkBadge>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[color:var(--pp-line)] pt-4">
        <span className="text-xs font-bold text-[color:var(--pp-muted)]">{provider.responseLabel}</span>
        <Link
          href={provider.profileHref}
          prefetch={false}
          className={cn('inline-flex min-h-11 items-center justify-center rounded-[var(--pp-radius-pill)] px-4 text-sm font-black transition hover:bg-[color:var(--pp-cream)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)] focus-visible:ring-offset-2', accent.cta)}
        >
          Otvori
          <span aria-hidden="true" className="ml-1 transition group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </article>
  );
}
