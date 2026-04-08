"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  objectFit = "cover",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fallback for external images without dimensions
  const imageProps = fill
    ? { fill: true }
    : { width: width || 800, height: height || 600 };

  if (error) {
    return (
      <div
        className={cn(
          "bg-muted flex items-center justify-center",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-muted-foreground text-sm">{alt}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fill ? "absolute inset-0" : "",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        {...imageProps}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          fill && "h-full w-full"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
        unoptimized={src.startsWith("http") && !src.includes("supabase")}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
}

// Avatar component with fixed sizing
interface AvatarImageProps {
  src: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
}: AvatarImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={cn(
          "bg-muted rounded-full flex items-center justify-center",
          className
        )}
        style={{ width: size, height: size }}
      >
        <span className="text-muted-foreground text-xs font-medium">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      onError={() => setError(true)}
      unoptimized={src.startsWith("http") && !src.includes("supabase")}
    />
  );
}

// Lazy loaded image for below-fold content
interface LazyImageProps {
  src: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
}

export function LazyImage({
  src,
  alt,
  aspectRatio = "16/9",
  className,
}: LazyImageProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}
