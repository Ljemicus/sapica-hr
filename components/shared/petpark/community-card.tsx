import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PetParkBadge } from './pp-badge';

type CommunityCardProps = {
  title: string;
  description?: string;
  href: string;
  badgeLabel?: string;
  icon?: ReactNode;
  className?: string;
};

export function CommunityCard({ title, description, href, badgeLabel = 'Zajednica', icon, className }: CommunityCardProps) {
  return (
    <Link href={href} prefetch={false} className={cn('group block rounded-[var(--pp-radius-32)] border border-[color:var(--pp-community-accent)]/20 bg-[color:var(--pp-community-bg)] p-5 shadow-[var(--pp-shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--pp-shadow-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-community-accent)]', className)}>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[var(--pp-radius-20)] bg-white/55 text-2xl text-[color:var(--pp-community-accent)]" aria-hidden="true">{icon ?? '✦'}</div>
      <PetParkBadge variant="community">{badgeLabel}</PetParkBadge>
      <h3 className="mt-3 font-heading text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-ink)]">{title}</h3>
      {description ? <p className="mt-2 leading-7 text-[color:var(--pp-muted)]">{description}</p> : null}
    </Link>
  );
}
