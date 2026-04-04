import type { Metadata } from 'next';

import { buildLanguageAlternates, detectLocaleFromPathname, getLocaleUrl } from '@/lib/i18n/routing';

export function buildLocaleAlternates(pathname: string): NonNullable<Metadata['alternates']> {
  return {
    canonical: getLocaleUrl(pathname, detectLocaleFromPathname(pathname)) ?? pathname,
    languages: buildLanguageAlternates(pathname),
  };
}

export function getHtmlLangForPathname(pathname: string) {
  return detectLocaleFromPathname(pathname);
}
