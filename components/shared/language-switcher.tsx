'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, LANGUAGE_LABELS, LANGUAGE_NAMES, getPathnameForLocale } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

const languages: Language[] = ['hr', 'en'];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language, setLanguage, t, isHydrated } = useLanguage();
  const currentLanguage = isHydrated ? language : 'hr';

  const handleLanguageSelect = useCallback((lang: Language) => {
    setLanguage(lang);

    const localizedPath = getPathnameForLocale(pathname, lang);
    if (!localizedPath || localizedPath === pathname) {
      return;
    }

    const queryString = searchParams.toString();
    router.push(queryString ? `${localizedPath}?${queryString}` : localizedPath);
  }, [pathname, router, searchParams, setLanguage]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />} className="hover:bg-accent rounded-xl" aria-label={t('common.language')} title={t('common.language')}>
        <Globe className="h-5 w-5 text-teal-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        {languages.map((lang) => {
          const isActive = currentLanguage === lang;

          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageSelect(lang)}
              className={`cursor-pointer rounded-lg ${isActive ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold' : ''}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className="mr-2 text-base">{LANGUAGE_LABELS[lang].split(' ')[0]}</span>
              {LANGUAGE_NAMES[lang]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
