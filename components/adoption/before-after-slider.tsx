'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoveHorizontal } from 'lucide-react';
import Image from 'next/image';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Prije',
  afterLabel = 'Poslije',
  className = '',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* After image (full width, background) */}
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={afterImage}
          alt="Poslije"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* After label */}
        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          {afterLabel}
        </div>
      </div>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <div className="relative aspect-[4/3] w-full h-full">
          <Image
            src={beforeImage}
            alt="Prije"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        
        {/* Before label */}
        <div className="absolute top-4 left-4 bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          {beforeLabel}
        </div>
      </div>

      {/* Slider handle */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-lg"
        style={{ left: `${sliderPosition}%`, translateX: '-50%' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        whileHover={{ scaleX: 1.5 }}
        whileDrag={{ scaleX: 1.5 }}
      >
        {/* Handle circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-gray-200">
          <MoveHorizontal className="w-5 h-5 text-gray-600" />
        </div>
      </motion.div>

      {/* Hint text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
        Povuci za usporedbu
      </div>
    </div>
  );
}
