"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  showLabels?: boolean;
  showHandle?: boolean;
  initialPosition?: number; // 0-100
  revealOnScroll?: boolean;
}

export default function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Prije",
  afterLabel = "Poslije",
  className,
  showLabels = true,
  showHandle = true,
  initialPosition = 50,
  revealOnScroll = false,
}: ImageComparisonSliderProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!revealOnScroll);

  // Motion values for smooth dragging
  const motionPosition = useMotionValue(initialPosition);
  const springPosition = useSpring(motionPosition, {
    stiffness: 300,
    damping: 30,
  });

  // Transform for clip-path
  const clipPath = useTransform(springPosition, (pos) => `inset(0 ${100 - pos}% 0 0)`);

  // Handle mouse/touch drag
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  const handleDrag = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    setPosition(percentage);
    motionPosition.set(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleDrag(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    handleDrag(e.touches[0].clientX);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      const newPos = Math.max(0, position - 5);
      setPosition(newPos);
      motionPosition.set(newPos);
    } else if (e.key === "ArrowRight") {
      const newPos = Math.min(100, position + 5);
      setPosition(newPos);
      motionPosition.set(newPos);
    }
  };

  // Intersection Observer for reveal on scroll
  useEffect(() => {
    if (!revealOnScroll || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [revealOnScroll]);

  // Reset position when images change
  useEffect(() => {
    setPosition(initialPosition);
    motionPosition.set(initialPosition);
  }, [beforeImage, afterImage, initialPosition, motionPosition]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-2xl",
        revealOnScroll && "opacity-0",
        isInView && "opacity-100 transition-opacity duration-1000",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Container for both images */}
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        {/* After image (full background) */}
        <div className="absolute inset-0">
          <img
            src={afterImage}
            alt="After"
            className="h-full w-full object-cover"
            draggable="false"
          />
        </div>

        {/* Before image with clip-path */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath }}
        >
          <img
            src={beforeImage}
            alt="Before"
            className="h-full w-full object-cover"
            draggable="false"
          />
        </motion.div>

        {/* Divider line */}
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-lg z-10"
          style={{ left: `${position}%` }}
        />

        {/* Draggable handle */}
        {showHandle && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing touch-none select-none"
            style={{ left: `${position}%` }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="slider"
            aria-valuenow={position}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Image comparison slider"
          >
            <div className="flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-2xl ring-2 ring-primary/20 transition-all hover:scale-110 hover:ring-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/60">
              <div className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4 text-gray-600" />
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Labels */}
        {showLabels && (
          <>
            <div className="absolute left-4 top-4 z-10 rounded-full bg-black/60 px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-semibold text-white">
                {beforeLabel}: {Math.round(position)}%
              </span>
            </div>
            <div className="absolute right-4 top-4 z-10 rounded-full bg-black/60 px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-semibold text-white">
                {afterLabel}: {Math.round(100 - position)}%
              </span>
            </div>
          </>
        )}

        {/* Instructions overlay (only visible on hover/focus) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-0 transition-opacity duration-300 hover:opacity-100 focus-within:opacity-100">
          <div className="rounded-lg bg-black/70 px-4 py-2 backdrop-blur-sm">
            <p className="text-xs text-white">
              Drag the handle or use arrow keys to compare
            </p>
          </div>
        </div>

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Position indicator (optional, shows at bottom) */}
      <div className="mt-4 px-4">
        <div className="relative h-2 w-full rounded-full bg-gray-200">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-primary"
            style={{ width: `${position}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-lg"
            style={{ left: `${position}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm text-gray-600">
          <span>{beforeLabel}</span>
          <span>{afterLabel}</span>
        </div>
      </div>
    </div>
  );
}