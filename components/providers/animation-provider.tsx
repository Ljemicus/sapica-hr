'use client';

import { motion, AnimatePresence } from 'framer-motion';

/**
 * AnimationProvider - Provides Framer Motion context and reusable animation variants
 * 
 * This component provides a centralized location for animation configurations
 * that can be used throughout the PetPark application.
 */

// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// Staggered list animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
};

// Card hover animation variants
export const cardHoverVariants = {
  initial: {
    scale: 1,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 20px 25px -5px rgba(249, 115, 22, 0.1), 0 10px 10px -5px rgba(249, 115, 22, 0.04)',
    transition: { duration: 0.2 },
  },
};

// Button hover animation variants
export const buttonHoverVariants = {
  initial: {
    scale: 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.3), 0 2px 4px -1px rgba(249, 115, 22, 0.06)',
    transition: {
      duration: 0.15,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// Skeleton loading animation
export const skeletonPulseVariants = {
  initial: {
    opacity: 0.6,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1.2,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'easeInOut',
    },
  },
};

// Fade in animation for hero elements
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

// Staggered fade in for hero content
export const staggeredHeroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

/**
 * AnimationProvider component
 * 
 * Wraps children with AnimatePresence for page transitions
 * and provides motion context for animations.
 */
export function AnimationProvider({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}

/**
 * MotionContainer - A wrapper component for staggered list animations
 */
export function MotionContainer({ 
  children, 
  className = '',
  variants = containerVariants,
  initial = 'hidden',
  animate = 'visible'
}: {
  children: React.ReactNode;
  className?: string;
  variants?: typeof containerVariants;
  initial?: string;
  animate?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial={initial}
      animate={animate}
    >
      {children}
    </motion.div>
  );
}

/**
 * MotionItem - Individual item for staggered animations
 */
export function MotionItem({ 
  children, 
  className = '',
  variants = itemVariants
}: {
  children: React.ReactNode;
  className?: string;
  variants?: typeof itemVariants;
}) {
  return (
    <motion.div
      className={className}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCard - Card with hover animations
 */
export function AnimatedCard({ 
  children, 
  className = '',
  whileHover = 'hover',
  whileTap = 'tap'
}: {
  children: React.ReactNode;
  className?: string;
  whileHover?: string;
  whileTap?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={cardHoverVariants}
      initial="initial"
      whileHover={whileHover}
      whileTap={whileTap}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedButton - Button with hover and tap animations
 */
export function AnimatedButton({ 
  children, 
  className = '',
  whileHover = 'hover',
  whileTap = 'tap'
}: {
  children: React.ReactNode;
  className?: string;
  whileHover?: string;
  whileTap?: string;
}) {
  return (
    <motion.button
      className={className}
      variants={buttonHoverVariants}
      initial="initial"
      whileHover={whileHover}
      whileTap={whileTap}
    >
      {children}
    </motion.button>
  );
}