import { cn } from '@/lib/utils';
import { PetParkButton } from './pp-button';

type CtaVariant = 'partner' | 'community' | 'newsletter' | 'lostPets' | 'default';

type CTASectionProps = {
  variant?: CtaVariant;
  eyebrow?: string;
  title: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
};

const variantClasses: Record<CtaVariant, string> = {
  partner: 'bg-[linear-gradient(135deg,var(--pp-forest),var(--pp-forest-soft))] text-white',
  community: 'bg-[color:var(--pp-community-bg)] text-[color:var(--pp-ink)]',
  newsletter: 'bg-[color:var(--pp-trainer-bg)] text-[color:var(--pp-ink)]',
  lostPets: 'bg-[color:var(--pp-lost-bg)] text-[color:var(--pp-ink)]',
  default: 'bg-[color:var(--pp-cream)] text-[color:var(--pp-ink)]',
};

export function CTASection({ variant = 'default', eyebrow, title, description, primaryLabel, primaryHref, secondaryLabel, secondaryHref, className }: CTASectionProps) {
  const dark = variant === 'partner';

  return (
    <section className={cn('rounded-[var(--pp-radius-40)] border border-[color:var(--pp-line)] p-6 shadow-[var(--pp-shadow-soft)] md:p-10', variantClasses[variant], className)}>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl space-y-3">
          {eyebrow ? <p className={cn('text-sm font-black uppercase tracking-[0.18em]', dark ? 'text-[color:var(--pp-logo-yellow)]' : 'text-[color:var(--pp-logo-orange)]')}>{eyebrow}</p> : null}
          <h2 className="font-heading text-3xl font-black tracking-[-0.04em] md:text-5xl">{title}</h2>
          {description ? <p className={cn('text-base leading-7 md:text-lg', dark ? 'text-[color:var(--pp-sand)]' : 'text-[color:var(--pp-muted)]')}>{description}</p> : null}
        </div>
        {(primaryLabel && primaryHref) || (secondaryLabel && secondaryHref) ? (
          <div className="flex shrink-0 flex-wrap gap-3">
            {primaryLabel && primaryHref ? <PetParkButton href={primaryHref} variant={dark ? 'accent' : 'primary'}>{primaryLabel}</PetParkButton> : null}
            {secondaryLabel && secondaryHref ? <PetParkButton href={secondaryHref} variant={dark ? 'secondary' : 'ghost'}>{secondaryLabel}</PetParkButton> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
