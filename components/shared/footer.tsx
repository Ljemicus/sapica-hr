import Link from 'next/link';
import { MapPin, Mail } from 'lucide-react';
import { NewsletterSignup } from '@/components/shared/newsletter-signup';

function PawLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="currentColor">
      <ellipse cx="14" cy="17.5" rx="4" ry="4.8" />
      <ellipse cx="8.5" cy="10.5" rx="2.3" ry="3.2" />
      <ellipse cx="19.5" cy="10.5" rx="2.3" ry="3.2" />
      <ellipse cx="5.5" cy="16" rx="2" ry="2.8" />
      <ellipse cx="22.5" cy="16" rx="2" ry="2.8" />
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
  return (
    <>
    <div className="hidden md:block">
      <NewsletterSignup />
    </div>
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-auto relative overflow-hidden hidden md:block">
      <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
      <div className="container mx-auto px-4 py-14 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl text-white mb-4 group">
              <PawLogo className="h-7 w-7 text-orange-400 group-hover:scale-110 transition-transform" />
              <span>
                <span className="text-orange-400">Pet</span><span className="text-teal-400">Park</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Povežite se s pouzdanim čuvarima ljubimaca u vašem gradu.
              Vaš ljubimac zaslužuje najbolju brigu.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-all duration-200 hover:scale-105" aria-label="Facebook">
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-all duration-200 hover:scale-105" aria-label="Instagram">
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-all duration-200 hover:scale-105" aria-label="Twitter">
                <TwitterIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">PetPark</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/pretraga" className="hover:text-orange-400 transition-colors">Pretraži sittere</Link></li>
              <li><Link href="/njega" className="hover:text-orange-400 transition-colors">Grooming & Njega</Link></li>
              <li><Link href="/dresura" className="hover:text-orange-400 transition-colors">Dresura & Trening</Link></li>
              <li><Link href="/zajednica" className="hover:text-orange-400 transition-colors">Zajednica & Blog</Link></li>
              <li><Link href="/forum" className="hover:text-orange-400 transition-colors">Forum</Link></li>
              <li><Link href="/shop" className="hover:text-orange-400 transition-colors">Shop</Link></li>
              <li><Link href="/veterinari" className="hover:text-orange-400 transition-colors">Veterinari</Link></li>
              <li><Link href="/registracija?role=sitter" className="hover:text-teal-400 transition-colors">Postani sitter</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Podrška</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/faq" className="hover:text-orange-400 transition-colors">Česta pitanja</Link></li>
              <li><Link href="/kontakt" className="hover:text-orange-400 transition-colors">Kontakt</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Sigurnost</Link></li>
              <li><Link href="#" className="hover:text-orange-400 transition-colors">Pravila zajednice</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Kontakt</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-400 flex-shrink-0" />
                <span>petparkhr@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <span>Zagreb, Hrvatska</span>
              </li>
            </ul>
            <div className="mt-6 space-y-2 text-sm">
              <Link href="/uvjeti" className="block hover:text-orange-400 transition-colors">Uvjeti korištenja</Link>
              <Link href="/privatnost" className="block hover:text-orange-400 transition-colors">Politika privatnosti</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; 2026 PetPark d.o.o. Sva prava pridržana.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privatnost" className="hover:text-orange-400 transition-colors">Privatnost</Link>
            <Link href="/uvjeti" className="hover:text-orange-400 transition-colors">Uvjeti</Link>
            <Link href="/kontakt" className="hover:text-orange-400 transition-colors">Kontakt</Link>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
