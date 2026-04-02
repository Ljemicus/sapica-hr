import {
  AlertTriangle,
  Baby,
  BookOpen,
  Camera,
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
  ShoppingBag,
  Siren,
  Sparkles,
  Star,
  Stethoscope,
  User,
  LogOut,
} from 'lucide-react';
import type { NavbarActionItem, NavbarLinkItem, NavbarMenuItem, NavbarUser, TranslationFn } from './types';

export function getDashboardLink(user?: NavbarUser | null) {
  return user?.role === 'sitter' ? '/dashboard/sitter' : user?.role === 'admin' ? '/admin' : '/dashboard/vlasnik';
}

export function getDesktopLinks(t: TranslationFn, user?: NavbarUser | null): NavbarLinkItem[] {
  return [
    { href: '/o-nama', label: 'O nama' },
    { href: '/shop', label: t('nav.shop'), icon: ShoppingBag },
    { href: '/zajednica', label: t('nav.blog'), icon: BookOpen },
    { href: '/forum', label: t('nav.forum'), icon: MessageSquare },
    { href: '/udomljavanje', label: 'Udomljavanje', icon: HeartHandshake, className: 'text-sm font-semibold text-pink-500 hover:text-pink-600 dark:text-pink-400 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/20' },
    { href: '/uzgajivacnice', label: 'Uzgajivači', icon: PawPrint, className: 'text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20' },
    { href: '/izgubljeni', label: t('nav.lost'), icon: AlertTriangle, className: 'text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 relative' },
    ...(!user ? [{ href: '/postani-sitter', label: t('nav.become_sitter'), className: 'text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/20' }] : []),
  ];
}

export function getServicesMenu(t: TranslationFn): NavbarMenuItem[] {
  return [
    { href: '/pretraga', label: t('nav.sitters'), icon: Search },
    { href: '/njega', label: t('nav.grooming'), icon: Scissors },
    { href: '/dresura', label: t('nav.training'), icon: GraduationCap },
    { href: '/veterinari', label: t('nav.veterinarians'), icon: Stethoscope },
    { href: '/hitno', label: 'Hitna pomoć', icon: Siren, className: 'text-red-600 dark:text-red-400 font-medium' },
    { href: '/uzgajivacnice', label: 'Uzgajivači', icon: Baby },
    { href: '/dog-friendly', label: 'Dog-Friendly', icon: Dog },
    { href: '/setnja/walk1111-1111-1111-1111-111111111111', label: t('nav.gps_tracking'), icon: MapPin, separatorBefore: true, demo: true },
    { href: '/azuriranja/book1111-1111-1111-1111-111111111111', label: t('nav.photo_updates'), icon: Camera, demo: true },
    { href: '/ljubimac/pet11111-1111-1111-1111-111111111111/karton', label: t('nav.health_card'), icon: Heart, demo: true },
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

  // All authenticated non-admin users can publish adoption listings
  if (user && user.role !== 'admin') {
    items.push({ href: '/dashboard/adoption', label: 'Oglasi za udomljavanje', icon: HeartHandshake, separatorBefore: user.role !== 'owner' });
  }

  if (user?.role !== 'sitter') {
    items.push({ href: '/postani-sitter', label: t('nav.become_sitter'), icon: Sparkles, separatorBefore: true, className: 'text-teal-600 dark:text-teal-400 font-medium' });
  }

  return items;
}

export function getMobilePrimaryLinks(t: TranslationFn): NavbarLinkItem[] {
  return [
    { href: '/o-nama', label: 'O nama', icon: Heart },
    { href: '/pretraga', label: t('nav.sitters'), icon: Search },
    { href: '/njega', label: t('nav.grooming'), icon: Scissors },
    { href: '/dresura', label: t('nav.training'), icon: GraduationCap },
    { href: '/veterinari', label: t('nav.veterinarians'), icon: Stethoscope },
    { href: '/hitno', label: 'Hitna pomoć', icon: Siren, className: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold' },
    { href: '/izgubljeni', label: t('nav.lost'), icon: AlertTriangle, className: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold' },
    { href: '/uzgajivacnice', label: 'Uzgajivači', icon: PawPrint },
    { href: '/udomljavanje', label: 'Udomljavanje', icon: HeartHandshake, className: 'text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/20 font-semibold' },
  ];
}

export function getMobileUtilityLinks(t: TranslationFn): NavbarLinkItem[] {
  return [
    { href: '/setnja/walk1111-1111-1111-1111-111111111111', label: t('nav.gps_tracking'), icon: MapPin, demo: true },
    { href: '/azuriranja/book1111-1111-1111-1111-111111111111', label: t('nav.photo_updates'), icon: Camera, demo: true },
    { href: '/ljubimac/pet11111-1111-1111-1111-111111111111/karton', label: t('nav.health_card'), icon: Heart, demo: true },
  ];
}

export function getMobileCommunityLinks(t: TranslationFn): NavbarLinkItem[] {
  return [
    { href: '/dog-friendly', label: 'Dog-Friendly', icon: Dog, className: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 font-medium' },
    { href: '/shop', label: t('nav.shop'), icon: ShoppingBag },
    { href: '/zajednica', label: t('nav.blog'), icon: BookOpen },
    { href: '/forum', label: t('nav.forum'), icon: MessageSquare },
  ];
}

export function getMobileAccountLinks(t: TranslationFn, user?: NavbarUser | null): NavbarLinkItem[] {
  const items: NavbarLinkItem[] = [
    { href: getDashboardLink(user), label: t('nav.dashboard'), icon: User },
    { href: '/poruke', label: t('nav.messages'), icon: MessageCircle },
    { href: '/omiljeni', label: t('nav.favorites'), icon: Heart },
  ];

  // All authenticated non-admin users can publish adoption listings
  if (user && user.role !== 'admin') {
    items.push({ href: '/dashboard/adoption', label: 'Oglasi za udomljavanje', icon: HeartHandshake });
  }

  if (user?.role !== 'sitter') {
    items.push({ href: '/postani-sitter', label: t('nav.become_sitter'), icon: Sparkles, className: 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 font-semibold' });
  }

  return items;
}

export const mobileLogoutAction = { icon: LogOut };
