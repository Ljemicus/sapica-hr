import { cn } from '@/lib/utils';

type PriceRangeProps = {
  priceFrom?: number | string | null;
  label?: string;
  fallbackLabel?: string;
  className?: string;
};

function normalizePrice(price: number | string | null | undefined) {
  if (price === null || price === undefined || price === '') return null;
  const value = typeof price === 'number' ? price : Number(String(price).replace(',', '.'));
  if (!Number.isFinite(value) || value <= 0) return null;
  return typeof price === 'number' ? `${value.toLocaleString('hr-HR')} €` : String(price);
}

export function PriceRange({ priceFrom, label = 'od', fallbackLabel = 'Cijena po dogovoru', className }: PriceRangeProps) {
  const normalized = normalizePrice(priceFrom);

  return (
    <span className={cn('text-sm font-extrabold text-[color:var(--pp-ink)]', className)}>
      {normalized ? `${label} ${normalized}` : fallbackLabel}
    </span>
  );
}
