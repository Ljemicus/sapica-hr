'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BlurImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
}

export function BlurImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  containerClassName,
  priority,
  sizes,
}: BlurImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Blur placeholder */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-muted"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </motion.div>
      )}
      
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        sizes={sizes}
        className={cn(
          'transition-all duration-500',
          isLoading ? 'scale-110 blur-lg' : 'scale-100 blur-0',
          className
        )}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
