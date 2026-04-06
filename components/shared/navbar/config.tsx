import {
  AlertTriangle,
  Baby,
  BookOpen,
  Dog,
  FileHeart,
  GraduationCap,
  Heart,
  HeartHandshake,
  MapPin,
  MessageCircle,
  MessageSquare,
  PawPrint,
  Scissors,
  Search,
  Shield,
  Siren,
  Sparkles,
  Star,
  Stethoscope,
  User,
  LogOut,
} from 'lucide-react';
import type { NavbarActionItem, NavbarLinkItem, NavbarMenuItem, NavbarUser, TranslationFn } from './types';
import type { Language } from '@/lib/i18n';

export function localizeHref(href: string, language: Language) {
  if (language !== 'en') return href;

  const localizedRoutes: Record<string, string> = {
    '/njega': '/njega/en',
    '/dresura': '/dresura/en',
    '/veterinari': '/veterinari/en',
    '/dog-friendly': '/dog-friendly/en',
    '/izgubljeni': '/izgubljeni/en',
    '/udomljavanje': '/udomljavanje/en',
    '/uzgajivacnice': '/uzgajivacnice/en',
    '/faq': '/faq/en',
    '/verifikacija': '/verifikacija/en',
    '/forum': '/forum/en',
  };

  return localizedRoutes[href] ?? href;
}

export const localizeHrefForLocale = localizeHref;

export function getDashboardLink(user?: NavbarUser | null) {
  return user?.role === 'sitter' ? '/dashboard/sitter' : user?.role === 'admin' ? '/admin' : '/dashboard/vlasnik';
}

export function getDesktopLinks(t: TranslationFn, user?: NavbarUser | null, language: Language = 'hr'): NavbarLinkItem[] {
  return [
    { href: '/o-nama', label: t('nav.about') },
    { href: '/blog', label: t('nav.blog'), icon: BookOpen },
    { href: localizeHref('/forum', language), label: t('nav.forum'), icon: MessageSquare },
    { href: localizeHref('/izgubljeni', language), label: t('nav.lost'), icon: AlertTriangle, className: 'text-red-500 hover:text-red-600 transition-colors' },
    ...(!user ? [{ href: '/postani-sitter', label: t('nav.become_sitter'), className: 'text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/20' }] : []),
  ];
}

export function getServicesMenu(t: TranslationFn, language: Language = 'hr'): NavbarMenuItem[] {
  return [
    { href: '/pretraga', label: t('nav.sitters'), icon: Search },
    { href: '/ai-matching', label: 'AI Matching', icon: Sparkles, className: 'text-purple-600 dark:text-purple-400 font-medium' },
    { href: localizeHref('/njega', language), label: t('nav.grooming'), icon: Scissors },
    { href: localizeHref('/dresura', language), label: t('nav.training'), icon: GraduationCap },
    { href: localizeHref('/veterinari', language), label: t('nav.veterinarians'), icon: Stethoscope },
    { href: '/hitno', label: t('nav.emergency'), icon: Siren, className: 'text-red-600 dark:text-red-400 font-medium' },
    { href: localizeHref('/uzgajivacnice', language), label: t('nav.breeders'), icon: Baby },
    { href: localizeHref('/dog-friendly', language), label: 'Dog-Friendly', icon: Dog },
  ];
}

export function getHksMenu(): NavbarMenuItem[] {
  return [
    { href: 'https://www.hks.hr/hr/', label: 'Naslovnica HKS', icon: Shield, external: true },
    { href: 'https://program.hks.hr/login', label: 'HKS online program', icon: FileHeart, external: true },
    { href: 'https://www.hks.hr/hr/top-dog-2026', label: 'Top Dog 2026', icon: Star, external: true },
    { href: 'https://www.hks.hr/hr/dalmatia-dog-shows-2026-2', label: 'Dalmatia Shows 2026', icon: MapPin, external: true, separatorBefore: true },
    { href: 'https://www.hks.hr/hr/varazdin-dog-shows-2026-2', label: 'Varaždin Shows 2026', icon: MapPin, external: true },
    { href: 'https://www.hks.hr/hr/umag-dog-shows-2026-2', label: 'Umag Shows 2026', icon: MapPin, external: true },
  ];
}

export function getHeaderActions(t: TranslationFn): NavbarActionItem[] {
  return [
    { href: '/kontakt', label: t('common.help'), icon: MessageCircle },
  ];
}

export function getUserMenuItems(t: TranslationFn, user?: NavbarUser | null): NavbarMenuItem[] {
  const items: NavbarMenuItem[] = [
    { href: getDashboardLink(user), label: t('nav.dashboard'), icon: User },
    { href: '/poruke', label: t('nav.messages'), icon: MessageCircle },
    { href: '/omiljeni', label: t('nav.favorites'), icon: Heart },
  ];

  if (user?.role === 'owner') {
    items.push({ href: '/dashboard/vlasnik', label: t('nav.view_pets'), icon: FileHeart, separatorBefore: true });
  }

  if (user && user.role !== 'admin') {
    items.push({ href: '/dashboard/adoption', label: t('nav.adoption_listings'), icon: HeartHandshake, separatorBefore: user.role !== 'owner' });
  }

  if (user?.role !== 'sitter') {
    items.push({ href: '/postani-sitter', label: t('nav.become_sitter'), icon: Sparkles, separatorBefore: true, className: 'text-teal-600 dark:text-teal-400 font-medium' });
  }

  return items;
}

export function getMobilePrimaryLinks(t: TranslationFn, language: Language = 'hr'): NavbarLinkItem[] {
  return [
    { href: '/o-nama', label: t('nav.about'), icon: Heart },
    { href: '/pretraga', label: t('nav.sitters'), icon: Search },
    { href: localizeHref('/njega', language), label: t('nav.grooming'), icon: Scissors },
    { href: localizeHref('/dresura', language), label: t('nav.training'), icon: GraduationCap },
    { href: localizeHref('/veterinari', language), label: t('nav.veterinarians'), icon: Stethoscope },
    { href: '/hitno', label: t('nav.emergency'), icon: Siren, className: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold' },
  ];
}

export function getMobileUtilityLinks(_t: TranslationFn): NavbarLinkItem[] {
  return [
  ];
}

export function getMobileCommunityLinks(t: TranslationFn, language: Language = 'hr'): NavbarLinkItem[] {
  return [
    { href: '/blog', label: t('nav.blog'), icon: BookOpen },
    { href: localizeHref('/forum', language), label: t('nav.forum'), icon: MessageSquare },
    { href: '/udruge', label: t('nav.rescue_orgs') || 'Udruge', icon: HeartHandshake, className: 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 font-medium' },
    { href: localizeHref('/dog-friendly', language), label: 'Dog-Friendly', icon: Dog, className: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 font-medium' },
    { href: localizeHref('/izgubljeni', language), label: t('nav.lost'), icon: AlertTriangle, className: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold' },
    { href: localizeHref('/udomljavanje', language), label: t('footer.adoption'), icon: HeartHandshake, className: 'text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/20 font-semibold' },
    { href: localizeHref('/uzgajivacnice', language), label: t('nav.breeders'), icon: PawPrint },
  ];
}

export function getMobileAccountLinks(t: TranslationFn, user?: NavbarUser | null): NavbarLinkItem[] {
  const items: NavbarLinkItem[] = [
    { href: getDashboardLink(user), label: t('nav.dashboard'), icon: User },
    { href: '/omiljeni', label: t('nav.favorites'), icon: Heart },
  ];

  if (user && user.role !== 'admin') {
    items.push({ href: '/dashboard/adoption', label: t('nav.adoption_listings'), icon: HeartHandshake });
  }

  if (user?.role !== 'sitter') {
    items.push({ href: '/postani-sitter', label: t('nav.become_sitter'), icon: Sparkles, className: 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 font-semibold' });
  }

  return items;
}

export const mobileLogoutAction = { icon: LogOut };
