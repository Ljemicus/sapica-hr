'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

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

export function Footer() {
  const { t, language } = useLanguage();
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
      <div className="hidden md:block">
        <NewsletterSignup />
      </div>
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-auto relative overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 py-14 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl text-white mb-4 group">
                <PawLogo className="h-7 w-7 text-warm-orange group-hover:scale-110 transition-transform" />
                <span>
                  <span className="text-warm-orange">Pet</span><span className="text-teal-400">Park</span>
                </span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">{t('footer.tagline')}</p>
              <div className="flex items-center gap-3">
                <a href="https://facebook.com/petparkhr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-warm-orange flex items-center justify-center transition-all duration-200 hover:scale-105" aria-label="Facebook">
                  <FacebookIcon className="h-4 w-4" />
                </a>
                <a href="https://instagram.com/petparkhr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-warm-orange flex items-center justify-center transition-all duration-200 hover:scale-105" aria-label="Instagram">
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a href="https://x.com/petparkhr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-warm-orange flex items-center justify-center transition-all duration-200 hover:scale-105" aria-label="Twitter">
                  <TwitterIcon className="h-4 w-4" />
                </a>
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
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
