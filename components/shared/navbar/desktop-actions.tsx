import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { getHeaderActions, getUserMenuItems } from './config';
import type { NavbarUser, TranslationFn } from './types';

interface DesktopActionsProps {
  t: TranslationFn;
  user?: NavbarUser | null;
  loading: boolean;
  getItemCount: () => number;
  signOut: () => Promise<void>;
}

export function DesktopActions({ t, user, loading, getItemCount, signOut }: DesktopActionsProps) {
  const router = useRouter();
  const actions = getHeaderActions(t);
  const userMenuItems = getUserMenuItems(t, user);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="hidden md:flex items-center gap-2">
      <LanguageSwitcher />
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <Button variant="ghost" size="icon" className="hover:bg-accent rounded-xl" aria-label={action.label}>
              <Icon className="h-5 w-5 text-orange-500" />
            </Button>
          </Link>
        );
      })}
      {loading ? (
        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
      ) : user ? (
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-orange-200 dark:ring-orange-800 hover:ring-orange-400 dark:hover:ring-orange-600 transition-all" />}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar_url || ''} alt={user.name || ''} />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-teal-400 text-white text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <div className="flex items-center gap-2 p-3">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              {userMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.href}>
                    {item.separatorBefore ? <DropdownMenuSeparator /> : null}
                    <DropdownMenuItem render={<Link href={item.href} />} className={`cursor-pointer rounded-lg ${item.className || ''}`}>
                      {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
                      {item.label}
                    </DropdownMenuItem>
                  </div>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400 rounded-lg">
                <LogOut className="mr-2 h-4 w-4" />
                {t('nav.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/prijava">
            <Button variant="ghost" size="sm" className="hover:bg-accent rounded-lg">{t('nav.login')}</Button>
          </Link>
          <Link href="/registracija">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 shadow-md shadow-orange-200/50 dark:shadow-orange-900/30 btn-hover rounded-lg font-semibold">{t('nav.register')}</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
