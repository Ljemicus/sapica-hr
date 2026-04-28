import { cn } from '@/lib/utils';

type BrandLogoProps = {
  variant?: 'horizontal' | 'mark';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  className?: string;
};

const sizeClasses = {
  sm: {
    mark: 'h-8 w-8',
    wordmark: 'text-xl',
    gap: 'gap-2',
  },
  md: {
    mark: 'h-10 w-10',
    wordmark: 'text-2xl',
    gap: 'gap-2.5',
  },
  lg: {
    mark: 'h-14 w-14',
    wordmark: 'text-4xl',
    gap: 'gap-3',
  },
} as const;

function PetParkMark({ className, theme = 'light' }: Pick<BrandLogoProps, 'className' | 'theme'>) {
  const stroke = theme === 'dark' ? '#fffaf3' : '#1e2d26';

  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      fill="none"
      role="img"
      aria-label="PetPark logo mark"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M256 409C171 341 96 279 96 199c0-50 37-88 86-88 33 0 61 17 74 43 13-26 41-43 74-43 49 0 86 38 86 88 0 80-75 142-160 210Z"
        fill="var(--pp-logo-yellow, #ecb666)"
      />
      <path
        d="M256 390C181 329 119 274 119 202c0-39 28-68 65-68 34 0 57 22 72 56 15-34 38-56 72-56 37 0 65 29 65 68 0 72-62 127-137 188Z"
        fill="var(--pp-logo-orange, #de9350)"
      />
      <ellipse cx="256" cy="292" rx="43" ry="38" fill="var(--pp-logo-teal, #55a497)" />
      <ellipse cx="217" cy="247" rx="18" ry="23" fill="var(--pp-logo-teal, #55a497)" transform="rotate(-18 217 247)" />
      <ellipse cx="256" cy="237" rx="17" ry="22" fill="var(--pp-logo-teal, #55a497)" />
      <ellipse cx="295" cy="247" rx="18" ry="23" fill="var(--pp-logo-teal, #55a497)" transform="rotate(18 295 247)" />
      <ellipse cx="318" cy="275" rx="16" ry="20" fill="var(--pp-logo-teal, #55a497)" transform="rotate(32 318 275)" />
      <path
        d="M256 409C171 341 96 279 96 199c0-50 37-88 86-88 33 0 61 17 74 43 13-26 41-43 74-43 49 0 86 38 86 88 0 80-75 142-160 210Z"
        stroke={stroke}
        strokeOpacity="0.08"
        strokeWidth="14"
      />
    </svg>
  );
}

export function BrandLogo({
  variant = 'horizontal',
  size = 'md',
  theme = 'light',
  className,
}: BrandLogoProps) {
  const sizing = sizeClasses[size];
  const textShadow = theme === 'dark' ? 'drop-shadow-sm' : '';

  if (variant === 'mark') {
    return <PetParkMark theme={theme} className={cn(sizing.mark, className)} />;
  }

  return (
    <span className={cn('inline-flex items-center', sizing.gap, className)} aria-label="PetPark">
      <PetParkMark theme={theme} className={sizing.mark} />
      <span
        className={cn(
          'font-black leading-none tracking-[-0.045em]',
          sizing.wordmark,
          textShadow,
        )}
      >
        <span style={{ color: 'var(--pp-logo-orange, #de9350)' }}>Pet</span>
        <span style={{ color: 'var(--pp-logo-teal, #55a497)' }}>Park</span>
      </span>
    </span>
  );
}
