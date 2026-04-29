import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { PetParkAction } from './types';
import { PetParkButton } from './pp-button';

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: PetParkAction;
  secondaryAction?: PetParkAction;
  visual?: ReactNode;
  variant?: 'default' | 'colorful' | 'compact' | 'dark';
  className?: string;
};

const variantClasses = {
  default: 'bg-[color:var(--pp-warm-white)] text-[color:var(--pp-ink)]',
  colorful: 'bg-[linear-gradient(135deg,var(--pp-cream),var(--pp-trainer-bg),var(--pp-grooming-bg))] text-[color:var(--pp-ink)]',
  compact: 'bg-[color:var(--pp-cream)] text-[color:var(--pp-ink)]',
  dark: 'bg-[color:var(--pp-forest-dark)] text-[color:var(--pp-cream)]',
};

export function PageHero({ eyebrow, title, description, primaryAction, secondaryAction, visual, variant = 'default', className }: PageHeroProps) {
  const isDark = variant === 'dark';

  return (
    <section className={cn('overflow-hidden rounded-[var(--pp-radius-40)] border border-[color:var(--pp-line)] p-6 shadow-[var(--pp-shadow-soft)] md:p-10', variantClasses[variant], className)}>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div className="space-y-6">
          {eyebrow ? <p className={cn('text-sm font-black uppercase tracking-[0.18em]', isDark ? 'text-[color:var(--pp-logo-yellow)]' : 'text-[color:var(--pp-logo-orange)]')}>{eyebrow}</p> : null}
          <div className="space-y-4">
            <h1 className="font-heading text-4xl font-black tracking-[-0.055em] md:text-6xl">{title}</h1>
            {description ? <p className={cn('max-w-2xl text-lg leading-8', isDark ? 'text-[color:var(--pp-sand)]' : 'text-[color:var(--pp-muted)]')}>{description}</p> : null}
          </div>
          {(primaryAction || secondaryAction) ? (
            <div className="flex flex-wrap gap-3">
              {primaryAction ? <PetParkButton href={primaryAction.href}>{primaryAction.label}</PetParkButton> : null}
              {secondaryAction ? <PetParkButton href={secondaryAction.href} variant={isDark ? 'accent' : 'secondary'}>{secondaryAction.label}</PetParkButton> : null}
            </div>
          ) : null}
        </div>
        {visual ? <div className="rounded-[var(--pp-radius-32)] bg-white/35 p-4 shadow-[var(--pp-shadow-card)]">{visual}</div> : null}
      </div>
    </section>
  );
}
