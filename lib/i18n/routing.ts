import type { Language } from './keys';

export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';
export const LOCALE_HEADER = 'x-petpark-locale';

export const DEFAULT_LOCALE: Language = 'hr';
export const SUPPORTED_LOCALES = ['hr', 'en'] as const satisfies readonly Language[];

const KNOWN_LOCALE_ROUTE_PAIRS = {
  '/cuvanje-pasa-zagreb': {
    hr: '/cuvanje-pasa-zagreb',
    en: '/cuvanje-pasa-zagreb/en',
  },
  '/cuvanje-pasa-split': {
    hr: '/cuvanje-pasa-split',
    en: '/cuvanje-pasa-split/en',
  },
  '/cuvanje-pasa-rijeka': {
    hr: '/cuvanje-pasa-rijeka',
    en: '/cuvanje-pasa-rijeka/en',
  },
  '/grooming-zagreb': {
    hr: '/grooming-zagreb',
    en: '/grooming-zagreb/en',
  },
  '/veterinari': {
    hr: '/veterinari',
    en: '/veterinari/en',
  },
  '/njega': {
    hr: '/njega',
    en: '/njega/en',
  },
  '/grooming': {
    hr: '/njega',
    en: '/njega/en',
  },
  '/dresura': {
    hr: '/dresura',
    en: '/dresura/en',
  },
  '/dog-friendly': {
    hr: '/dog-friendly',
    en: '/dog-friendly/en',
  },
  '/izgubljeni': {
    hr: '/izgubljeni',
    en: '/izgubljeni/en',
  },
  '/udomljavanje': {
    hr: '/udomljavanje',
    en: '/udomljavanje/en',
  },
  '/uzgajivacnice': {
    hr: '/uzgajivacnice',
    en: '/uzgajivacnice/en',
  },
  '/pretraga': {
    hr: '/pretraga',
    en: '/pretraga/en',
  },
  '/faq': {
    hr: '/faq',
    en: '/faq/en',
  },
  '/forum': {
    hr: '/forum',
    en: '/forum/en',
  },
  '/verifikacija': {
    hr: '/verifikacija',
    en: '/verifikacija/en',
  },
} as const satisfies Record<string, Partial<Record<Language, string>>>;

/**
 * Detail-route prefixes where /en/[id] variants exist as real pages.
 * Only add a prefix here once the EN route file has been created.
 */
const DETAIL_LOCALE_PREFIXES = [
  '/udomljavanje',
  '/izgubljeni',
] as const;

export type LocaleRouteKey = keyof typeof KNOWN_LOCALE_ROUTE_PAIRS;

function normalizePathname(pathname: string) {
  if (!pathname) return '/';
  if (pathname === '/') return pathname;
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function stripQueryAndHash(pathname: string) {
  return pathname.split('#')[0]?.split('?')[0] || '/';
}

export function detectLocaleFromPathname(pathname: string): Language {
  const cleanPath = normalizePathname(stripQueryAndHash(pathname));
  if (cleanPath.endsWith('/en')) return 'en';
  // Detect /en/ infix in detail routes: /udomljavanje/en/[id]
  for (const prefix of DETAIL_LOCALE_PREFIXES) {
    if (cleanPath.startsWith(prefix + '/en/')) return 'en';
  }
  return DEFAULT_LOCALE;
}

export function getLocaleBasePath(pathname: string): string {
  const cleanPath = normalizePathname(stripQueryAndHash(pathname));
  // Strip trailing /en for list pages: /udomljavanje/en → /udomljavanje
  if (cleanPath.endsWith('/en')) {
    return cleanPath.slice(0, -'/en'.length) || '/';
  }
  // Strip interior /en/ for detail pages: /udomljavanje/en/[id] → /udomljavanje/[id]
  for (const prefix of DETAIL_LOCALE_PREFIXES) {
    const enInfix = prefix + '/en/';
    if (cleanPath.startsWith(enInfix)) {
      return prefix + '/' + cleanPath.slice(enInfix.length);
    }
  }
  return cleanPath;
}

export function getPathnameForLocale(pathname: string, locale: Language): string | null {
  const cleanPath = normalizePathname(stripQueryAndHash(pathname));
  const basePath = getLocaleBasePath(cleanPath);
  const routeGroup = KNOWN_LOCALE_ROUTE_PAIRS[basePath as LocaleRouteKey];

  if (routeGroup) {
    return routeGroup[locale] ?? null;
  }

  // Handle dynamic detail routes: /udomljavanje/[id] ↔ /udomljavanje/en/[id]
  for (const prefix of DETAIL_LOCALE_PREFIXES) {
    // Match HR detail path: /prefix/[id]
    if (basePath.startsWith(prefix + '/') && basePath !== prefix) {
      const slug = basePath.slice(prefix.length); // e.g. "/some-uuid"
      return locale === 'en' ? `${prefix}/en${slug}` : `${prefix}${slug}`;
    }
  }

  return locale === DEFAULT_LOCALE ? cleanPath : null;
}

export function getLocaleUrl(pathname: string, locale: Language): string | null {
  const localizedPathname = getPathnameForLocale(pathname, locale);
  return localizedPathname ? new URL(localizedPathname, BASE_URL).toString() : null;
}

export function buildLanguageAlternates(pathname: string): Partial<Record<Language | 'x-default', string>> {
  const alternates: Partial<Record<Language | 'x-default', string>> = {};

  for (const locale of SUPPORTED_LOCALES) {
    const url = getLocaleUrl(pathname, locale);
    if (url) {
      alternates[locale] = url;
    }
  }

  const defaultUrl = getLocaleUrl(pathname, DEFAULT_LOCALE);
  if (defaultUrl) {
    alternates['x-default'] = defaultUrl;
  }

  return alternates;
}

export function getLocaleSegment(locale: Language): '' | '/en' {
  return locale === 'en' ? '/en' : '';
}

export const localeRoutePairs = KNOWN_LOCALE_ROUTE_PAIRS;
