import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = '' }: HeroSectionProps) {
  const copy = {
    hr: {
      kicker: 'PetPark Hrvatska',
      headline: 'PetPark — pouzdani sitteri\nu vašem kvartu.',
      sub: 'Zagreb, beta. Pronađite čuvara, šetača ili boarding za svog ljubimca.',
      cta: 'Pronađi sittera',
      secondaryCta: 'Postanite partner',
    },
    en: {
      kicker: 'PetPark Croatia',
      headline: 'PetPark — trusted sitters\nin your neighbourhood.',
      sub: 'Zagreb, beta. Find pet sitting, walking, or boarding for your pet.',
      cta: 'Find a sitter',
      secondaryCta: 'Become a partner',
    },
  };

  const t = copy.hr;

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
    <section className={`relative min-h-[48vh] md:min-h-screen flex items-center justify-center overflow-hidden pb-4 md:pb-12 ${className}`}>
      {/* Background image with dark overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.55),transparent_32%),radial-gradient(circle_at_70%_30%,rgba(20,184,166,0.35),transparent_34%),linear-gradient(135deg,#1f2937_0%,#2d2d2d_48%,#111827_100%)]" />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Floating paw elements */}
      <div className="hidden md:block">{pawElements}</div>

      {/* Content */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.25em] text-white/80 mb-6 font-semibold animate-fade-in drop-shadow">
            {t.kicker}
          </p>
          
          <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-4 md:mb-8 leading-[1.08] font-[var(--font-heading)] text-white drop-shadow-lg">
            {t.headline}
          </h1>
          
          <p className="hidden md:block text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in-delayed drop-shadow-md">
            {t.sub}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delayed-2">
            <Link prefetch={false} href="/pretraga">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-white/90 h-14 px-10 rounded-full text-base font-bold shadow-2xl shadow-black/20 animate-pulse-glow"
              >
                {t.cta}
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Link prefetch={false} href="/registracija?role=sitter">
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
      <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce-subtle">
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/60 text-sm font-medium">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <span className="text-white/60 animate-chevron-bounce">⌄</span>
          </div>
        </div>
      </div>

    </section>
  );
}