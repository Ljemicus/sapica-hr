'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/context';

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = '' }: HeroSectionProps) {
  const { language } = useLanguage();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const copy = {
    hr: {
      kicker: 'PetPark Hrvatska',
      headline: 'Gdje ljubav\nprema životinjama\npostaje način života.',
      sub: 'Platforma za vlasnike koji traže više od usluge — traže povjerenje, kvalitetu i zajednicu koja dijeli njihove vrijednosti.',
      cta: 'Istražite PetPark',
      secondaryCta: 'Postanite partner',
    },
    en: {
      kicker: 'PetPark Croatia',
      headline: 'Where love\nfor animals\nbecomes a way of life.',
      sub: 'A platform for owners who want more than a service — they want trust, quality, and a community that shares their values.',
      cta: 'Explore PetPark',
      secondaryCta: 'Become a partner',
    },
  };

  const t = language === 'en' ? copy.en : copy.hr;

  // Generate floating paw elements
  const pawElements = Array.from({ length: 12 }).map((_, i) => {
    const size = 20 + (i * 7) % 30;
    const left = (i * 13) % 100;
    const top = (i * 17) % 100;
    const delay = (i * 0.5) % 5;
    const duration = 8 + (i * 0.7) % 7;
    
    return (
      <div
        key={i}
        className="absolute pointer-events-none"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-full h-full text-white/10"
        >
          <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z" />
        </svg>
      </div>
    );
  });

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-gradient-slow" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Floating paw elements */}
      {pawElements}

      {/* Content */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.25em] text-white/60 mb-6 font-semibold animate-fade-in">
            {t.kicker}
          </p>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-8 leading-[1.05] font-[var(--font-heading)] whitespace-pre-line">
            <span className="bg-gradient-to-r from-white via-blue-100 to-pink-100 bg-clip-text text-transparent animate-text-gradient">
              {t.headline}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in-delayed">
            {t.sub}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delayed-2">
            <Link href="/pretraga">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-white/90 h-14 px-10 rounded-full text-base font-bold shadow-2xl shadow-black/20 animate-pulse-glow"
              >
                {t.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/registracija?role=sitter">
              <Button
                size="lg"
                variant="ghost"
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:text-white h-14 px-10 rounded-full text-base font-semibold backdrop-blur-sm"
              >
                {t.secondaryCta}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce-subtle">
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/60 text-sm font-medium">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <ChevronDown className="w-4 h-4 text-white/60 animate-chevron-bounce" />
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes gradient-slow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes text-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3); }
          50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.5); }
        }
        
        @keyframes chevron-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradient-slow 15s ease infinite;
        }
        
        .animate-text-gradient {
          background-size: 200% 200%;
          animation: text-gradient 8s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-chevron-bounce {
          animation: chevron-bounce 1.5s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delayed {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
        
        .animate-fade-in-delayed-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
        
        .animate-bounce-subtle {
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        /* Apply float animation to paw elements */
        .absolute.pointer-events-none {
          animation: float var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }
      `}</style>
    </section>
  );
}