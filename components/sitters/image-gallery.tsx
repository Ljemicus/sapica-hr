'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2, Download, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  title?: string;
  maxThumbnails?: number;
  className?: string;
}

export function ImageGallery({ 
  images, 
  title = 'Gallery', 
  maxThumbnails = 8,
  className = '' 
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isLightboxOpen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'Escape':
        setIsLightboxOpen(false);
        break;
    }
  }, [isLightboxOpen, handlePrevious, handleNext]);

  useEffect(() => {
    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen, handleKeyDown]);

  if (!images || images.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg', className)}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Maximize2 className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-center">No images available</p>
      </div>
    );
  }

  const displayedThumbnails = images.slice(0, maxThumbnails);
  const hasMoreImages = images.length > maxThumbnails;

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {title && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{images.length} photos</span>
            </div>
          </div>
        )}

        {/* Main image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={images[selectedIndex]}
            alt={`Gallery image ${selectedIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            onLoad={() => setIsLoading(false)}
            priority
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm"
                onClick={handlePrevious}
                disabled={isLoading}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm"
                onClick={handleNext}
                disabled={isLoading}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Open lightbox button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/80 hover:bg-white backdrop-blur-sm"
            onClick={() => setIsLightboxOpen(true)}
            disabled={isLoading}
            aria-label="Open image gallery"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {displayedThumbnails.map((image, index) => (
              <button
                key={index}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-md border-2 transition-all',
                  selectedIndex === index 
                    ? 'border-emerald-500 ring-2 ring-emerald-200' 
                    : 'border-transparent hover:border-gray-300'
                )}
                onClick={() => setSelectedIndex(index)}
                disabled={isLoading}
                aria-label={`Show gallery image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, (max-width: 1200px) 16.66vw, 12.5vw"
                />
                
                {/* Selected indicator */}
                {selectedIndex === index && (
                  <div className="absolute inset-0 bg-emerald-500/20"></div>
                )}
              </button>
            ))}
            
            {hasMoreImages && (
              <button
                className="relative aspect-square overflow-hidden rounded-md border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center bg-gray-50"
                onClick={() => setIsLightboxOpen(true)}
                aria-label="View all gallery images"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">+{images.length - maxThumbnails}</div>
                  <div className="text-xs text-gray-500 mt-1">View all</div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-auto p-4">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close image gallery"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
                  onClick={handlePrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white"
                  onClick={handleNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Main lightbox image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={images[selectedIndex]}
                alt={`Gallery image ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Lightbox footer */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="text-sm">
                {selectedIndex + 1} / {images.length}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => {
                  // In a real app, you would implement download functionality
                  const link = document.createElement('a');
                  link.href = images[selectedIndex];
                  link.download = `image-${selectedIndex + 1}.jpg`;
                  link.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto py-2 px-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      'relative w-16 h-16 flex-shrink-0 overflow-hidden rounded border-2 transition-all',
                      selectedIndex === index 
                        ? 'border-emerald-500' 
                        : 'border-transparent hover:border-white'
                    )}
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`Show gallery image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}