'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/lib/i18n/context';
import { Menu, X, User, LogOut, PawPrint, Search, Bell, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface GlassNavbarProps {
  className?: string;
}

export function GlassNavbar({ className = '' }: GlassNavbarProps) {
  const { user, loading: _loading, signOut } = useAuth();
  const { t, language: _language } = useLanguage();
  const pathname = usePathname();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navbarRef = useRef<HTMLElement>(null);

  // Handle scroll behavior - hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold - hide navbar
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar
        setIsVisible(true);
      }
      
      // Update scrolled state for background effect
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Navigation items
  const navItems = [
    { href: '/pretraga', label: t('nav.find_sitter') },
    { href: '/njega', label: t('nav.grooming') },
    { href: '/dresura', label: t('nav.training') },
    { href: '/o-nama', label: t('nav.about') },
  ];

  const userMenuItems = [
    { href: '/profil', label: t('nav.profile'), icon: User },
    { href: '/poruke', label: t('nav.messages'), icon: MessageSquare },
    { href: '/notifikacije', label: t('nav.notifications'), icon: Bell },
  ];

  return (
    <header
      ref={navbarRef}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out',
        'backdrop-blur-md border-b',
        isScrolled 
          ? 'bg-white/70 dark:bg-black/70 border-white/20 dark:border-white/10 shadow-lg' 
          : 'bg-white/50 dark:bg-black/50 border-transparent',
        !isVisible && '-translate-y-full',
        className
      )}
      style={{
        transition: 'transform 0.3s ease-out, background-color 0.3s ease-out, border-color 0.3s ease-out',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link prefetch={false}
            href="/" 
            className="flex items-center gap-2 font-extrabold text-xl group"
            aria-label={t('common.homepage')}
          >
            <div className="relative">
              <PawPrint className="h-8 w-8 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <span className="font-[var(--font-heading)] tracking-tight">
              <span className="text-orange-500">Pet</span>
              <span className="text-teal-600 dark:text-teal-400">Park</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-white/20 dark:hover:bg-white/10',
                    isActive
                      ? 'text-orange-600 dark:text-orange-400 bg-white/30 dark:bg-white/20'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/20 dark:hover:bg-white/10"
              aria-label={t('nav.search')}
            >
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/20 dark:hover:bg-white/10 relative"
                  aria-label={t('nav.notifications')}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      className="rounded-full hover:bg-white/20 dark:hover:bg-white/10"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 backdrop-blur-md bg-white/90 dark:bg-black/90 border-white/20">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/20" />
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem key={item.href}>
                          <Link prefetch={false} href={item.href} className="cursor-pointer flex items-center">
                            <Icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('auth.sign_out')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link prefetch={false} href="/prijava">
                  <Button
                    variant="ghost"
                    className="rounded-full hover:bg-white/20 dark:hover:bg-white/10"
                  >
                    {t('auth.sign_in')}
                  </Button>
                </Link>
                <Link prefetch={false} href="/registracija">
                  <Button className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
                    {t('auth.sign_up')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full hover:bg-white/20 dark:hover:bg-white/10"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="backdrop-blur-md bg-white/95 dark:bg-black/95 border-l border-white/20 w-full max-w-sm"
            >
              <div className="flex flex-col h-full">
                {/* Mobile navigation */}
                <nav className="flex-1 py-6">
                  <div className="space-y-2">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href || pathname?.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            'block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200',
                            'hover:bg-white/20 dark:hover:bg-white/10',
                            isActive
                              ? 'text-orange-600 dark:text-orange-400 bg-white/30 dark:bg-white/20'
                              : 'text-gray-700 dark:text-gray-300'
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </nav>

                {/* Mobile user actions */}
                <div className="border-t border-white/20 pt-6">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {userMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"
                            >
                              <Icon className="h-5 w-5" />
                              {item.label}
                            </Link>
                          );
                        })}
                        <button
                          onClick={() => {
                            signOut();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
                        >
                          <LogOut className="h-5 w-5" />
                          {t('auth.sign_out')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 px-4">
                      <Link
                        href="/prijava"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button
                          variant="outline"
                          className="w-full rounded-full border-white/20 hover:bg-white/20"
                        >
                          {t('auth.sign_in')}
                        </Button>
                      </Link>
                      <Link
                        href="/registracija"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full"
                      >
                        <Button className="w-full rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
                          {t('auth.sign_up')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
