import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PetParkBadge } from './pp-badge';

type BlogCardProps = {
  title: string;
  excerpt?: string;
  href: string;
  imageUrl?: string | null;
  categoryLabel?: string;
  readingTime?: string;
  className?: string;
};

export function BlogCard({ title, excerpt, href, imageUrl, categoryLabel = 'Vodič', readingTime, className }: BlogCardProps) {
  return (
    <Link href={href} prefetch={false} className={cn('group block overflow-hidden rounded-[var(--pp-radius-32)] border border-[color:var(--pp-line)] bg-[color:var(--pp-surface)] shadow-[var(--pp-shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--pp-shadow-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)]', className)}>
      <div className="min-h-44 bg-[color:var(--pp-community-bg)] bg-cover bg-center" style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined} aria-hidden="true" />
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <PetParkBadge variant="community">{categoryLabel}</PetParkBadge>
          {readingTime ? <span className="text-xs font-bold text-[color:var(--pp-muted)]">{readingTime}</span> : null}
        </div>
        <h3 className="font-heading text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-ink)]">{title}</h3>
        {excerpt ? <p className="line-clamp-3 leading-7 text-[color:var(--pp-muted)]">{excerpt}</p> : null}
      </div>
    </Link>
  );
}
