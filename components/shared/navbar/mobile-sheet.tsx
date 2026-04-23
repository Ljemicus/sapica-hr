import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { PawLogo } from './paw-logo';
import {
  getMobileAccountLinks,
  getMobileCommunityLinks,
  getMobilePrimaryLinks,
} from './config';
import type { NavbarUser, TranslationFn } from './types';
import type { Language } from '@/lib/i18n';

interface MobileSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  t: TranslationFn;
  language?: Language;
  user?: NavbarUser | null;
  onLogout: () => Promise<void>;
  pendingRescueCount?: number;
}

export function MobileSheet({ open, setOpen, t, language = 'hr', user, onLogout, pendingRescueCount = 0 }: MobileSheetProps) {
  const primaryLinks = getMobilePrimaryLinks(t, language);
  const communityLinks = getMobileCommunityLinks(t, language);
  const accountLinks = getMobileAccountLinks(t, user);

  const renderLink = (href: string, label: string | React.ReactNode, Icon?: React.ComponentType<{ className?: string }>, className?: string, badge?: number) => (
    <Link href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-foreground hover:bg-accent transition-colors min-h-[48px] ${className || ''}`}>
      {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
      <span className="flex-1">{label}</span>
      {badge && badge > 0 ? (
        <Badge className="bg-rose-500 text-white border-0 text-xs px-2 py-0.5">
          {badge > 9 ? '9+' : badge}
        </Badge>
      ) : null}
    </Link>
  );

  return (
    <div className="flex items-center gap-1.5 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" />} className="md:hidden rounded-xl min-w-[44px] min-h-[44px]" aria-label={t('common.open_menu')}>
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
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <LanguageSwitcher />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PawLogo className="h-9 w-9 text-orange-500" />
                    <span className="font-extrabold text-lg" translate="no">
                      <span className="text-logo-orange">Pet</span><span className="text-logo-teal">Park</span>
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{t('common.community')}</p>
              {communityLinks.map((item) => renderLink(item.href, item.label, item.icon, item.className))}

              {user ? (
                <>
                  <div className="border-t border-border/50 my-3" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">{t('common.account')}</p>
                  {accountLinks.map((item) => {
                    // Show badge on admin/founder dashboard link
                    const badge = (user.role === 'admin' && (item.href === '/admin' || item.href === '/admin/founder-dashboard')) 
                      ? pendingRescueCount 
                      : undefined;
                    return renderLink(item.href, item.label, item.icon, item.className, badge);
                  })}
                  <button
                    onClick={async () => {
                      await onLogout();
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left min-h-[48px]"
                  >
                    <span className="h-5 w-5 flex items-center justify-center shrink-0">↩</span>
                    <span>{t('nav.logout')}</span>
                  </button>
                </>
              ) : null}
            </div>

            {!user ? (
              <div className="p-4 border-t border-border/50 space-y-2">
                <Link href="/prijava" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl min-h-[48px]">{t('nav.login')}</Button>
                </Link>
                <Link href="/registracija" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold min-h-[48px]">{t('nav.register')}</Button>
                </Link>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
