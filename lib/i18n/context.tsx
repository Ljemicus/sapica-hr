'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Language, TranslationKey } from './keys';
import { translations } from './translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'petpark-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('hr');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const routeLanguage = document.documentElement.lang as Language | '';
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;

    if (window.location.pathname.endsWith('/en') && routeLanguage === 'en') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- route locale should win on explicit locale URLs
      setLanguageState('en');
    } else if (stored && translations[stored]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from localStorage on mount
      setLanguageState(stored);
    } else if (routeLanguage && translations[routeLanguage]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync initial UI language with server-rendered route locale
      setLanguageState(routeLanguage);
    }

    setIsHydrated(true);
  }, []);

  // Keep UI copy preference client-side for now.
  // Document language should follow the route locale server-side, not localStorage.

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language]?.[key] ?? translations.hr[key] ?? key;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, isHydrated }),
    [language, setLanguage, t, isHydrated]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
