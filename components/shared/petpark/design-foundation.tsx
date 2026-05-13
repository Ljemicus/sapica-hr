import Image from 'next/image';
import Link from 'next/link';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';
import { ChevronDown, Menu, PawPrint, Search, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PetParkTone = 'default' | 'sage' | 'cream' | 'teal' | 'orange';
export type PetParkStatus = 'success' | 'warning' | 'error' | 'info';

export function PetParkLogo({
  className,
  width = 148,
  height = 44,
  priority = false,
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/petpark-logo.svg"
      alt="PetPark"
      width={width}
      height={height}
      priority={priority}
      style={{ width, height: 'auto' }}
      className={cn('h-auto max-w-full', className)}
    />
  );
}

export function AppHeader({
  actions,
  className,
  navItems = [
    { href: '/usluge', label: 'Usluge' },
    { href: '/kalendar', label: 'Kalendar' },
    { href: '/grupni-treninzi', label: 'Grupni treninzi' },
    { href: '/pet-passport', label: 'Pet Passport' },
  ],
}: {
  actions?: ReactNode;
  className?: string;
  navItems?: Array<{ href: string; label: string }>;
}) {
  return (
    <header className={cn('sticky top-0 z-40 border-b border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-cream-background)]/92 backdrop-blur-xl', className)}>
      <div className="mx-auto flex h-[var(--pp-header-height)] max-w-[var(--pp-content-width)] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="PetPark početna" className="shrink-0">
          <PetParkLogo priority />
        </Link>
        <nav aria-label="Glavna navigacija" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--pp-radius-control)] px-4 py-2 text-sm font-extrabold text-[color:var(--pp-color-muted-text)] transition hover:bg-[color:var(--pp-color-sage-surface)] hover:text-[color:var(--pp-color-forest-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {actions ?? <ButtonLink href="/objavi-uslugu" size="sm">Pripremi nacrt</ButtonLink>}
          <IconButton aria-label="Otvori izbornik" className="lg:hidden">
            <Menu className="size-5" aria-hidden />
          </IconButton>
        </div>
      </div>
    </header>
  );
}

export type ButtonVariant = 'primary' | 'secondary' | 'teal' | 'ghost' | 'soft' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-[color:var(--pp-color-orange-primary)] text-white shadow-[var(--pp-shadow-button-glow)] hover:brightness-95',
  secondary: 'border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)] hover:bg-[color:var(--pp-color-cream-background)]',
  teal: 'bg-[color:var(--pp-color-teal-accent)] text-white shadow-[var(--pp-shadow-small-card)] hover:brightness-95',
  ghost: 'text-[color:var(--pp-color-muted-text)] hover:bg-[color:var(--pp-color-sage-surface)] hover:text-[color:var(--pp-color-forest-text)]',
  soft: 'bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-forest-text)] hover:bg-[color:var(--pp-color-sage-surface-strong)]',
  danger: 'bg-[color:var(--pp-color-error)] text-white shadow-[var(--pp-shadow-small-card)] hover:brightness-95',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-12 px-5 text-sm',
  lg: 'min-h-14 px-7 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--pp-radius-control)] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55',
        'hover:-translate-y-0.5 active:translate-y-0',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--pp-radius-control)] font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2',
        'hover:-translate-y-0.5 active:translate-y-0',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({
  variant = 'secondary',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-[var(--pp-radius-control)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55',
        'hover:-translate-y-0.5 active:translate-y-0',
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-12 w-full rounded-[var(--pp-radius-control)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] px-4 text-sm font-semibold text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)] outline-none transition placeholder:text-[color:var(--pp-color-muted-text)]/70 focus:border-[color:var(--pp-color-teal-accent)] focus:ring-2 focus:ring-[color:var(--pp-color-teal-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select
        className={cn(
          'min-h-12 w-full appearance-none rounded-[var(--pp-radius-control)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] px-4 pr-11 text-sm font-extrabold text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)] outline-none transition focus:border-[color:var(--pp-color-teal-accent)] focus:ring-2 focus:ring-[color:var(--pp-color-teal-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--pp-color-muted-text)]" aria-hidden />
    </span>
  );
}

export function SearchBar({
  className,
  inputName = 'q',
  inputPlaceholder = 'Pretraži čuvanje, grooming, treninge…',
  cityName = 'grad',
  submitLabel = 'Pretraži',
}: {
  className?: string;
  inputName?: string;
  inputPlaceholder?: string;
  cityName?: string;
  submitLabel?: string;
}) {
  return (
    <form className={cn('rounded-[var(--pp-radius-card-28)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-3 shadow-[var(--pp-shadow-soft-card)]', className)}>
      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
          <Input name={inputName} placeholder={inputPlaceholder} className="pl-12 shadow-none" />
        </label>
        <Select name={cityName} defaultValue="">
          <option value="" disabled>Odaberi grad</option>
          <option>Rijeka</option>
          <option>Zagreb</option>
          <option>Split</option>
          <option>Osijek</option>
        </Select>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

const cardTones: Record<PetParkTone, string> = {
  default: 'bg-[color:var(--pp-color-card-surface)]',
  sage: 'bg-[color:var(--pp-color-sage-surface)]',
  cream: 'bg-[color:var(--pp-color-cream-surface)]',
  teal: 'bg-[color:var(--pp-color-info-surface)]',
  orange: 'bg-[color:var(--pp-color-warning-surface)]',
};

export function Card({
  tone = 'default',
  radius = '24',
  shadow = 'soft',
  interactive = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: PetParkTone;
  radius?: '20' | '24' | '28';
  shadow?: 'none' | 'small' | 'soft';
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        'border border-[color:var(--pp-color-warm-border)] text-[color:var(--pp-color-forest-text)]',
        radius === '20' && 'rounded-[var(--pp-radius-card-20)]',
        radius === '24' && 'rounded-[var(--pp-radius-card-24)]',
        radius === '28' && 'rounded-[var(--pp-radius-card-28)]',
        shadow === 'small' && 'shadow-[var(--pp-shadow-small-card)]',
        shadow === 'soft' && 'shadow-[var(--pp-shadow-soft-card)]',
        interactive && 'transition hover:-translate-y-1 hover:shadow-[var(--pp-shadow-soft-card)]',
        cardTones[tone],
        className,
      )}
      {...props}
    />
  );
}

const badgeVariants: Record<PetParkStatus | PetParkTone, string> = {
  default: 'border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-muted-text)]',
  sage: 'border-[color:var(--pp-color-sage-surface-strong)] bg-[color:var(--pp-color-sage-surface)] text-[color:var(--pp-color-forest-text)]',
  cream: 'border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-cream-surface)] text-[color:var(--pp-color-forest-text)]',
  teal: 'border-[color:var(--pp-color-teal-accent)]/20 bg-[color:var(--pp-color-info-surface)] text-[color:var(--pp-color-teal-accent)]',
  orange: 'border-[color:var(--pp-color-orange-primary)]/20 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]',
  success: 'border-[color:var(--pp-color-success)]/20 bg-[color:var(--pp-color-success-surface)] text-[color:var(--pp-color-success)]',
  warning: 'border-[color:var(--pp-color-warning)]/20 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-warning)]',
  error: 'border-[color:var(--pp-color-error)]/20 bg-[color:var(--pp-color-error-surface)] text-[color:var(--pp-color-error)]',
  info: 'border-[color:var(--pp-color-info)]/20 bg-[color:var(--pp-color-info-surface)] text-[color:var(--pp-color-info)]',
};

export function Badge({
  variant = 'sage',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: PetParkStatus | PetParkTone }) {
  return (
    <span
      className={cn('inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-extrabold leading-none', badgeVariants[variant], className)}
      {...props}
    />
  );
}

export function Tabs({
  items,
  active = 0,
  className,
}: {
  items: Array<{ label: string; count?: number }>;
  active?: number;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-2 rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-cream-surface)] p-2', className)} role="tablist">
      {items.map((item, index) => (
        <button
          key={item.label}
          type="button"
          role="tab"
          aria-selected={index === active}
          className={cn(
            'rounded-[var(--pp-radius-control)] px-4 py-2 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]',
            index === active
              ? 'bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)]'
              : 'text-[color:var(--pp-color-muted-text)] hover:bg-[color:var(--pp-color-card-surface)]/70 hover:text-[color:var(--pp-color-forest-text)]',
          )}
        >
          {item.label}{item.count ? <span className="ml-2 text-[color:var(--pp-color-teal-accent)]">{item.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Avatar({
  src,
  alt = '',
  initials = 'PP',
  size = 'md',
  className,
}: {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClass = size === 'sm' ? 'size-9 text-xs' : size === 'lg' ? 'size-16 text-lg' : 'size-12 text-sm';

  return (
    <span className={cn('relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[color:var(--pp-color-card-surface)] bg-[color:var(--pp-color-sage-surface)] font-extrabold text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)]', sizeClass, className)}>
      {src ? <Image src={src} alt={alt} fill sizes="64px" className="object-cover" /> : initials}
    </span>
  );
}

export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--pp-color-forest-text)]', className)}>
      <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} od 5`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn('size-4', index < Math.round(value) ? 'fill-[color:var(--pp-color-orange-primary)] text-[color:var(--pp-color-orange-primary)]' : 'fill-[color:var(--pp-color-warm-border)] text-[color:var(--pp-color-warm-border)]')}
            aria-hidden
          />
        ))}
      </span>
      <span>{value.toFixed(1)}</span>
      {count ? <span className="font-semibold text-[color:var(--pp-color-muted-text)]">({count} recenzija)</span> : null}
    </div>
  );
}

export function LeafDecoration({ className }: { className?: string }) {
  return (
    <span className={cn('pointer-events-none absolute inline-flex size-28 rounded-[60%_40%_65%_35%] bg-[color:var(--pp-color-sage-surface-strong)] opacity-70 blur-[1px]', className)} aria-hidden>
      <span className="absolute left-1/2 top-4 h-20 w-px -rotate-12 bg-[color:var(--pp-color-teal-accent)]/30" />
    </span>
  );
}

export function PawDecoration({ className }: { className?: string }) {
  return (
    <span className={cn('pointer-events-none absolute inline-flex size-14 items-center justify-center rounded-full bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-small-card)]', className)} aria-hidden>
      <PawPrint className="size-7" />
    </span>
  );
}
