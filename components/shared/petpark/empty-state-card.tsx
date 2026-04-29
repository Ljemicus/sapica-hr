import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PetParkButton } from './pp-button';

type EmptyStateVariant = 'noResults' | 'comingSoon' | 'waitlist' | 'lostPetsClear' | 'error';

type EmptyStateCardProps = {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  icon?: ReactNode;
  className?: string;
};

const defaults: Record<EmptyStateVariant, { title: string; description: string; icon: string }> = {
  noResults: { title: 'Nema rezultata za ovu pretragu', description: 'Pokušaj proširiti kriterije ili pogledaj obližnje gradove.', icon: '🔎' },
  comingSoon: { title: 'Uskoro stiže', description: 'Ovaj dio PetParka pripremamo pažljivo, bez lažnog inventoryja.', icon: '✨' },
  waitlist: { title: 'Ostavi interes', description: 'Javimo ti kad novi partneri stignu u tvoj grad.', icon: '💌' },
  lostPetsClear: { title: 'Trenutno nema aktivnih prijava', description: 'To je dobra vijest. Ako se nešto promijeni, zajednica je ovdje.', icon: '🐾' },
  error: { title: 'Nešto nije prošlo kako treba', description: 'Pokušaj ponovno za trenutak ili nam se javi ako problem ostane.', icon: '⚠️' },
};

export function EmptyStateCard({ variant = 'noResults', title, description, primaryActionLabel, primaryActionHref, secondaryActionLabel, secondaryActionHref, icon, className }: EmptyStateCardProps) {
  const copy = defaults[variant];

  return (
    <div className={cn('rounded-[var(--pp-radius-32)] border border-dashed border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] p-8 text-center shadow-[var(--pp-shadow-card)]', className)}>
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[var(--pp-radius-24)] bg-[color:var(--pp-cream)] text-3xl" aria-hidden="true">{icon ?? copy.icon}</div>
      <h3 className="font-heading text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-ink)]">{title ?? copy.title}</h3>
      <p className="mx-auto mt-3 max-w-xl leading-7 text-[color:var(--pp-muted)]">{description ?? copy.description}</p>
      {(primaryActionLabel && primaryActionHref) || (secondaryActionLabel && secondaryActionHref) ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {primaryActionLabel && primaryActionHref ? <PetParkButton href={primaryActionHref}>{primaryActionLabel}</PetParkButton> : null}
          {secondaryActionLabel && secondaryActionHref ? <PetParkButton href={secondaryActionHref} variant="secondary">{secondaryActionLabel}</PetParkButton> : null}
        </div>
      ) : null}
    </div>
  );
}
