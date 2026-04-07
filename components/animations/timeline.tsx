'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TimelineStep {
  icon: ReactNode;
  title: string;
  description: string;
  duration?: string;
}

export interface TimelineProps {
  steps: TimelineStep[];
  title?: string;
  subtitle?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  lineColor?: string;
  animated?: boolean;
}

export function Timeline({
  steps,
  title,
  subtitle,
  className,
  orientation = 'vertical',
  lineColor = 'bg-primary/30',
  animated = true,
}: TimelineProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const stepVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const lineVariants: Variants = {
    hidden: { scaleY: 0, originY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const dotVariants: Variants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'backOut',
      },
    },
  };

  const isVertical = orientation === 'vertical';

  return (
    <div className={cn('w-full', className)}>
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className={cn(
          'relative',
          isVertical
            ? 'flex flex-col items-start'
            : 'flex flex-row items-start justify-between'
        )}
      >
        {/* Animated line */}
        <motion.div
          className={cn(
            'absolute',
            lineColor,
            isVertical
              ? 'left-6 top-0 h-full w-0.5 -translate-x-1/2'
              : 'top-6 left-0 h-0.5 w-full -translate-y-1/2'
          )}
          variants={lineVariants}
          initial={animated ? 'hidden' : false}
          animate={animated && isInView ? 'visible' : false}
        />

        {/* Steps */}
        <motion.div
          className={cn(
            'relative z-10',
            isVertical ? 'space-y-12' : 'flex w-full justify-between'
          )}
          variants={containerVariants}
          initial={animated ? 'hidden' : false}
          animate={animated && isInView ? 'visible' : false}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={stepVariants}
              className={cn(
                'relative flex items-start',
                isVertical
                  ? 'flex-row'
                  : 'flex-col items-center text-center max-w-[200px]'
              )}
            >
              {/* Step number and connector dot */}
              <div
                className={cn(
                  'relative flex-shrink-0',
                  isVertical ? 'mr-6' : 'mb-4'
                )}
              >
                {/* Outer circle */}
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full border-2 bg-background',
                    'h-12 w-12 border-primary/20',
                    'dark:border-primary/30'
                  )}
                >
                  {/* Animated dot */}
                  <motion.div
                    className="h-3 w-3 rounded-full bg-primary"
                    variants={dotVariants}
                  />

                  {/* Step icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-primary">{step.icon}</div>
                  </div>

                  {/* Step number (for vertical timeline) */}
                  {isVertical && (
                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                  )}
                </div>

                {/* Time estimate badge */}
                {step.duration && (
                  <div
                    className={cn(
                      'absolute rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary',
                      'dark:bg-primary/20',
                      isVertical
                        ? '-bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap'
                        : '-bottom-6 left-1/2 -translate-x-1/2'
                    )}
                  >
                    {step.duration}
                  </div>
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  'flex-1',
                  isVertical ? 'pt-2' : 'text-center'
                )}
              >
                <h3
                  className={cn(
                    'font-semibold text-foreground',
                    isVertical ? 'text-lg' : 'text-base'
                  )}
                >
                  {step.title}
                </h3>
                <p
                  className={cn(
                    'mt-1 text-muted-foreground',
                    isVertical ? 'text-sm' : 'text-xs'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Alternative compact timeline for mobile
export function CompactTimeline({
  steps,
  title,
  subtitle,
  className,
}: Omit<TimelineProps, 'orientation'>) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const stepVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <div className={cn('w-full', className)}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      <motion.div
        ref={containerRef}
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {steps.map((step, index) => (
          <motion.div
            key={index}
            variants={stepVariants}
            className="flex items-start gap-3 rounded-lg border bg-card p-4"
          >
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {step.icon}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">{step.title}</h4>
                {step.duration && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {step.duration}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}