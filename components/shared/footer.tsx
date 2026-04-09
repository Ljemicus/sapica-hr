'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, Mail, ChevronUp, Check, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { CookieSettingsButton } from '@/components/shared/cookie-consent-banner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const NewsletterSignup = dynamic(() => import('@/components/shared/newsletter-signup').then((mod) => mod.NewsletterSignup));

function PawLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none">
      <path d="M256 390 C 150 310 90 230 130 170 C 170 110 230 130 256 180 C 282 130 342 110 382 170 C 422 230 362 310 256 390Z" fill="#FFB347"/>
      <ellipse cx="256" cy="290" rx="40" ry="35" fill="#14b8a6"/>
      <ellipse cx="225" cy="245" rx="16" ry="20" fill="#14b8a6" transform="rotate(-15 225 245)"/>
      <ellipse cx="256" cy="235" rx="15" ry="18" fill="#14b8a6"/>
      <ellipse cx="287" cy="242" rx="15" ry="18" fill="#14b8a6" transform="rotate(10 287 242)"/>
      <ellipse cx="305" cy="262" rx="14" ry="17" fill="#14b8a6" transform="rotate(25 305 262)"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSuccess(true);
    toast.success(t('footer.newsletter_success') || 'Uspješno ste prijavljeni na newsletter!');
    setEmail('');
    
    // Reset success state after 3 seconds
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="mb-10">
      <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
        {t('footer.newsletter') || 'Newsletter'}
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        {t('footer.newsletter_desc') || 'Primajte savjete za brigu o ljubimcima i posebne ponude.'}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder={t('footer.email_placeholder') || "Vaša email adresa"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading || isSuccess}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-11 rounded-xl flex-1 focus:ring-2 focus:ring-warm-orange focus:border-transparent"
        />
        <Button
          type="submit"
          disabled={isLoading || isSuccess || !email}
          className="relative h-11 px-6 rounded-xl bg-gradient-to-r from-warm-orange to-amber-500 hover:from-warm-orange/90 hover:to-amber-500/90 text-white font-semibold shadow-lg shadow-orange-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/30"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('footer.newsletter_loading') || 'Slanje...'}</span>
              </motion.div>
            ) : isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                <span>{t('footer.newsletter_sent') || 'Poslano!'}</span>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>{t('footer.newsletter_submit') || 'Pretplati se'}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </form>
      <p className="text-xs text-gray-500 mt-3">
        {t('footer.newsletter_privacy') || 'Nema spama. Odjava u bilo kojem trenutku.'}
      </p>
    </div>
  );
}

export function Footer() {
  const { t, language } = useLanguage();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const localizedHref = (href: string) => {
    if (language !== 'en') return href;

    const localizedRoutes: Record<string, string> = {
      '/njega': '/njega/en',
      '/dresura': '/dresura/en',
      '/veterinari': '/veterinari/en',
      '/dog-friendly': '/dog-friendly/en',
      '/udomljavanje': '/udomljavanje/en',
      '/izgubljeni': '/izgubljeni/en',
      '/uzgajivacnice': '/uzgajivacnice/en',
      '/forum': '/forum/en',
    };

    return localizedRoutes[href] ?? href;
  };

  return (
    <>
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black text-gray-300 mt-auto relative overflow-hidden pb-safe">
        {/* Wave SVG at top */}
        <div className="absolute top-0 left-0 right-0 h-2 overflow-hidden">
          <svg 
            className="w-full h-12" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".25" 
              className="fill-current text-warm-orange/20"
            />
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".5" 
              className="fill-current text-warm-orange/10"
            />
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              className="fill-current text-warm-orange/5"
            />
          </svg>
        </div>
        
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 py-14 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl text-white mb-4 group">
                <PawLogo className="h-7 w-7 text-warm-orange group-hover:scale-110 transition-transform duration-300" />
                <span translate="no">
                  <span className="text-logo-orange">Pet</span><span className="text-logo-teal">Park</span>
                </span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-md">{t('footer.tagline')}</p>
              
              <FooterNewsletter />
              
              <div className="flex items-center gap-3 mt-6">
                <motion.a 
                  href="https://facebook.com/petparkhr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 group/social"
                  aria-label="Facebook"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FacebookIcon className="h-5 w-5 text-gray-300 group-hover/social:text-white transition-colors duration-300" />
                </motion.a>
                <motion.a 
                  href="https://instagram.com/petparkhr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center transition-all duration-300 group/social"
                  aria-label="Instagram"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <InstagramIcon className="h-5 w-5 text-gray-300 group-hover/social:text-white transition-colors duration-300" />
                </motion.a>
                <motion.a 
                  href="https://x.com/petparkhr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-black flex items-center justify-center transition-all duration-300 group/social"
                  aria-label="Twitter"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TwitterIcon className="h-5 w-5 text-gray-300 group-hover/social:text-white transition-colors duration-300" />
                </motion.a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{t('footer.services')}</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href={language === 'en' ? '/pretraga/en' : '/pretraga'} className="hover:text-orange-400 transition-colors">{t('footer.find_sitter')}</Link></li>
                <li><Link href={localizedHref('/njega')} className="hover:text-orange-400 transition-colors">{t('footer.grooming')}</Link></li>
                <li><Link href={localizedHref('/dresura')} className="hover:text-warm-orange transition-colors">{t('footer.training')}</Link></li>
                <li><Link href={localizedHref('/veterinari')} className="hover:text-warm-orange transition-colors">{t('footer.veterinarians')}</Link></li>
                <li><Link href="/postani-sitter" className="hover:text-teal-400 transition-colors">{t('footer.become_sitter')}</Link></li>
                <li><Link href="/hitno" className="hover:text-red-400 transition-colors font-medium">{t('footer.emergency')}</Link></li>
              </ul>

              <h4 className="font-semibold text-white mt-6 mb-3 text-xs uppercase tracking-wider">{t('footer.popular_cities')}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href={language === 'en' ? '/cuvanje-pasa-zagreb/en' : '/cuvanje-pasa-zagreb'} className="hover:text-warm-orange transition-colors">{language === 'en' ? 'Dog sitting Zagreb' : 'Čuvanje pasa Zagreb'}</Link></li>
                <li><Link href={language === 'en' ? '/cuvanje-pasa-split/en' : '/cuvanje-pasa-split'} className="hover:text-warm-orange transition-colors">{language === 'en' ? 'Dog sitting Split' : 'Čuvanje pasa Split'}</Link></li>
                <li><Link href={language === 'en' ? '/cuvanje-pasa-rijeka/en' : '/cuvanje-pasa-rijeka'} className="hover:text-warm-orange transition-colors">{language === 'en' ? 'Dog sitting Rijeka' : 'Čuvanje pasa Rijeka'}</Link></li>
                <li><Link href={language === 'en' ? '/grooming-zagreb/en' : '/grooming-zagreb'} className="hover:text-pink-400 transition-colors">{language === 'en' ? 'Grooming Zagreb' : 'Grooming Zagreb'}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{t('footer.explore')}</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/blog" className="hover:text-warm-orange transition-colors">{t('nav.blog')}</Link></li>
                <li><Link href={localizedHref('/forum')} className="hover:text-warm-orange transition-colors">{t('nav.forum')}</Link></li>
                <li><Link href="/udruge" className="hover:text-teal-400 transition-colors">{t('footer.rescue_orgs') || 'Udruge'}</Link></li>
                <li><Link href="/apelacije" className="hover:text-teal-400 transition-colors">{t('footer.appeals') || 'Apelacije'}</Link></li>
                <li><Link href={localizedHref('/dog-friendly')} className="hover:text-green-400 transition-colors">{t('footer.dog_friendly')}</Link></li>
                <li><Link href={localizedHref('/udomljavanje')} className="hover:text-pink-400 transition-colors">{t('footer.adoption')}</Link></li>
                <li><Link href={localizedHref('/izgubljeni')} className="hover:text-red-400 transition-colors">{t('footer.lost_pets')}</Link></li>
                <li><Link href={localizedHref('/uzgajivacnice')} className="hover:text-warm-orange transition-colors">{t('footer.breeders')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{t('footer.contact')}</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-warm-orange flex-shrink-0" />
                  <span>info@petpark.hr</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-warm-orange flex-shrink-0 mt-0.5" />
                  <span>{language === 'en' ? 'Rijeka, Croatia' : 'Rijeka, Hrvatska'}</span>
                </li>
              </ul>
              <div className="mt-6 space-y-2 text-sm">
                <Link href="/o-nama" className="block hover:text-warm-orange transition-colors">{t('footer.about')}</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>{t('footer.rights')}</p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/privatnost" className="hover:text-warm-orange transition-colors">{t('footer.privacy')}</Link>
              <Link href="/uvjeti" className="hover:text-warm-orange transition-colors">{t('footer.terms')}</Link>
              <Link href="/kontakt" className="hover:text-warm-orange transition-colors">{t('footer.contact')}</Link>
              <CookieSettingsButton />
            </div>
          </div>
        </div>
      </footer>
      
      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-warm-orange to-amber-500 text-white shadow-xl shadow-orange-500/30 flex items-center justify-center hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Back to top"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
