'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/lib/i18n';
import { PawLogo } from '@/components/shared/navbar/paw-logo';
import { DesktopNav } from '@/components/shared/navbar/desktop-nav';
import { DesktopActions } from '@/components/shared/navbar/desktop-actions';
import { MobileSheet } from '@/components/shared/navbar/mobile-sheet';

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingRescueCount, setPendingRescueCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch pending rescue count for admin users
  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/admin/rescue-pending-count')
        .then(res => res.json())
        .then(data => {
          if (data.count) {
            setPendingRescueCount(data.count);
          }
        })
        .catch(() => {
          // Silently fail - badge just won't show
        });
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'glass-strong shadow-sm border-b border-border/50 h-14'
          : 'bg-background/80 backdrop-blur-sm border-b border-transparent h-16'
      }`}
      role="banner"
    >
      <div className="container mx-auto flex items-center justify-between px-4 h-full">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl group" aria-label={t('common.homepage')} lang={language}>
          <div className="relative">
            <PawLogo className="h-10 w-10 text-warm-orange group-hover:scale-110 transition-transform duration-200" />
          </div>
          <span className="font-[var(--font-heading)] tracking-tight">
            <span className="text-warm-orange">Pet</span><span className="text-teal-600 dark:text-teal-400">Park</span>
          </span>
        </Link>

        <DesktopNav t={t} user={user} language={language} />
        <DesktopActions 
          t={t} 
          user={user} 
          loading={loading} 
          signOut={signOut}
          pendingRescueCount={pendingRescueCount}
        />
        <MobileSheet 
          open={open} 
          setOpen={setOpen} 
          t={t} 
          language={language} 
          user={user} 
          onLogout={handleLogout}
          pendingRescueCount={pendingRescueCount}
        />
      </div>
    </header>
  );
}
