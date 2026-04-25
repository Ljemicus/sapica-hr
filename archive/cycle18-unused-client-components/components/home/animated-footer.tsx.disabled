'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle, 
  Loader2, 
  Heart,
  ChevronUp,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n';

export function AnimatedFooter() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Show back to top button on scroll
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setShowBackToTop(window.scrollY > 500);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStatus('success');
    setEmail('');
    
    // Reset after 3 seconds
    setTimeout(() => setStatus('idle'), 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copy = {
    hr: {
      newsletterTitle: 'Ostanite u toku',
      newsletterSubtitle: 'Primajte novosti, savjete i ekskluzivne ponude.',
      placeholder: 'Vaša email adresa',
      submit: 'Pretplatite se',
      success: 'Hvala na pretplati!',
      links: {
        services: 'Usluge',
        about: 'O nama',
        contact: 'Kontakt',
        privacy: 'Privatnost',
        terms: 'Uvjeti korištenja',
      },
      copyright: 'Sva prava pridržana.',
      madeWith: 'Napravljeno s',
    },
    en: {
      newsletterTitle: 'Stay in the loop',
      newsletterSubtitle: 'Get news, tips, and exclusive offers.',
      placeholder: 'Your email address',
      submit: 'Subscribe',
      success: 'Thanks for subscribing!',
      links: {
        services: 'Services',
        about: 'About',
        contact: 'Contact',
        privacy: 'Privacy',
        terms: 'Terms',
      },
      copyright: 'All rights reserved.',
      madeWith: 'Made with',
    },
  };

  const t = language === 'en' ? copy.en : copy.hr;

  const footerLinks = [
    { label: t.links.services, href: '/pretraga' },
    { label: t.links.about, href: '/o-nama' },
    { label: t.links.contact, href: '/kontakt' },
    { label: t.links.privacy, href: '/privatnost' },
    { label: t.links.terms, href: '/uvjeti' },
  ];

  const socialLinks = [
    { icon: Globe, href: 'https://instagram.com/petpark.hr', label: 'Instagram' },
    { icon: Globe, href: 'https://facebook.com/petpark.hr', label: 'Facebook' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-background to-muted/30 pt-20 pb-8 overflow-hidden">
      {/* Wave SVG at top */}
      <div className="absolute top-0 left-0 right-0 h-20 -translate-y-full">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80V40C240 80 480 0 720 0C960 0 1200 80 1440 40V80H0Z"
            fill="hsl(var(--muted))"
            fillOpacity="0.3"
          />
        </svg>
      </div>

      <div className="container mx-auto px-6 md:px-10 lg:px-16">
        {/* Links & Social */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-border">
          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <social.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            © {new Date().getFullYear()} PetPark. {t.copyright}
            <span className="flex items-center gap-1 ml-2">
              {t.madeWith}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              </motion.span>
            </span>
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center z-50"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronUp className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}
