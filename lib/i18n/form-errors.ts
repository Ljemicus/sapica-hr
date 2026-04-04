import type { Language } from './keys';

const errorTranslations: Record<string, string> = {
  'Unesite valjanu email adresu': 'Enter a valid email address',
  'Lozinka mora imati najmanje 6 znakova': 'Password must be at least 6 characters long',
  'Ime mora imati najmanje 2 znaka': 'Name must be at least 2 characters long',
  'Odaberite ulogu': 'Choose a role',
  'Odaberite grad': 'Choose a city',
  'Lozinke se ne podudaraju': 'Passwords do not match',
  'Odaberite ljubimca': 'Choose a pet',
  'Odaberite uslugu': 'Choose a service',
  'Odaberite datum početka': 'Choose a start date',
  'Odaberite datum završetka': 'Choose an end date',
  'Napomena može imati najviše 500 znakova': 'The note can be at most 500 characters long',
};

export function translateFormError(message: string | undefined, language: Language) {
  if (!message || language === 'hr') return message;
  return errorTranslations[message] ?? message;
}
