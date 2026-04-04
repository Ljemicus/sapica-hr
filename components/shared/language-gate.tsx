'use client';

import type { ReactNode } from 'react';
import { useLanguage } from '@/lib/i18n/context';

export function LanguageGate({ hr, en }: { hr: ReactNode; en: ReactNode }) {
  const { language } = useLanguage();
  return <>{language === 'en' ? en : hr}</>;
}
