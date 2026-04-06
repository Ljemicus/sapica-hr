import Link from 'next/link';
import { ChevronDown, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getDesktopLinks, getHksMenu, getServicesMenu } from './config';
import type { NavbarUser, TranslationFn } from './types';
import type { Language } from '@/lib/i18n';

export function DesktopNav({ t, user, language = 'hr' }: { t: TranslationFn; user?: NavbarUser | null; language?: Language }) {
  const desktopLinks = getDesktopLinks(t, user, language);
  const servicesMenu = getServicesMenu(t, language);
  const hksMenu = getHksMenu();

  return (
    <nav className="hidden md:flex items-center gap-1" aria-label={t('common.main_navigation')}>
      {desktopLinks.slice(0, 1).map((item) => (
        <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent">
          {item.label}
        </Link>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger render={<button />} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-accent">
          {t('nav.services')} <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 rounded-xl">
          {servicesMenu.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.href}>
                {item.separatorBefore ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem render={<Link href={item.href} />} className={`cursor-pointer rounded-lg ${item.className || ''}`}>
                  {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
                  {item.label}
                  {item.demo ? <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 bg-amber-50 text-amber-600 border-amber-200">Demo</Badge> : null}
                </DropdownMenuItem>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {desktopLinks.slice(1, 5).map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent">
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {item.label}
          </Link>
        );
      })}

      {desktopLinks.slice(5, 7).map((item) => {
        const Icon = item.icon;
        const isLostPets = item.href.includes('/izgubljeni');
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={cn(
              "text-sm font-medium transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent",
              item.className || 'text-muted-foreground hover:text-foreground'
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {item.label}
            {isLostPets ? <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> : null}
          </Link>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger render={<button />} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-accent">
          <Shield className="h-4 w-4 text-blue-500 mr-1" /> HKS <ChevronDown className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 rounded-xl">
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground">Hrvatski kinološki savez</p>
          </div>
          <DropdownMenuSeparator />
          {hksMenu.map((item) => {
            const Icon = item.icon;
            const rendered = item.external
              ? <a href={item.href} target="_blank" rel="noopener noreferrer" />
              : <Link href={item.href} />;

            return (
              <div key={item.href}>
                {item.separatorBefore ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem render={rendered} className="cursor-pointer rounded-lg">
                  {Icon ? <Icon className="mr-2 h-4 w-4 text-teal-500" /> : null}
                  {item.label}
                </DropdownMenuItem>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {desktopLinks.slice(7).map((item) => (
        <Link key={item.href} href={item.href} className={item.className || ''}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
