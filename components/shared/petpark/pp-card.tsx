import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PPCardTone = 'default' | 'warm' | 'mint' | 'orange';

type PPCardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: PPCardTone;
  interactive?: boolean;
  children: ReactNode;
};

const toneClasses: Record<PPCardTone, string> = {
  default: 'border-[color:var(--pp-border)] bg-[color:var(--pp-surface)]',
  warm: 'border-[color:var(--pp-border)] bg-[color:var(--pp-surface-warm)]',
  mint: 'border-[color:var(--pp-green-100)] bg-[color:var(--pp-green-soft)]',
  orange: 'border-[color:var(--pp-orange-100)] bg-[color:var(--pp-orange-soft)]',
};

export function PPCard({ tone = 'default', interactive = false, className, children, ...props }: PPCardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--pp-radius-card)] border p-5 shadow-[var(--pp-shadow-card)]',
        interactive && 'transition hover:-translate-y-0.5 hover:shadow-[var(--pp-shadow-md)]',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
