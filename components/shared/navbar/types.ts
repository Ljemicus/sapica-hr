import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import type React from 'react';
import type { TranslationKey } from '@/lib/i18n';

export interface NavbarUser {
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: 'owner' | 'sitter' | 'admin' | string;
}

export interface NavbarLinkItem {
  href: string;
  label: string | React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  external?: boolean;
  demo?: boolean;
}

export interface NavbarMenuItem extends NavbarLinkItem {
  separatorBefore?: boolean;
}

export interface NavbarActionItem {
  href: string;
  label: string;
  icon: LucideIcon;
  className?: string;
}

export type TranslationFn = (key: TranslationKey) => string;
export type LanguageSwitcherComponent = ComponentType;
