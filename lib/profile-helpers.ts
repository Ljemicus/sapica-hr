import {
  GROOMING_SERVICE_LABELS,
  GROOMER_SPECIALIZATION_LABELS,
  TRAINING_TYPE_LABELS,
  type Groomer,
  type GroomingServiceType,
  type GroomerSpecialization,
  type Trainer,
  type TrainingType,
} from './types';

// ── Price Formatting ──

export function formatPrice(price: number): string {
  if (price <= 0) return '';
  return `${price}\u00A0\u20AC`;
}

export function formatPriceRange(prices: Record<string, number>): string {
  const valid = Object.values(prices).filter(p => p > 0);
  if (valid.length === 0) return 'Cijena na upit';
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  if (min === max) return formatPrice(min);
  return `${min}\u00A0–\u00A0${max}\u00A0\u20AC`;
}

export function formatLowestPrice(prices: Record<string, number>): string {
  const valid = Object.values(prices).filter(p => p > 0);
  if (valid.length === 0) return 'Cijena na upit';
  return `od ${Math.min(...valid)}\u00A0\u20AC`;
}

// ── Address / Location ──

export function formatAddress(address?: string, city?: string): string {
  if (address && city) return `${address}, ${city}`;
  if (address) return address;
  if (city) return city;
  return '';
}

export function formatCityLabel(city: string): string {
  return city || 'Lokacija nije navedena';
}

// ── Contact Info ──

export function hasContactInfo(entity: { phone?: string; email?: string; address?: string }): boolean {
  return Boolean(entity.phone || entity.email || entity.address);
}

export function formatPhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\s+/g, ' ').trim();
}

// ── Service Descriptions (richer content for profiles) ──

const GROOMING_SERVICE_DESCRIPTIONS: Record<GroomingServiceType, string> = {
  'sisanje': 'Profesionalno striženje i oblikovanje dlake prema standardu pasmine',
  'kupanje': 'Kupanje uz šampon i regenerator prilagođen tipu dlake',
  'trimanje': 'Ručno čupanje dlake za žičanodlake pasmine',
  'nokti': 'Skraćivanje i obrada noktiju',
  'cetkanje': 'Temeljito četkanje i raspetljavanje dlake',
};

export function getServiceDescription(service: GroomingServiceType): string {
  return GROOMING_SERVICE_DESCRIPTIONS[service];
}

export function getServiceLabel(service: GroomingServiceType): string {
  return GROOMING_SERVICE_LABELS[service] || service;
}

// ── Specialization Descriptions ──

const TRAINING_TYPE_DESCRIPTIONS: Record<TrainingType, string> = {
  'osnovna': 'Temelji poslušnosti: sjedi, lezi, ostani, dolazak na poziv',
  'napredna': 'Napredne komande, rad bez povodca, distancijski trening',
  'agility': 'Sportska disciplina s preprekama za aktivne pse',
  'ponasanje': 'Korekcija problematičnog ponašanja i rehabilitacija',
  'stenci': 'Socijalizacija i prvi koraci treninga za mlade pse',
};

export function getTrainingDescription(type: TrainingType): string {
  return TRAINING_TYPE_DESCRIPTIONS[type];
}

export function getTrainingLabel(type: TrainingType): string {
  return TRAINING_TYPE_LABELS[type] || type;
}

export function getSpecializationLabel(spec: GroomerSpecialization): string {
  return GROOMER_SPECIALIZATION_LABELS[spec] || spec;
}

// ── Working Hours ──

const DAY_ORDER = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'] as const;
export type DayAbbrev = typeof DAY_ORDER[number];

export function getOrderedDays(): readonly DayAbbrev[] {
  return DAY_ORDER;
}

export function formatWorkingHours(hours: { start: string; end: string }): string {
  return `${hours.start} – ${hours.end}`;
}

export function hasWorkingHours(groomer: { working_hours?: Groomer['working_hours'] }): boolean {
  return Boolean(groomer.working_hours && Object.keys(groomer.working_hours).length > 0);
}

// ── Profile Completeness ──

export function groomerProfileCompleteness(groomer: Groomer): { score: number; missing: string[] } {
  const checks: [boolean, string][] = [
    [Boolean(groomer.name), 'Naziv'],
    [Boolean(groomer.bio && groomer.bio.length > 20), 'Opis (min 20 znakova)'],
    [Boolean(groomer.city), 'Grad'],
    [groomer.services.length > 0, 'Barem jedna usluga'],
    [Object.values(groomer.prices).some(p => p > 0), 'Cijene usluga'],
    [Boolean(groomer.phone), 'Telefon'],
    [Boolean(groomer.email), 'Email'],
    [Boolean(groomer.address), 'Adresa'],
    [hasWorkingHours(groomer), 'Radno vrijeme'],
    [Boolean(groomer.specialization), 'Specijalizacija'],
  ];

  const passed = checks.filter(([ok]) => ok).length;
  const missing = checks.filter(([ok]) => !ok).map(([, label]) => label);
  return { score: Math.round((passed / checks.length) * 100), missing };
}

export function trainerProfileCompleteness(trainer: Trainer): { score: number; missing: string[] } {
  const checks: [boolean, string][] = [
    [Boolean(trainer.name), 'Ime'],
    [Boolean(trainer.bio && trainer.bio.length > 20), 'Opis (min 20 znakova)'],
    [Boolean(trainer.city), 'Grad'],
    [trainer.specializations.length > 0, 'Barem jedna specijalizacija'],
    [trainer.price_per_hour > 0, 'Cijena po satu'],
    [Boolean(trainer.phone), 'Telefon'],
    [Boolean(trainer.email), 'Email'],
    [Boolean(trainer.address), 'Adresa/lokacija treninga'],
    [trainer.certificates.length > 0, 'Certifikati'],
  ];

  const passed = checks.filter(([ok]) => ok).length;
  const missing = checks.filter(([ok]) => !ok).map(([, label]) => label);
  return { score: Math.round((passed / checks.length) * 100), missing };
}

// ── Fallback / Placeholder Content ──

export function getBioPlaceholder(type: 'groomer' | 'trainer'): string {
  return type === 'groomer'
    ? 'Ovaj groomer još nije dodao opis. Kontaktirajte ga izravno za više informacija o uslugama.'
    : 'Ovaj trener još nije dodao opis. Kontaktirajte ga izravno za više informacija o programima.';
}

export function getNoServicesMessage(): string {
  return 'Usluge i cijene trenutno nisu navedene. Kontaktirajte za više informacija.';
}

export function getNoReviewsMessage(type: 'groomer' | 'trainer'): string {
  return type === 'groomer'
    ? 'Budite prvi koji će ocijeniti ovog groomera'
    : 'Budite prvi koji će ocijeniti ovog trenera';
}

export function getNoProgramsMessage(): string {
  return 'Kontaktirajte trenera za individualne dogovore';
}

// ── Active Services (filters out zero-price or disabled) ──

export function getActiveServices(groomer: { services: GroomingServiceType[]; prices: Record<GroomingServiceType, number> }): GroomingServiceType[] {
  return groomer.services.filter(s => groomer.prices[s] > 0);
}

export function getActiveServiceCount(groomer: { services: GroomingServiceType[]; prices: Record<GroomingServiceType, number> }): number {
  return getActiveServices(groomer).length;
}

// ── Summary Text Generators ──

export function groomerSummary(groomer: Groomer): string {
  const parts: string[] = [];
  if (groomer.verified) parts.push('Profil provjeren');
  const spec = GROOMER_SPECIALIZATION_LABELS[groomer.specialization];
  if (spec) parts.push(spec.toLowerCase());
  parts.push(groomer.city);
  const active = getActiveServiceCount(groomer);
  if (active > 0) parts.push(`${active} usluga`);
  return parts.join(' \u00B7 ');
}

export function trainerSummary(trainer: Trainer): string {
  const parts: string[] = [];
  if (trainer.certified) parts.push('Certifikat naveden');
  parts.push(trainer.city);
  if (trainer.specializations.length > 0) {
    parts.push(`${trainer.specializations.length} specijalizacija`);
  }
  if (trainer.certificates.length > 0) {
    parts.push(`${trainer.certificates.length} certifikata`);
  }
  return parts.join(' \u00B7 ');
}
