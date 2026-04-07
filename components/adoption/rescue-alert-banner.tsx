'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Heart, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UrgentPet {
  id: string;
  name: string;
  species: string;
  reason: string;
  deadline: string;
  image_url: string;
  city: string;
}

interface RescueAlertBannerProps {
  urgentPets: UrgentPet[];
}

export function RescueAlertBanner({ urgentPets }: RescueAlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (urgentPets.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % urgentPets.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [urgentPets.length]);

  if (!isVisible || urgentPets.length === 0) return null;

  const currentPet = urgentPets[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white relative overflow-hidden"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 py-3 relative">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Icon and content */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm uppercase tracking-wider">Spasi me!</span>
                  <span className="text-white/80 text-sm hidden sm:inline">|</span>
                  <span className="text-sm truncate">
                    <strong>{currentPet.name}</strong> 
                    <span className="text-white/90"> — {currentPet.reason}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-white/80 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {currentPet.deadline}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {currentPet.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/udomljavanje/${currentPet.id}`}>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="bg-white text-red-600 hover:bg-white/90 font-semibold text-xs h-8"
                >
                  <Heart className="w-3 h-3 mr-1 fill-current" />
                  Udomi
                </Button>
              </Link>
              
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Zatvori"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress indicators */}
          {urgentPets.length > 1 && (
            <div className="flex gap-1 mt-2 justify-center">
              {urgentPets.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1 rounded-full transition-all ${
                    idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
