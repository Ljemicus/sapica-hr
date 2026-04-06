// Validacijske funkcije za Obrt Wizard

/**
 * Validacija OIB-a (11 znamenki + kontrolna znamenka)
 */
export function validateOIB(oib: string): boolean {
  if (!oib || oib.length !== 11) return false;
  
  // OIB mora sadržavati samo znamenke
  if (!/^\d{11}$/.test(oib)) return false;
  
  // Kontrolna znamenka (ISO 7064, MOD 11,10)
  let a = 10;
  for (let i = 0; i < 10; i++) {
    a = (a + parseInt(oib[i], 10)) % 10;
    if (a === 0) a = 10;
    a = (a * 2) % 11;
  }
  const kontrolna = 11 - a;
  const expectedControl = kontrolna === 10 ? 0 : kontrolna;
  
  return parseInt(oib[10], 10) === expectedControl;
}

/**
 * Formatiranje OIB-a (dodavanje razmaka za čitljivost)
 */
export function formatOIB(oib: string): string {
  if (!oib || oib.length !== 11) return oib;
  return `${oib.slice(0, 3)} ${oib.slice(3, 6)} ${oib.slice(6, 9)} ${oib.slice(9, 11)}`;
}

/**
 * Validacija IBAN-a (HR + 19 znamenki, MOD 97-10)
 */
export function validateIBAN(iban: string): boolean {
  if (!iban) return false;
  
  // Ukloni razmake
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
  // HR IBAN mora imati točno 21 znak (HR + 19 znamenki)
  if (!/^HR\d{19}$/.test(cleanIBAN)) return false;
  
  // MOD 97-10 validacija
  const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);
  const numeric = rearranged.split('').map(char => {
    const code = char.charCodeAt(0);
    return code >= 65 && code <= 90 ? (code - 55).toString() : char;
  }).join('');
  
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const chunk = remainder.toString() + numeric.slice(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }
  
  return remainder === 1;
}

/**
 * Formatiranje IBAN-a (grupiranje po 4 znaka)
 */
export function formatIBAN(iban: string): string {
  if (!iban) return '';
  const clean = iban.replace(/\s/g, '').toUpperCase();
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}

/**
 * Validacija email-a
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validacija hrvatskog telefona
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  // Podržava: +385, 00385, 0xx format
  const phoneRegex = /^(\+385|00385|0)\d{8,9}$/;
  const cleanPhone = phone.replace(/\s/g, '');
  return phoneRegex.test(cleanPhone);
}

/**
 * Formatiranje telefona
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/\s/g, '');
  
  if (clean.startsWith('+385')) {
    return `+385 ${clean.slice(4, 7)} ${clean.slice(7, 10)} ${clean.slice(10)}`;
  }
  if (clean.startsWith('00385')) {
    return `+385 ${clean.slice(5, 8)} ${clean.slice(8, 11)} ${clean.slice(11)}`;
  }
  if (clean.startsWith('0')) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  
  return clean;
}

/**
 * Validacija poštanskog broja (5 znamenki)
 */
export function validatePostalCode(code: string): boolean {
  if (!code) return false;
  return /^\d{5}$/.test(code);
}

/**
 * Validacija datuma rođenja (18+ godina)
 */
export function validateAge(dateOfBirth: string): boolean {
  if (!dateOfBirth) return false;
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18;
}

/**
 * Validacija naziva obrta
 */
export function validateBusinessName(name: string): boolean {
  if (!name || name.trim().length < 2) return false;
  if (name.trim().length > 100) return false;
  return true;
}

/**
 * Sanitizacija inputa (XSS protection)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Generiranje e-Obrt deep linka
 */
export function generateEObrtLink(data: {
  firstName: string;
  lastName: string;
  oib: string;
  address: string;
  postalCode: string;
  phone: string;
  email: string;
  businessName: string;
  nkdCode: string;
}): string {
  const params = new URLSearchParams({
    ime: data.firstName,
    prezime: data.lastName,
    oib: data.oib,
    adresa: data.address,
    posta: data.postalCode,
    telefon: data.phone,
    email: data.email,
    naziv_obrta: data.businessName,
    sifra_djelatnosti: data.nkdCode,
  });
  
  return `https://e-obrt.gov.hr/?${params.toString()}`;
}
