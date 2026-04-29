import { cn } from '@/lib/utils';

type RatingSummaryProps = {
  rating?: number | null;
  reviewCount?: number | null;
  newLabel?: string;
  className?: string;
};

export function RatingSummary({ rating, reviewCount, newLabel = 'Novo na PetParku', className }: RatingSummaryProps) {
  if (!reviewCount || reviewCount <= 0 || !rating || rating <= 0) {
    return <span className={cn('text-sm font-bold text-[color:var(--pp-muted)]', className)}>{newLabel}</span>;
  }

  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-extrabold text-[color:var(--pp-ink)]', className)}>
      <span aria-hidden="true" className="text-[color:var(--pp-logo-yellow)]">★</span>
      <span>{rating.toFixed(1)}</span>
      <span className="font-semibold text-[color:var(--pp-muted)]">({reviewCount})</span>
    </span>
  );
}
