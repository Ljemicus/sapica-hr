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
  | 'nav.about'
  | 'nav.emergency'
  | 'nav.breeders'
  | 'nav.adoption_listings'
  | 'nav.rescue_orgs'
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
  | 'common.help'
  | 'common.home'
  | 'common.profile'
  | 'common.community'
  | 'common.account'
  | 'common.demo'
  | 'common.language'
  | 'common.open_menu'
  | 'common.skip_to_content'
  | 'common.mobile_navigation'
  | 'common.homepage'
  | 'common.main_navigation'
  // Footer
  | 'footer.rescue_orgs'
  | 'footer.appeals'
  | 'footer.tagline'
  | 'footer.services'
  | 'footer.find_sitter'
  | 'footer.grooming'
  | 'footer.training'
  | 'footer.veterinarians'
  | 'footer.become_sitter'
  | 'footer.emergency'
  | 'footer.popular_cities'
  | 'footer.explore'
  | 'footer.dog_friendly'
  | 'footer.adoption'
  | 'footer.lost_pets'
  | 'footer.breeders'
  | 'footer.contact'
  | 'footer.about'
  | 'footer.rights'
  | 'footer.privacy'
  | 'footer.terms';

export type Language = 'hr' | 'en';

export const LANGUAGE_LABELS: Record<Language, string> = {
  hr: '🇭🇷 HR',
  en: '🇬🇧 EN',
};

export const LANGUAGE_NAMES: Record<Language, string> = {
  hr: 'Hrvatski',
  en: 'English',
};
