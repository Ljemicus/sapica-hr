// PetPark AI Customer Support - Knowledge Base
// Pure client-side, zero cost

export interface KBEntry {
  keywords: string[];
  response: string;
  category: string;
}

interface MatchOptions {
  isAuthenticated?: boolean;
}

// Strip Croatian diacritics for fuzzy matching
export function stripDiacritics(text: string): string {
  return text
    .toLowerCase()
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/đ/g, 'd')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z');
}

export function findBestMatch(input: string, options: MatchOptions = {}): string {
  const normalized = stripDiacritics(input.trim());

  let bestMatch: KBEntry | null = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      const normKeyword = stripDiacritics(keyword);
      if (normalized.includes(normKeyword)) {
        score += normKeyword.length; // longer matches = higher score
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 2) {
    return bestMatch.response;
  }

  if (options.isAuthenticated) {
    return 'Još nemam baš točan odgovor na to pitanje. 🤔 Mogu pomoći oko registracije, rezervacija, plaćanja, usluga i snalaženja na PetParku. Ako želiš razgovarati sa sitterom ili otvoriti postojeći razgovor, idi u Poruke. Ako zapne, javi nam se na petparkhr@gmail.com.';
  }

  return 'Još nemam baš točan odgovor na to pitanje. 🤔 Pokušaj pitati npr. kako funkcionira rezervacija, prijava, grooming ili forum. Ako trebaš pomoć tima, javi se na petparkhr@gmail.com.';
}

export function getSuggestedPrompts(isAuthenticated = false): string[] {
  if (isAuthenticated) {
    return [
      'Kako poslati upit za čuvanje?',
      'Kako funkcionira plaćanje?',
      'Gdje mogu naći groomera?',
      'Gdje vidim svoje rezervacije?',
    ];
  }

  return [
    'Kako PetPark funkcionira?',
    'Kako se registrirati?',
    'Kako pronaći sittera?',
    'Kako rezervirati čuvanje?',
  ];
}

export const WELCOME_MESSAGE = 'Bok! 🐾 Ja sam PetPark pomoćnik. Tu sam da ti brzo pomognem oko registracije, pronalaska sittera, rezervacija, plaćanja, groominga, školovanja pasa i snalaženja na platformi. Reci što trebaš.';

export const knowledgeBase: KBEntry[] = [
  // === OPĆENITO ===
  {
    keywords: ['što je petpark', 'sto je petpark', 'petpark', 'o čemu', 'o cemu', 'što je ovo', 'sto je ovo'],
    response: 'PetPark je hrvatski marketplace za ljubimce! 🐾 Povezujemo vlasnike ljubimaca s pouzdanim čuvarima (sitterima), grooming salonima i trenerima za školovanje pasa. Besplatno pretraži, pronađi savršenog čuvara i bookaj — sve na jednom mjestu.',
    category: 'general',
  },
  {
    keywords: ['kako radi', 'kako funkcionira', 'kako koristiti', 'kako se koristi'],
    response: 'Super jednostavno! 😊\n\n1️⃣ Registriraj se (email ili Google)\n2️⃣ Pretraži sittere u svom gradu\n3️⃣ Pogledaj profile, recenzije i cijene\n4️⃣ Pošalji zahtjev za booking\n5️⃣ Dogovori detalje sa sitterom\n\nI to je to! Tvoj ljubimac je u dobrim rukama. 🐶',
    category: 'general',
  },
  {
    keywords: ['cijena', 'koliko košta', 'koliko kosta', 'besplatno', 'free', 'trošak', 'trosak'],
    response: 'Pretraživanje i registracija su potpuno besplatni! 🎉 Svaki sitter postavlja svoje cijene na profilu. Plaćanje se dogovara direktno sa sitterom.',
    category: 'general',
  },
  {
    keywords: ['grad', 'gradovi', 'lokacija', 'gdje', 'rijeka', 'zagreb', 'split', 'osijek', 'pula', 'zadar'],
    response: 'PetPark pokriva cijelu Hrvatsku! 🇭🇷 Trenutno imamo najviše sittera u: Rijeci, Zagrebu, Splitu, Osijeku, Puli i Zadru. Ali radimo na širenju — novi sitteri se prijavljuju svaki dan!',
    category: 'general',
  },

  // === REGISTRACIJA ===
  {
    keywords: ['registracija', 'registrirati', 'signup', 'sign up', 'napraviti račun', 'napraviti racun', 'otvoriti račun'],
    response: 'Registracija je brza i besplatna! ✨\n\n• **Email + lozinka** — klasični način\n• **Google prijava** — jedan klik i gotovo\n\nIdi na petpark.hr i klikni "Prijava" u gornjem desnom kutu.',
    category: 'registration',
  },
  {
    keywords: ['prijaviti', 'prijava', 'login', 'ulogirati', 'ne mogu se prijaviti', 'ne radi prijava'],
    response: 'Za prijavu koristi email + lozinku ili Google račun. Ako imaš problema:\n\n• Provjeri je li email točan\n• Pokušaj resetirati lozinku\n• Probaj Google prijavu\n\nAko i dalje ne radi, javi nam se na petparkhr@gmail.com pa rješavamo. 💪',
    category: 'registration',
  },
  {
    keywords: ['postati sitter', 'biti sitter', 'ponuditi usluge', 'čuvar', 'cuvar', 'kako biti čuvar'],
    response: 'Želiš čuvati ljubimce? Super! 🎉\n\n1️⃣ Registriraj se na PetParku\n2️⃣ Kreiraj sitter profil\n3️⃣ Postavi svoje cijene i dostupnost\n4️⃣ Dodaj opis i slike\n\nI čekaj prve bookinge! Što bolji profil, više upita. 📸',
    category: 'registration',
  },
  {
    keywords: ['obrisati račun', 'brisanje', 'izbrisati', 'deaktivirati', 'ukinuti račun'],
    response: 'Za brisanje računa kontaktiraj nas na petparkhr@gmail.com i sredimo to u najkraćem roku. 📧',
    category: 'registration',
  },
  {
    keywords: ['lozinka', 'password', 'zaboravio', 'zaboravila', 'resetirati', 'promijeniti lozinku'],
    response: 'Na stranici za prijavu klikni "Zaboravljena lozinka?" i upiši svoj email. Dobit ćeš link za resetiranje. Ako ne dobiješ mail, provjeri spam folder! 📬',
    category: 'registration',
  },

  // === USLUGE ===
  {
    keywords: ['pet sitting', 'čuvanje', 'cuvanje', 'čuvati ljubimca', 'cuvati ljubimca', 'čuvanje psa', 'čuvanje mačke'],
    response: 'Pet sitting je naša glavna usluga! 🏠 Tvoj ljubimac može biti čuvan:\n\n• **Kod sittera** — ljubimac ide na "mini odmor"\n• **Kod tebe** — sitter dolazi k tebi\n\nSvaki sitter ima profil s recenzijama, cijenama i opisom. Pretraži po gradu i pronađi savršeni match!',
    category: 'services',
  },
  {
    keywords: ['grooming', 'njega', 'šišanje', 'sisanje', 'kupanje', 'groomer'],
    response: 'Grooming usluge su dostupne na PetParku! ✂️ Pogledaj sekciju "Njega" na stranici za:\n\n• Šišanje i stiliziranje\n• Kupanje i njegu dlake\n• Rezanje noktiju\n• Čišćenje ušiju\n\n👉 petpark.hr/njega',
    category: 'services',
  },
  {
    keywords: ['dresura', 'trening', 'trener', 'obuka', 'školovanje psa', 'skolovanje', 'agility', 'školovanje pasa'],
    response: 'Školovanje pasa i trening! 🎓 U sekciji "Školovanje pasa" možeš pronaći:\n\n• Individualne trenere\n• Grupne obuke\n• Agility trening\n• Socijalizaciju\n\n👉 petpark.hr/dresura',
    category: 'services',
  },
  {
    keywords: ['šetanje', 'setanje', 'šetnja', 'setnja', 'prošetati', 'prosetati'],
    response: 'Šetanje pasa je dio naše pet sitting usluge! 🐕 Kad bookiraš sittera, možeš dogovoriti i svakodnevne šetnje. Plus — uz GPS tracking možeš pratiti šetnju u realnom vremenu! 📍',
    category: 'services',
  },

  // === BOOKING ===
  {
    keywords: ['booking', 'bookirati', 'rezervacija', 'rezervirati', 'naručiti', 'zakazati'],
    response: 'Rezervacija je jednostavna! 📅\n\n1️⃣ Pronađi sittera koji ti odgovara\n2️⃣ Otvori profil\n3️⃣ Odaberi datum i uslugu\n4️⃣ Pošalji zahtjev\n5️⃣ Kad sitter potvrdi — dogovoreno!\n\nSve detalje možeš dogovoriti kroz poruke na platformi.',
    category: 'booking',
  },
  {
    keywords: ['otkazati', 'otkazivanje', 'cancel', 'ne mogu doći', 'ne mogu doci'],
    response: 'Booking se može otkazati prije početka usluge. Svaki sitter ima svoja pravila otkazivanja na profilu. Za hitne situacije, kontaktiraj sittera direktno ili nam piši na petparkhr@gmail.com 📞',
    category: 'booking',
  },
  {
    keywords: ['plaćanje', 'placanje', 'platiti', 'kartica', 'gotovina', 'kako platiti'],
    response: 'Plaćanje se trenutno dogovara direktno sa sitterom. Većina sittera prihvaća gotovinu ili bankovni prijenos. Radimo na integraciji online plaćanja — uskoro! 💳',
    category: 'booking',
  },

  // === SIGURNOST ===
  {
    keywords: ['sigurno', 'sigurnost', 'povjerenje', 'provjera', 'safe', 'pouzdano'],
    response: 'Sigurnost nam je prioritet! 🛡️\n\n• Svaki sitter ima javni profil s recenzijama\n• GPS tracking šetnji u realnom vremenu\n• Pet Passport — zdravstveni karton ljubimca\n• Photo feed — dobivaj slike ljubimca tijekom bookinga\n• Direktna komunikacija sa sitterom',
    category: 'safety',
  },
  {
    keywords: ['gps', 'tracking', 'praćenje', 'pracenje', 'lokacija šetnje', 'gdje je pas'],
    response: 'GPS tracking ti omogućuje praćenje šetnje tvog ljubimca u realnom vremenu! 📍 Vidiš rutu, brzinu i trajanje šetnje. Tako uvijek znaš da je tvoj ljubimac siguran. 🐾',
    category: 'safety',
  },
  {
    keywords: ['pet passport', 'zdravstveni karton', 'vakcinacija', 'cijepljenje', 'veterinar'],
    response: 'Pet Passport je digitalni zdravstveni karton tvog ljubimca! 🏥 Možeš spremiti:\n\n• Podatke o vakcinacijama\n• Alergije i posebne potrebe\n• Kontakt veterinara\n• Povijest posjeta\n\nSitter vidi ove podatke tijekom bookinga — tako zna sve o tvom ljubimcu.',
    category: 'safety',
  },

  // === FORUM ===
  {
    keywords: ['forum', 'zajednica', 'community', 'pitanje', 'savjet', 'priča', 'objava'],
    response: 'Naš forum je super za ljubitelje životinja! 💬\n\n• 💡 **Pitanja** — pitaj što te zanima\n• 📝 **Savjeti** — dijeli iskustva\n• ❤️ **Priče** — slatke i smiješne priče o ljubimcima\n• 🔍 **Izgubljeni ljubimci** — pomozi pronaći izgubljene životinje\n\n👉 petpark.hr/forum',
    category: 'forum',
  },
  {
    keywords: ['izgubljen', 'izgubljena', 'nestao', 'nestala', 'tražim', 'trazim', 'pronađen'],
    response: 'Oh ne! 😟 Ako je tvoj ljubimac nestao, objavi na našem forumu u kategoriji "Izgubljeni ljubimci" — zajednica pomogne! 🔍\n\n👉 petpark.hr/forum\n\nDodaj sliku, lokaciju i kontakt. Držimo fige! 🤞🐾',
    category: 'forum',
  },

  // === KONTAKT / PROBLEMI ===
  {
    keywords: ['kontakt', 'email', 'mail', 'javiti', 'pomoć', 'pomoc', 'support', 'podrška', 'podrska'],
    response: 'Možeš nam se javiti na:\n\n📧 **petparkhr@gmail.com**\n💬 Discord #customer-support\n\nOdgovaramo čim uhvatimo. 🚀',
    category: 'contact',
  },
  {
    keywords: ['bug', 'greška', 'greska', 'ne radi', 'error', 'problem', 'kvari', 'crashira'],
    response: 'Ups, žao mi je zbog problema. 🔧 Javi nam detalje:\n\n• Što se točno dogodilo?\n• Na kojem uređaju ili browseru?\n• Ako možeš, pošalji screenshot\n\n📧 petparkhr@gmail.com — pogledamo što prije!',
    category: 'contact',
  },
  {
    keywords: ['prijedlog', 'sugestija', 'ideja', 'feature', 'poboljšanje', 'poboljsanje', 'dodati'],
    response: 'Volimo prijedloge! 💡 Javi nam svoju ideju na petparkhr@gmail.com ili ovdje u chatu. Svaki feedback nam pomaže napraviti PetPark boljim za sve! 🐾',
    category: 'contact',
  },

  // === APP ===
  {
    keywords: ['aplikacija', 'app', 'mobitel', 'telefon', 'android', 'iphone', 'ios', 'instalirati'],
    response: 'PetPark radi kao web app! 📱 Možeš je instalirati na mobitel:\n\n**Android:** Otvori petpark.hr u Chromeu → "Dodaj na početni zaslon"\n**iPhone:** Otvori u Safariju → Dijeli → "Dodaj na početni zaslon"\n\nRadi kao prava aplikacija! 🚀',
    category: 'app',
  },
  {
    keywords: ['hvala', 'thanks', 'super', 'odlično', 'odlicno', 'top', 'bravo'],
    response: 'Nema na čemu! 😊🐾 Ako trebaš još nešto, tu sam!',
    category: 'general',
  },
  {
    keywords: ['bok', 'hej', 'hello', 'hi', 'pozdrav', 'cao', 'zdravo', 'dobro jutro', 'dobar dan'],
    response: 'Bok! 👋🐾 Kako mogu pomoći oko PetParka?',
    category: 'general',
  },
];
