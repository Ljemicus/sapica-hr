import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PPStatusBadgeTone = 'default' | 'active' | 'selected' | 'lost' | 'found' | 'disabled';

type PPStatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: PPStatusBadgeTone;
  children: ReactNode;
};

const toneClasses: Record<PPStatusBadgeTone, string> = {
  default: 'border-[color:var(--pp-border)] bg-[color:var(--pp-surface)] text-[color:var(--pp-text)]',
  active: 'border-[color:var(--pp-green)] bg-[color:var(--pp-green-soft)] text-[color:var(--pp-green-900)]',
  selected: 'border-[color:var(--pp-orange)] bg-[color:var(--pp-orange-soft)] text-[color:var(--pp-green-900)]',
  lost: 'border-[#F4B7A8] bg-[#FFF1EC] text-[color:var(--pp-danger)]',
  found: 'border-[#B7D9C0] bg-[#EEF7EF] text-[color:var(--pp-success)]',
  disabled: 'border-[#E5DFD5] bg-[#F3F0EA] text-[#8B8B83]',
};

export function PPStatusBadge({ tone = 'default', className, children, ...props }: PPStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 w-fit items-center rounded-[var(--pp-radius-pill)] border px-3 py-1 text-xs font-extrabold leading-none',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
