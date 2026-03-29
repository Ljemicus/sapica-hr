import { ShieldCheck, Award } from 'lucide-react';
import type { VerificationLevel } from '@/lib/types';

interface VerificationBadgeProps {
  level: VerificationLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function VerificationBadge({ level, size = 'sm', showLabel = false }: VerificationBadgeProps) {
  if (level === 'basic') return null;

  const iconClass = sizeClasses[size];

  if (level === 'premium') {
    return (
      <span className="inline-flex items-center gap-1" title="Premium sitter">
        <Award className={`${iconClass} text-amber-500`} />
        {showLabel && <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Premium</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1" title="Verificiran sitter">
      <ShieldCheck className={`${iconClass} text-blue-500`} />
      {showLabel && <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Verificiran</span>}
    </span>
  );
}
