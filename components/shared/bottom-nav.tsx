'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/lib/i18n';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const blogHref = language === 'en' ? '/blog/en' : '/blog';

  const navItems = [
    { href: '/', icon: Home, label: t('common.home') },
    { href: '/pretraga', icon: Search, label: t('common.search') },
    { href: blogHref, icon: MessageSquare, label: 'Blog' },
  ];

  const dashboardLink = user?.role === 'sitter'
    ? '/dashboard/sitter'
    : user?.role === 'admin'
    ? '/admin'
    : user
    ? '/dashboard/vlasnik'
    : '/prijava';

  const allItems = [
    ...navItems,
    { href: dashboardLink, icon: User, label: user ? t('common.profile') : t('nav.login') },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-border/50"
      role="navigation"
      aria-label={t('common.mobile_navigation')}
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {allItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[3.5rem] ${
                isActive
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`relative p-1 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-orange-100 dark:bg-orange-900/30' : ''
              }`}>
                <item.icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for devices with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
