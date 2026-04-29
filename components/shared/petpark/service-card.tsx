import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { PetParkCategory } from './types';
import { categoryStyles } from './types';
import { PetParkBadge } from './pp-badge';

type ServiceCardProps = {
  title: string;
  description: string;
  href: string;
  category: PetParkCategory;
  statusLabel?: string;
  icon?: ReactNode;
  ctaLabel?: string;
  className?: string;
};

export function ServiceCard({ title, description, href, category, statusLabel, icon, ctaLabel = 'Saznaj više', className }: ServiceCardProps) {
  const styles = categoryStyles[category];

  return (
    <Link
      href={href}
      prefetch={false}
      className={cn('group block rounded-[var(--pp-radius-32)] border border-[color:var(--pp-line)] bg-[color:var(--pp-surface)] p-5 shadow-[var(--pp-shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--pp-shadow-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)]', className)}
    >
      <div className={cn('mb-5 flex h-14 w-14 items-center justify-center rounded-[var(--pp-radius-20)] text-2xl', styles.bg, styles.accent)} aria-hidden={!icon}>
        {icon ?? '🐾'}
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-ink)]">{title}</h3>
          {statusLabel ? <PetParkBadge variant={category === 'lost' ? 'urgent' : 'available'}>{statusLabel}</PetParkBadge> : null}
        </div>
        <p className="leading-7 text-[color:var(--pp-muted)]">{description}</p>
        <span className={cn('inline-flex text-sm font-extrabold transition group-hover:translate-x-1', styles.accent)}>{ctaLabel} →</span>
      </div>
    </Link>
  );
}
