import Link from 'next/link';
import { Menu, MessageCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { PawLogo } from './paw-logo';
import {
  getMobileAccountLinks,
  getMobileCommunityLinks,
  getMobilePrimaryLinks,
  getMobileUtilityLinks,
} from './config';
import type { NavbarUser, TranslationFn } from './types';

interface MobileSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  t: TranslationFn;
  user?: NavbarUser | null;
  getItemCount: () => number;
  onLogout: () => Promise<void>;
}

export function MobileSheet({ open, setOpen, t, user, getItemCount, onLogout }: MobileSheetProps) {
  const primaryLinks = getMobilePrimaryLinks(t);
  const utilityLinks = getMobileUtilityLinks(t);
  const communityLinks = getMobileCommunityLinks(t);
  const accountLinks = getMobileAccountLinks(t, user);

  const renderLink = (href: string, label: string, Icon?: React.ComponentType<{ className?: string }>, className?: string) => (
    <Link href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors ${className || ''}`}>
      {Icon ? <Icon className="h-5 w-5" /> : null}
      {label}
    </Link>
  );

  return (
    <div className="flex items-center gap-1.5 md:hidden">
      <Link href="/kontakt">
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent rounded-xl" aria-label={t('common.help')}>
          <MessageCircle className="h-4.5 w-4.5 text-orange-500" />
        </Button>
      </Link>
      <Link href="/shop/kosarica">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-accent rounded-xl" aria-label={t('common.cart')}>
          <ShoppingCart className="h-4.5 w-4.5" />
          {getItemCount() > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-orange-500 text-white text-[8px] font-bold flex items-center justify-center">
              {getItemCount() > 99 ? '99+' : getItemCount()}
            </span>
          )}
        </Button>
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" />} className="md:hidden rounded-xl" aria-label="Otvori izbornik">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] p-0">
          <div className="flex flex-col h-full">
            <div className="p-5 border-b border-border/50">
              {user ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-orange-200 dark:ring-orange-800">
                    <AvatarImage src={user.avatar_url || ''} alt={user.name || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-teal-400 text-white font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <LanguageSwitcher />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PawLogo className="h-9 w-9 text-orange-500" />
                    <span className="font-extrabold text-lg">
                      <span className="text-orange-500">Pet</span><span className="text-teal-600 dark:text-teal-400">Park</span>
                    </span>
                  </div>
                  <LanguageSwitcher />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {primaryLinks.slice(0, 1).map((item) => renderLink(item.href, item.label, item.icon, item.className))}
              <div className="border-t border-border/50 my-3" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{t('nav.services')}</p>
              {primaryLinks.slice(1).map((item) => renderLink(item.href, item.label, item.icon, item.className))}

              <div className="border-t border-border/50 my-3" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Ogledni prikaz (Demo)</p>
              {utilityLinks.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground hover:bg-accent transition-colors ${item.className || ''}`}>
                  {item.icon ? <item.icon className="h-5 w-5" /> : null}
                  {item.label}
                  {item.demo ? <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 font-medium">Demo</span> : null}
                </Link>
              ))}

              <div className="border-t border-border/50 my-3" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Zajednica</p>
              {communityLinks.map((item) => renderLink(item.href, item.label, item.icon, item.className))}

              {user ? (
                <>
                  <div className="border-t border-border/50 my-3" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Račun</p>
                  {accountLinks.map((item) => renderLink(item.href, item.label, item.icon, item.className))}
                  <button
                    onClick={async () => {
                      await onLogout();
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left"
                  >
                    <span className="h-5 w-5 flex items-center justify-center">↩</span>
                    {t('nav.logout')}
                  </button>
                </>
              ) : null}
            </div>

            {!user ? (
              <div className="p-4 border-t border-border/50 space-y-2">
                <Link href="/prijava" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl">{t('nav.login')}</Button>
                </Link>
                <Link href="/registracija" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold">{t('nav.register')}</Button>
                </Link>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
