import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PetParkBadge } from './pp-badge';
import { PriceRange } from './price-range';
import { RatingSummary } from './rating-summary';

type ServiceListingCardVariant = 'grooming' | 'trainer' | 'sitter';

type ServiceListingCardProps = {
  name: string;
  city: string;
  description?: string;
  href: string;
  initials?: string;
  serviceTags?: string[];
  metaTags?: string[];
  verified?: boolean;
  rating?: number | null;
  reviewCount?: number | null;
  priceFrom?: number | string | null;
  priceLabel?: string;
  priceFallbackLabel?: string;
  noReviewsLabel?: string;
  reviewsLabel?: string;
  priceTitle?: string;
  verifiedLabel?: string;
  ctaLabel: string;
  categoryLabel: string;
  responseLabel?: string;
  variant?: ServiceListingCardVariant;
  className?: string;
};

const variantStyles: Record<ServiceListingCardVariant, { avatar: string; badge: 'grooming' | 'trainer' | 'sitter'; cta: string; border: string }> = {
  grooming: {
    avatar: 'bg-[color:var(--pp-grooming-bg)] text-[color:var(--pp-grooming-accent)]',
    badge: 'grooming',
    cta: 'text-[color:var(--pp-grooming-accent)]',
    border: 'hover:border-[color:var(--pp-grooming-accent)]/35',
  },
  trainer: {
    avatar: 'bg-[color:var(--pp-trainer-bg)] text-[color:var(--pp-trainer-accent)]',
    badge: 'trainer',
    cta: 'text-[color:var(--pp-trainer-accent)]',
    border: 'hover:border-[color:var(--pp-trainer-accent)]/35',
  },
  sitter: {
    avatar: 'bg-[color:var(--pp-sitter-bg)] text-[color:var(--pp-sitter-accent)]',
    badge: 'sitter',
    cta: 'text-[color:var(--pp-sitter-accent)]',
    border: 'hover:border-[color:var(--pp-sitter-accent)]/35',
  },
};

function makeInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function ServiceListingCard({
  name,
  city,
  description,
  href,
  initials,
  serviceTags = [],
  metaTags = [],
  verified,
  rating,
  reviewCount,
  priceFrom,
  priceLabel = 'od',
  priceFallbackLabel = 'Cijena po dogovoru',
  noReviewsLabel = 'Novo na PetParku · još nema recenzija',
  reviewsLabel = 'Recenzije',
  priceTitle = 'Cijena',
  verifiedLabel = 'Verificirano',
  ctaLabel,
  categoryLabel,
  responseLabel,
  variant = 'grooming',
  className,
}: ServiceListingCardProps) {
  const styles = variantStyles[variant];

  return (
    <article
      className={cn(
        'group flex h-full flex-col rounded-[var(--pp-radius-32)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] p-5 shadow-[var(--pp-shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--pp-shadow-soft)]',
        styles.border,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--pp-radius-20)] text-lg font-black', styles.avatar)} aria-hidden="true">
            {initials || makeInitials(name)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--pp-muted)]">{city}</p>
            <h3 className="font-heading text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-ink)]">{name}</h3>
          </div>
        </div>
        {verified ? <PetParkBadge variant="verified">{verifiedLabel}</PetParkBadge> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <PetParkBadge variant={styles.badge}>{categoryLabel}</PetParkBadge>
        {metaTags.map((tag) => (
          <PetParkBadge key={tag} variant="available">{tag}</PetParkBadge>
        ))}
      </div>

      {description ? <p className="mt-4 flex-1 text-sm leading-6 text-[color:var(--pp-muted)]">{description}</p> : <div className="flex-1" />}

      {serviceTags.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {serviceTags.map((tag) => (
            <span key={tag} className="rounded-[var(--pp-radius-pill)] bg-[color:var(--pp-cream)] px-3 py-1 text-xs font-extrabold text-[color:var(--pp-muted)]">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 rounded-[var(--pp-radius-24)] bg-[color:var(--pp-cream)] p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--pp-muted)]">{reviewsLabel}</p>
          <RatingSummary rating={rating} reviewCount={reviewCount} newLabel={noReviewsLabel} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--pp-muted)]">{priceTitle}</p>
          <PriceRange priceFrom={priceFrom} label={priceLabel} fallbackLabel={priceFallbackLabel} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[color:var(--pp-line)] pt-4">
        {responseLabel ? <span className="text-xs font-bold text-[color:var(--pp-muted)]">{responseLabel}</span> : <span />}
        <Link
          href={href}
          prefetch={false}
          className={cn('inline-flex min-h-11 items-center justify-center rounded-[var(--pp-radius-pill)] px-4 text-sm font-black transition hover:bg-[color:var(--pp-cream)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)] focus-visible:ring-offset-2', styles.cta)}
        >
          {ctaLabel}
          <span aria-hidden="true" className="ml-1 transition group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </article>
  );
}
