'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const displayValue = useTransform(springValue, (latest) =>
    Math.floor(latest).toLocaleString()
  );

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, springValue, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

// Animated stat card with counter
interface StatCounterCardProps {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  gradient?: 'orange' | 'teal' | 'purple' | 'blue';
}

export function StatCounterCard({
  value,
  label,
  suffix = '',
  prefix = '',
  icon,
  gradient = 'orange',
}: StatCounterCardProps) {
  const gradients = {
    orange: 'from-orange-500 to-amber-500',
    teal: 'from-teal-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-indigo-500',
  };

  return (
    <div className="relative p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
      {icon && (
        <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div
        className={`text-4xl font-bold bg-gradient-to-r ${gradients[gradient]} bg-clip-text text-transparent`}
      >
        <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
      </div>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </div>
  );
}
