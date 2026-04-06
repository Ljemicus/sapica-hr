// Tipovi za Obrt Wizard

export interface Address {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
}

export interface PersonalData {
  firstName: string;
  lastName: string;
  oib: string;
  dateOfBirth: string; // ISO 8601 format
  address: Address;
  email: string;
  phone: string;
}

export interface BusinessData {
  businessName: string;
  businessAddress: {
    sameAsResidence: boolean;
    street?: string;
    houseNumber?: string;
    city?: string;
    postalCode?: string;
  };
  nkdCode: string;
  activityDescription: string;
  startDate: 'immediate' | string; // ISO 8601 or 'immediate'
}

export interface BankData {
  iban: string;
  bankCode: string;
}

export interface WizardFormData {
  eligible?: {
    hasResidenceInCroatia: boolean;
    hasValidID: boolean;
    hasBankAccount: boolean;
    hasOIB: boolean;
  };
  personalData?: PersonalData;
  businessData?: BusinessData;
  bankData?: BankData;
}

export type WizardStep = 
  | 'eligibility' 
  | 'personal' 
  | 'business' 
  | 'bank' 
  | 'review' 
  | 'generate';

export interface WizardSession {
  id: string;
  userId: string;
  currentStep: WizardStep;
  data: WizardFormData;
  createdAt: string;
  updatedAt: string;
}

// NKD 2025 šifre za pet services
export const NKD_CODES = [
  { code: '96.09', name: 'Ostale usluge osobne naravi', description: 'Pet sitting, šetanje, osnovna njega' },
  { code: '96.02', name: 'Frizerske i ostale tretman ljepote', description: 'Pet grooming, šišanje' },
  { code: '75.00', name: 'Veterinarske usluge', description: 'Veterinarske usluge (s kvalifikacijom)' },
  { code: '77.21', name: 'Iznajmljivanje opće namjenske opreme', description: 'Iznajmljivanje opreme za ljubimce' },
] as const;

// Banke u Hrvatskoj
export const BANKS = [
  { code: 'ZABA', name: 'Zagrebačka banka' },
  { code: 'PBZ', name: 'Privredna banka Zagreb' },
  { code: 'ERSTE', name: 'Erste banka' },
  { code: 'HPB', name: 'Hrvatska poštanska banka' },
  { code: 'OTP', name: 'OTP banka' },
  { code: 'RBA', name: 'Raiffeisenbank Austria' },
  { code: 'ADDIKO', name: 'Addiko banka' },
  { code: 'JTB', name: 'J&T banka' },
  { code: 'KENTBANK', name: 'KentBank' },
  { code: 'REVOLUT', name: 'Revolut Bank' },
  { code: 'OTHER', name: 'Druga banka' },
] as const;

// Županije
export const ZUPANIJE = [
  'Zagrebačka',
  'Krapinsko-zagorska',
  'Sisačko-moslavačka',
  'Karlovačka',
  'Varaždinska',
  'Koprivničko-križevačka',
  'Bjelovarsko-bilogorska',
  'Primorsko-goranska',
  'Ličko-senjska',
  'Virovitičko-podravska',
  'Požeško-slavonska',
  'Brodsko-posavska',
  'Zadarska',
  'Osječko-baranjska',
  'Šibensko-kninska',
  'Vukovarsko-srijemska',
  'Splitsko-dalmatinska',
  'Istarska',
  'Dubrovačko-neretvanska',
  'Međimurska',
  'Grad Zagreb',
] as const;
