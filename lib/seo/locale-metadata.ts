import type { Metadata } from 'next';

import { SUPPORTED_LOCALES, buildLanguageAlternates, detectLocaleFromPathname, getLocaleUrl } from '@/lib/i18n/routing';

const OPEN_GRAPH_LOCALE_BY_LANGUAGE = {
  hr: 'hr_HR',
  en: 'en_US',
} as const;

export function buildLocaleAlternates(pathname: string): NonNullable<Metadata['alternates']> {
  return {
    canonical: getLocaleUrl(pathname, detectLocaleFromPathname(pathname)) ?? pathname,
    languages: buildLanguageAlternates(pathname),
  };
}

export function buildLocaleOpenGraph(pathname: string): NonNullable<Metadata['openGraph']> {
  const locale = detectLocaleFromPathname(pathname);
  const url = getLocaleUrl(pathname, locale) ?? pathname;
  const alternateLocale = SUPPORTED_LOCALES
    .filter((candidate) => candidate !== locale)
    .map((candidate) => getLocaleUrl(pathname, candidate))
    .filter((candidateUrl): candidateUrl is string => Boolean(candidateUrl))
    .map((candidateUrl) => OPEN_GRAPH_LOCALE_BY_LANGUAGE[detectLocaleFromPathname(candidateUrl)]);

  return {
    url,
    locale: OPEN_GRAPH_LOCALE_BY_LANGUAGE[locale],
    alternateLocale: alternateLocale.length > 0 ? alternateLocale : undefined,
  };
}

export function getHtmlLangForPathname(pathname: string) {
  return detectLocaleFromPathname(pathname);
}
