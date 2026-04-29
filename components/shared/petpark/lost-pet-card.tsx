import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PetParkBadge } from './pp-badge';

type LostPetCardProps = {
  name: string;
  location?: string;
  lastSeen?: string;
  imageUrl?: string | null;
  statusLabel?: string;
  href: string;
  description?: string;
  className?: string;
};

export function LostPetCard({ name, location, lastSeen, imageUrl, statusLabel = 'Nestao ljubimac', href, description, className }: LostPetCardProps) {
  return (
    <Link href={href} prefetch={false} className={cn('group block overflow-hidden rounded-[var(--pp-radius-32)] border border-[color:var(--pp-lost-accent)]/20 bg-[color:var(--pp-surface)] shadow-[var(--pp-shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--pp-shadow-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-lost-accent)]', className)}>
      <div className="min-h-52 bg-[color:var(--pp-lost-bg)] bg-cover bg-center" style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}>
        {!imageUrl ? <div className="flex min-h-52 items-center justify-center text-5xl" aria-hidden="true">🐾</div> : null}
      </div>
      <div className="space-y-3 p-5">
        <PetParkBadge variant="urgent">{statusLabel}</PetParkBadge>
        <h3 className="font-heading text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-ink)]">{name}</h3>
        {description ? <p className="line-clamp-2 leading-7 text-[color:var(--pp-muted)]">{description}</p> : null}
        <div className="space-y-1 text-sm font-bold text-[color:var(--pp-muted)]">
          {location ? <p>{location}</p> : null}
          {lastSeen ? <p>Zadnje viđen: {lastSeen}</p> : null}
        </div>
      </div>
    </Link>
  );
}
