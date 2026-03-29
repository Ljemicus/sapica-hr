'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, LANGUAGE_LABELS, LANGUAGE_NAMES } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

const languages: Language[] = ['hr', 'en', 'it', 'sl'];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />} className="hover:bg-accent rounded-xl" aria-label="Odaberi jezik">
        <Globe className="h-5 w-5 text-teal-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`cursor-pointer rounded-lg ${language === lang ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold' : ''}`}
          >
            <span className="mr-2 text-base">{LANGUAGE_LABELS[lang].split(' ')[0]}</span>
            {LANGUAGE_NAMES[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
