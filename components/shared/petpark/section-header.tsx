import { cn } from '@/lib/utils';
import { PetParkButton } from './pp-button';

type SectionHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function SectionHeader({
  kicker,
  title,
  description,
  align = 'left',
  actionLabel,
  actionHref,
  className,
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <div className={cn('flex flex-col gap-5 md:flex-row md:items-end md:justify-between', isCenter && 'items-center text-center md:flex-col md:items-center', className)}>
      <div className={cn('max-w-3xl space-y-3', isCenter && 'mx-auto')}>
        {kicker ? <p className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--pp-logo-orange)]">{kicker}</p> : null}
        <h2 className="font-heading text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-ink)] md:text-5xl">{title}</h2>
        {description ? <p className="text-base leading-7 text-[color:var(--pp-muted)] md:text-lg">{description}</p> : null}
      </div>
      {actionLabel && actionHref ? <PetParkButton href={actionHref} variant="secondary">{actionLabel}</PetParkButton> : null}
    </div>
  );
}
