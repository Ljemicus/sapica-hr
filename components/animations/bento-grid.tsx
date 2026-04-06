'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ScrollReveal, StaggerContainer, StaggerItem } from './scroll-reveal';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <StaggerContainer
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {children}
    </StaggerContainer>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'large' | 'full';
  gradient?: 'orange' | 'teal' | 'purple' | 'blue' | 'none';
  spotlight?: boolean;
}

export function BentoCard({
  children,
  className,
  size = 'default',
  gradient = 'none',
  spotlight = false,
}: BentoCardProps) {
  const sizeClasses = {
    default: '',
    large: 'md:col-span-2',
    full: 'md:col-span-2 lg:col-span-3',
  };

  const gradientClasses = {
    orange: 'bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-transparent',
    teal: 'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
    purple: 'bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-transparent',
    blue: 'bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent',
    none: '',
  };

  return (
    <StaggerItem className={sizeClasses[size]}>
      <div
        className={cn(
          'group relative overflow-hidden rounded-3xl border border-border/50',
          'bg-card/50 backdrop-blur-sm',
          'transition-all duration-500 ease-out',
          'hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5',
          'hover:border-primary/20',
          gradientClasses[gradient],
          className
        )}
      >
        {/* Spotlight effect */}
        {spotlight && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
          </div>
        )}
        
        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 h-full">
          {children}
        </div>

        {/* Corner glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>
    </StaggerItem>
  );
}

// Pre-built feature card
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  size?: 'default' | 'large';
  gradient?: 'orange' | 'teal' | 'purple' | 'blue' | 'none';
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
  size = 'default',
  gradient = 'none',
}: FeatureCardProps) {
  return (
    <BentoCard size={size} gradient={gradient} spotlight className={className}>
      <div className="flex flex-col h-full">
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </BentoCard>
  );
}

// Stats card
interface StatCardProps {
  value: string;
  label: string;
  trend?: string;
  gradient?: 'orange' | 'teal' | 'purple' | 'blue';
}

export function StatCard({ value, label, trend, gradient = 'teal' }: StatCardProps) {
  const gradientText = {
    orange: 'from-orange-500 to-amber-500',
    teal: 'from-teal-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-indigo-500',
  };

  return (
    <BentoCard gradient={gradient} spotlight>
      <div className="flex flex-col h-full justify-between">
        <div>
          <span
            className={cn(
              'text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
              gradientText[gradient]
            )}
          >
            {value}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          )}
        </div>
      </div>
    </BentoCard>
  );
}
