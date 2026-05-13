import type { PublicServiceListing, ServiceListingProviderRow, ServiceListingProviderServiceRow, ServiceListingRow } from './types';

const toneByKind: Record<string, PublicServiceListing['tone']> = {
  sitter: 'orange',
  groomer: 'teal',
  trainer: 'cream',
  other: 'sage',
};

const serviceCopy: Record<string, { title: string; category: string; description: string; unit: string; features: string[]; rules: string[] }> = {
  boarding: {
    title: 'Čuvanje psa u kućnom okruženju',
    category: 'Čuvanje',
    description: 'Topla i sigurna usluga s puno pažnje, igre i redovitih updatea za vlasnika.',
    unit: 'dan',
    features: ['Boravak u kući', 'Šetnje prema dogovoru', 'Foto updatei', 'Hranjenje prema rutini'],
    rules: ['Cijepljenje obavezno', 'Dogovor prije prvog čuvanja'],
  },
  daycare: {
    title: 'Dnevni boravak za ljubimce',
    category: 'Čuvanje',
    description: 'Dnevna briga, igra i šetnje dok ste na poslu ili obavezama.',
    unit: 'dan',
    features: ['Dnevni nadzor', 'Igra i šetnje', 'Dogovorena rutina'],
    rules: ['Socijalizirani ljubimci', 'Dogovor o hranjenju'],
  },
  walking: {
    title: 'Šetnja pasa',
    category: 'Šetnja',
    description: 'Pouzdane šetnje, jasni dogovori i kratki update nakon svake rute.',
    unit: 'šetnja',
    features: ['Ruta po dogovoru', 'Update nakon šetnje', 'Individualni pristup'],
    rules: ['Povodac obavezan', 'Napomenuti posebne potrebe'],
  },
  house_sitting: {
    title: 'Čuvanje u domu vlasnika',
    category: 'Čuvanje',
    description: 'Briga o ljubimcu u poznatom prostoru, bez stresa selidbe.',
    unit: 'posjet',
    features: ['Dolazak u dom', 'Hranjenje', 'Druženje i nadzor'],
    rules: ['Pristup domu po dogovoru', 'Jasne upute vlasnika'],
  },
  drop_in: {
    title: 'Kratki obilazak ljubimca',
    category: 'Čuvanje',
    description: 'Kratki posjet za hranjenje, provjeru i malo druženja.',
    unit: 'posjet',
    features: ['Hranjenje', 'Provjera vode', 'Kratko druženje'],
    rules: ['Dogovor termina unaprijed'],
  },
  grooming_bath: {
    title: 'Kupanje i njega ljubimca',
    category: 'Grooming',
    description: 'Nježna njega, kupanje i osnovno uređivanje prilagođeno ljubimcu.',
    unit: 'tretman',
    features: ['Kupanje', 'Sušenje', 'Osnovna njega dlake'],
    rules: ['Napomenuti osjetljivost kože', 'Dogovor prema veličini psa'],
  },
  grooming_haircut: {
    title: 'Šišanje i grooming',
    category: 'Grooming',
    description: 'Uredan grooming tretman s pažljivim pristupom i dogovorom stila.',
    unit: 'tretman',
    features: ['Šišanje', 'Kupanje', 'Završno uređivanje'],
    rules: ['Dogovor željenog izgleda', 'Napomenuti čvorove i osjetljivost'],
  },
  training_basic: {
    title: 'Osnovni trening poslušnosti',
    category: 'Trening',
    description: 'Praktični trening za bolju svakodnevicu, mirnije šetnje i jasniju komunikaciju.',
    unit: 'sat',
    features: ['Osnovne komande', 'Rad s vlasnikom', 'Plan vježbanja'],
    rules: ['Dolazak s opremom', 'Kontinuitet treninga je važan'],
  },
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function formatPrice(amount: number | null | undefined, currency: string | null | undefined, unit: string) {
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) return 'Cijena po dogovoru';
  const suffix = currency === 'EUR' || !currency ? '€' : currency;
  return `${amount} ${suffix} / ${unit}`;
}

function providerLocation(provider: ServiceListingProviderRow | null, listing?: Pick<ServiceListingRow, 'city' | 'district' | 'service_area'>) {
  const city = listing?.city || provider?.city || 'Hrvatska';
  const district = listing?.district || listing?.service_area || provider?.address;
  return district ? `${city}, ${district}` : city;
}

export function mapServiceListingRow(row: ServiceListingRow): PublicServiceListing | null {
  const provider = first(row.provider);
  const providerService = first(row.provider_service);
  if (!provider) return null;
  if (provider.public_status !== 'listed' || provider.verified_status !== 'verified') return null;
  if (row.status !== 'listed' || row.moderation_status !== 'approved') return null;

  const serviceCode = providerService?.service_code || row.category || 'service';
  const copy = serviceCopy[serviceCode] || serviceCopy[String(row.category || '')] || {
    title: row.title || 'PetPark usluga za ljubimce',
    category: row.display_category || row.category || 'Usluga',
    description: row.short_description || row.description || provider.bio || 'Pouzdana PetPark usluga za ljubimce.',
    unit: 'usluga',
    features: ['Dogovor prema potrebama ljubimca', 'Sigurna komunikacija kroz PetPark'],
    rules: ['Detalji se dogovaraju prije potvrde termina'],
  };

  return {
    slug: row.slug,
    title: row.title || copy.title,
    provider: provider.display_name || 'PetPark pružatelj',
    location: providerLocation(provider, row),
    rating: Number(provider.rating_avg || 0),
    reviews: Number(provider.review_count || 0),
    description: row.short_description || copy.description,
    price: formatPrice(providerService?.base_price, providerService?.currency, copy.unit),
    badges: ['Dostupno', 'Provjereno'],
    tone: toneByKind[String(provider.provider_kind || 'other')] || 'sage',
    category: row.display_category || row.category || copy.category,
    providerId: provider.id,
    providerKind: provider.provider_kind || 'provider',
    serviceCode,
    detailDescription: row.description || row.short_description || provider.bio || copy.description,
    includedFeatures: asStringArray(row.included_features).length ? asStringArray(row.included_features) : copy.features,
    houseRules: asStringArray(row.house_rules).length ? asStringArray(row.house_rules) : copy.rules,
    responseTime: provider.response_time_label || 'Odgovara uskoro',
    verified: provider.verified_status === 'verified',
  };
}

export function mapProviderServiceFallback(row: ServiceListingProviderServiceRow & { provider?: ServiceListingProviderRow | ServiceListingProviderRow[] | null }): PublicServiceListing | null {
  const provider = first(row.provider);
  if (!provider) return null;
  if (provider.public_status !== 'listed' || provider.verified_status !== 'verified') return null;
  if (row.is_active === false) return null;

  const serviceCode = row.service_code || 'service';
  const copy = serviceCopy[serviceCode] || {
    title: 'PetPark usluga za ljubimce',
    category: provider.provider_kind === 'groomer' ? 'Grooming' : provider.provider_kind === 'trainer' ? 'Trening' : 'Čuvanje',
    description: provider.bio || 'Pouzdana PetPark usluga za sigurniju svakodnevicu ljubimca.',
    unit: row.duration_minutes && row.duration_minutes <= 90 ? 'termin' : 'usluga',
    features: ['Dogovor prema potrebama ljubimca', 'Sigurna komunikacija kroz PetPark'],
    rules: ['Detalji se dogovaraju prije potvrde termina'],
  };

  const providerName = provider.display_name || 'PetPark pružatelj';
  const slug = `${copy.title}-${providerName}-${row.id.slice(0, 8)}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);

  return {
    slug,
    title: copy.title,
    provider: providerName,
    location: providerLocation(provider),
    rating: Number(provider.rating_avg || 0),
    reviews: Number(provider.review_count || 0),
    description: copy.description,
    price: formatPrice(row.base_price, row.currency, copy.unit),
    badges: ['Dostupno', 'Provjereno'],
    tone: toneByKind[String(provider.provider_kind || 'other')] || 'sage',
    category: copy.category,
    providerId: provider.id,
    providerKind: provider.provider_kind || 'provider',
    serviceCode,
    detailDescription: provider.bio || copy.description,
    includedFeatures: copy.features,
    houseRules: copy.rules,
    responseTime: provider.response_time_label || 'Odgovara uskoro',
    verified: provider.verified_status === 'verified',
  };
}
