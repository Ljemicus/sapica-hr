import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PetParkBadgeVariant =
  | 'verified'
  | 'new'
  | 'available'
  | 'comingSoon'
  | 'urgent'
  | 'community'
  | 'sitter'
  | 'grooming'
  | 'trainer'
  | 'lost'
  | 'vet'
  | 'adoption'
  | 'breeder';

type PetParkBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: PetParkBadgeVariant;
  children: ReactNode;
};

const badgeClasses: Record<PetParkBadgeVariant, string> = {
  verified: 'border-[color:var(--pp-trainer-accent)]/20 bg-[color:var(--pp-trainer-bg)] text-[color:var(--pp-trainer-accent)]',
  new: 'border-[color:var(--pp-logo-yellow)]/30 bg-[color:var(--pp-community-bg)] text-[color:var(--pp-community-accent)]',
  available: 'border-[color:var(--pp-sitter-accent)]/25 bg-[color:var(--pp-sitter-bg)] text-[color:var(--pp-sitter-accent)]',
  comingSoon: 'border-[color:var(--pp-line)] bg-[color:var(--pp-cream)] text-[color:var(--pp-muted)]',
  urgent: 'border-[color:var(--pp-lost-accent)]/25 bg-[color:var(--pp-lost-bg)] text-[color:var(--pp-lost-accent)]',
  community: 'border-[color:var(--pp-community-accent)]/25 bg-[color:var(--pp-community-bg)] text-[color:var(--pp-community-accent)]',
  sitter: 'border-[color:var(--pp-sitter-accent)]/25 bg-[color:var(--pp-sitter-bg)] text-[color:var(--pp-sitter-accent)]',
  grooming: 'border-[color:var(--pp-grooming-accent)]/25 bg-[color:var(--pp-grooming-bg)] text-[color:var(--pp-grooming-accent)]',
  trainer: 'border-[color:var(--pp-trainer-accent)]/25 bg-[color:var(--pp-trainer-bg)] text-[color:var(--pp-trainer-accent)]',
  lost: 'border-[color:var(--pp-lost-accent)]/25 bg-[color:var(--pp-lost-bg)] text-[color:var(--pp-lost-accent)]',
  vet: 'border-[color:var(--pp-vet-accent)]/25 bg-[color:var(--pp-vet-bg)] text-[color:var(--pp-vet-accent)]',
  adoption: 'border-[color:var(--pp-adoption-accent)]/25 bg-[color:var(--pp-adoption-bg)] text-[color:var(--pp-adoption-accent)]',
  breeder: 'border-[color:var(--pp-breeder-accent)]/25 bg-[color:var(--pp-breeder-bg)] text-[color:var(--pp-breeder-accent)]',
};

export function PetParkBadge({ variant = 'available', className, children, ...props }: PetParkBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-[var(--pp-radius-pill)] border px-3 py-1 text-xs font-extrabold leading-none',
        badgeClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
