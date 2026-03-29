export type TranslationKey =
  // Navbar
  | 'nav.services'
  | 'nav.shop'
  | 'nav.blog'
  | 'nav.forum'
  | 'nav.lost'
  | 'nav.become_sitter'
  | 'nav.login'
  | 'nav.register'
  // Navbar dropdown - services
  | 'nav.sitters'
  | 'nav.grooming'
  | 'nav.training'
  | 'nav.veterinarians'
  | 'nav.gps_tracking'
  | 'nav.photo_updates'
  | 'nav.health_card'
  // Navbar user menu
  | 'nav.dashboard'
  | 'nav.messages'
  | 'nav.favorites'
  | 'nav.my_pets'
  | 'nav.view_pets'
  | 'nav.logout'
  // Common UI
  | 'common.search'
  | 'common.save'
  | 'common.cart'
  | 'common.help';

export type Language = 'hr' | 'en' | 'it' | 'sl';

export const LANGUAGE_LABELS: Record<Language, string> = {
  hr: '🇭🇷 HR',
  en: '🇬🇧 EN',
  it: '🇮🇹 IT',
  sl: '🇸🇮 SL',
};

export const LANGUAGE_NAMES: Record<Language, string> = {
  hr: 'Hrvatski',
  en: 'English',
  it: 'Italiano',
  sl: 'Slovenščina',
};
