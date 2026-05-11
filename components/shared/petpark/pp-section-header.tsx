import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PPSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  action?: ReactNode;
};

export function PPSectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  action,
}: PPSectionHeaderProps) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        centered && 'items-center text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-3xl space-y-3', centered && 'mx-auto')}>
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--pp-orange)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-[length:var(--pp-text-section)] font-black leading-[1.05] tracking-[-0.04em] text-[color:var(--pp-green-950)]">
          {title}
        </h2>
        {description ? (
          <div className="text-base leading-7 text-[color:var(--pp-muted)] md:text-lg">
            {description}
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
