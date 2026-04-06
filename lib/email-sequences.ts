import { sendEmail } from '@/lib/email';
import { appLogger } from '@/lib/logger';
import type { User, UserRole } from '@/lib/types';

// User roles extended for email sequences
type EmailRole = UserRole | 'groomer' | 'trainer' | 'breeder' | 'rescue';

interface EmailSequenceConfig {
  name: string;
  delayDays: number;
  subject: string;
  getHtml: (user: User) => string;
}

// --- Email Templates for Sequences ---

function baseSequenceLayout(content: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PetPark</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #14b8a6 100%); border-radius: 12px 12px 0 0; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🐾 PetPark</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; border-radius: 0 0 12px 12px; padding: 0 40px 32px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} PetPark. Sva prava pridržana.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// --- Owner Welcome Sequence ---

const ownerSequence: EmailSequenceConfig[] = [
  {
    name: 'owner_day0_welcome',
    delayDays: 0,
    subject: 'Dobrodošli u PetPark obitelj! 🐕',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Dobrodošli, ${user.name}! 🎉</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Drago nam je što ste se pridružili PetParku — mjestu gdje vaši ljubimci dobivaju pažnju koju zaslužuju.</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Kao vlasnik, možete:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Pronaći pouzdane čuvare u vašoj blizini</li>
        <li>Rezervirati šetanje, grooming ili dresuru</li>
        <li>Pratiti šetnje uživo putem GPS-a</li>
        <li>Dobiti savjete od veterinarskih stručnjaka</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/pretraga" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Pronađi čuvara</a>
      </div>
    `, 'Dobrodošli u PetPark! Pronađite najbolju brigu za svog ljubimca.'),
  },
  {
    name: 'owner_day3_profile',
    delayDays: 3,
    subject: 'Dodajte svog ljubimca na PetPark 🐾',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Upoznajte nas s vašim ljubimcem! 📸</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hej ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Čuvarima je puno lakše brinuti o vašem ljubimcu kada znaju više o njemu — njegove navike, omiljene igračke, prehrambene potrebe...</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Kreirajte profil svog ljubimca i olakšajte čuvarima da pruže najbolju moguću brigu.</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/dashboard/vlasnik/ljubimci" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Dodaj ljubimca</a>
      </div>
    `, 'Kreirajte profil svog ljubimca za bolju brigu.'),
  },
  {
    name: 'owner_day7_tips',
    delayDays: 7,
    subject: 'Savjeti za prvu rezervaciju na PetParku 💡',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Spremni za prvu rezervaciju? 🎯</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Pozdrav ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Evo nekoliko savjeta za uspješnu prvu rezervaciju:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li><strong>Pročitajte recenzije</strong> — drugi vlasnici dijele svoja iskustva</li>
        <li><strong>Provjerite verifikaciju</strong> — birajte provjerene čuvare s oznakom "Verified"</li>
        <li><strong>Komunicirajte unaprijed</strong> — dogovorite detalje prije rezervacije</li>
        <li><strong>Prva šetnja besplatna</strong> — isprobajte čuara bez rizika</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/pretraga" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Pretraži čuvare</a>
      </div>
    `, 'Savjeti za uspješnu prvu rezervaciju na PetParku.'),
  },
];

// --- Sitter Welcome Sequence ---

const sitterSequence: EmailSequenceConfig[] = [
  {
    name: 'sitter_day0_welcome',
    delayDays: 0,
    subject: 'Dobrodošli u tim PetPark čuvara! 🐕‍🦺',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Dobrodošli, ${user.name}! 🌟</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Čestitamo na postajanju dijelom PetPark zajednice čuvara! Radujemo se što zajedno pomažemo vlasnicima pronaći najbolju brigu za njihove ljubimce.</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Vaše prednosti kao čuvar:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Fleksibilan raspored rada</li>
        <li>Sigurna plaćanja putem platforme</li>
        <li>Osiguranje svake rezervacije</li>
        <li>Podrška 24/7</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/dashboard/sitter/postavke" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Postavi profil</a>
      </div>
    `, 'Dobrodošli u tim PetPark čuvara! Počnite zarađivati brinući o ljubimcima.'),
  },
  {
    name: 'sitter_day3_complete_profile',
    delayDays: 3,
    subject: 'Dovršite svoj profil i privucite više klijenata ⭐',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Profili koji se ističu zarađuju više! 💰</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hej ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Čuvari s potpunim profilima dobivaju <strong>3x više upita</strong>!</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Ne zaboravite dodati:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Fotografije s ljubimcima</li>
        <li>Detaljan opis iskustva</li>
        <li>Cjenik usluga</li>
        <li>Dostupnost u kalendaru</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/dashboard/sitter/postavke" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Uredi profil</a>
      </div>
    `, 'Dovršite profil da privučete više klijenata.'),
  },
  {
    name: 'sitter_day7_verification',
    delayDays: 7,
    subject: 'Postanite verificirani čuvar i izgradite povjerenje ✅',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Verifikacija otvara vrata! 🔓</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Pozdrav ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Verificirani čuvari dobivaju:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>✅ Posebnu oznaku na profilu</li>
        <li>✅ Bolju poziciju u pretraživanju</li>
        <li>✅ Više povjerenja vlasnika</li>
        <li>✅ Prioritet u sustavu preporuka</li>
      </ul>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Verifikacija je jednostavna i besplatna!</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/verifikacija" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Započni verifikaciju</a>
      </div>
    `, 'Postanite verificirani čuvar i izgradite povjerenje.'),
  },
];

// --- Groomer Welcome Sequence ---

const groomerSequence: EmailSequenceConfig[] = [
  {
    name: 'groomer_day0_welcome',
    delayDays: 0,
    subject: 'Dobrodošli u PetPark mrežu grooming stručnjaka! ✂️',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Dobrodošli, ${user.name}! 🛁</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Drago nam je što ste se pridružili mreži grooming stručnjaka na PetParku!</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Što vam nudimo:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Pristup velikoj bazi klijenata</li>
        <li>Jednostavan sustav rezervacija</li>
        <li>Mogućnost online plaćanja</li>
        <li>Marketing podršku</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/groomer/dashboard" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Postavi salon</a>
      </div>
    `, 'Dobrodošli u mrežu grooming stručnjaka!'),
  },
  {
    name: 'groomer_day3_services',
    delayDays: 3,
    subject: 'Definirajte svoje usluge i cjenik 💈',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Jasan cjenik = zadovoljni klijenti 💎</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Pozdrav ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Klijenti cijene transparentnost. Definirajte:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Osnovne usluge (kupanje, šišanje, nokti...)</li>
        <li>Dodatne usluge (tretman dlake, čišćenje ušiju...)</li>
        <li>Cijene po veličini pasa</li>
        <li>Pakete usluga s popustima</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/groomer/dashboard" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Uredi usluge</a>
      </div>
    `, 'Definirajte svoje usluge i cjenik za više klijenata.'),
  },
  {
    name: 'groomer_day7_photos',
    delayDays: 7,
    subject: 'Fotografije vaših radova privlače klijente 📸',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Pokažite svoje vještine! 🏆</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hej ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Groomeri s galerijom svojih radova dobivaju <strong>50% više rezervacija</strong>.</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Savjeti za najbolje fotografije:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Fotografirajte "prije i poslije"</li>
        <li>Osigurajte dobro osvjetljenje</li>
        <li>Pokažite različite stilove šišanja</li>
        <li>Uključite sretne klijente (s dozvolom!)</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/groomer/dashboard" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Dodaj fotografije</a>
      </div>
    `, 'Fotografije vaših radova privlače više klijenata.'),
  },
];

// --- Trainer Welcome Sequence ---

const trainerSequence: EmailSequenceConfig[] = [
  {
    name: 'trainer_day0_welcome',
    delayDays: 0,
    subject: 'Dobrodošli u PetPark tim trenera! 🎓',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Dobrodošli, ${user.name}! 🐕‍🦺</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Drago nam je što ste se pridružili timu trenera na PetParku!</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Vaše mogućnosti:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Kreirajte programe dresure</li>
        <li>Online rezervacije termina</li>
        <li>Pristup velikoj bazi klijenata</li>
        <li>Mogućnost grupnih i individualnih sesija</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/trener/dashboard" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Kreiraj program</a>
      </div>
    `, 'Dobrodošli u tim trenera! Podijelite svoje znanje.'),
  },
  {
    name: 'trainer_day3_programs',
    delayDays: 3,
    subject: 'Kreirajte programe koji prodaju 📋',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Vaš program, vaš brand 🌟</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Pozdrav ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Kreirajte atraktivne programe dresure:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Osnovna poslušnost</li>
        <li>Socijalizacija štencadi</li>
        <li>Rješavanje ponašanja</li>
        <li>Agility i sport</li>
      </ul>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Svaki program bi trebao imati jasan cilj, opis i očekivane rezultate.</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/trener/dashboard" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Uredi programe</a>
      </div>
    `, 'Kreirajte atraktivne programe dresure.'),
  },
  {
    name: 'trainer_day7_certifications',
    delayDays: 7,
    subject: 'Istaknite svoje certifikacije 🏅',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Stručnost se prepoznaje! 📜</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hej ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Klijenti žele znati s kim surađuju. Dodajte:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Certifikate i diplome</li>
        <li>Godine iskustva</li>
        <li>Specijalizacije (ponašanje, sport...)</li>
        <li>Članstva u stručnim udrugama</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/trener/dashboard" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Uredi kvalifikacije</a>
      </div>
    `, 'Istaknite svoje certifikacije za više klijenata.'),
  },
];

// --- Breeder Welcome Sequence ---

const breederSequence: EmailSequenceConfig[] = [
  {
    name: 'breeder_day0_welcome',
    delayDays: 0,
    subject: 'Dobrodošli u PetPark mrežu uzgajivačnica! 🐾',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Dobrodošli, ${user.name}! 🐕</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Drago nam je što ste se pridružili mreži odgovornih uzgajivačnica na PetParku!</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Naša platforma vam nudi:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Prikaz vaših legla budućim vlasnicima</li>
        <li>Alate za komunikaciju s potencijalnim kupcima</li>
        <li>Verifikaciju uzgajivačnice</li>
        <li>Podršku u odgovornom udomljavanju</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/uzgajivacnica/profil" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Postavi profil</a>
      </div>
    `, 'Dobrodošli u mrežu uzgajivačnica! Pronađite odgovorne vlasnike.'),
  },
  {
    name: 'breeder_day3_listings',
    delayDays: 3,
    subject: 'Kreirajte oglase za svoja legla 🐶',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Predstavite svoja legla! 🏠</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Pozdrav ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Kvalitetan oglas privlači odgovorne vlasnike:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Dodajte fotografije roditelja i štenaca</li>
        <li>Navedite zdravstvene preglede i cijepljenja</li>
        <li>Opišite temperament i karakter pasa</li>
        <li>Budite transparentni oko cijena i uvjeta</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/uzgajivacnica/oglasi" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Dodaj oglas</a>
      </div>
    `, 'Kreirajte kvalitetne oglase za svoja legla.'),
  },
  {
    name: 'breeder_day7_verification',
    delayDays: 7,
    subject: 'Verifikacija uzgajivačnice izgraduje povjerenje ✅',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Budite prepoznatljivi kao odgovorni uzgajivač! 🌟</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Pozdrav ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Verificirane uzgajivačnice dobivaju:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>✅ Posebnu oznaku na oglasima</li>
        <li>✅ Bolju poziciju u pretraživanju</li>
        <li>✅ Više povjerenja kupaca</li>
        <li>✅ Pristup ekskluzivnim alatima</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/verifikacija" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Započni verifikaciju</a>
      </div>
    `, 'Verifikacija izgraduje povjerenje s potencijalnim kupcima.'),
  },
];

// --- Rescue Welcome Sequence ---

const rescueSequence: EmailSequenceConfig[] = [
  {
    name: 'rescue_day0_welcome',
    delayDays: 0,
    subject: 'Dobrodošli u PetPark mrežu udruga! 🏠',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Hvala vam na vašem radu, ${user.name}! 💚</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Drago nam je što ste se pridružili PetPark mreži udruga za zaštitu životinja!</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Naša platforma vam nudi:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Profil udruge s misijom i kontaktima</li>
        <li>Oglase za udomljavanje životinja</li>
        <li>Sustav apelacija za donacije</li>
        <li>Pristup zajednici volontera</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/udruge/postavke" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Postavi profil udruge</a>
      </div>
    `, 'Dobrodošli u mrežu udruga! Hvala vam na vašem važnom radu.'),
  },
  {
    name: 'rescue_day3_animals',
    delayDays: 3,
    subject: 'Predstavite životinje za udomljavanje 🐱',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Svaka životinja zaslužuje dom! 🏡</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Pozdrav ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Savjeti za učinkovite oglase udomljavanja:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Kvalitetne fotografije iz više kutova</li>
        <li>Detaljan opis karaktera i navika</li>
        <li>Informacije o zdravlju i cijepljenju</li>
        <li>Jasni uvjeti udomljavanja</li>
      </ul>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/udruge/zivotinje" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Dodaj životinju</a>
      </div>
    `, 'Kreirajte oglase za udomljavanje životinja.'),
  },
  {
    name: 'rescue_day7_appeals',
    delayDays: 7,
    subject: 'Apelacije za donacije — kako povećati uspjeh 💰',
    getHtml: (user) => baseSequenceLayout(`
      <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Važan alat za vaš rad 🤝</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Pozdrav ${user.name},</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Apelacije vam pomažu prikupiti sredstva za:</p>
      <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
        <li>Veterinarske troškove</li>
        <li>Hranu i opremu</li>
        <li>Rekonstrukciju prostora</li>
        <li>Hitne intervencije</li>
      </ul>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Uspješne apelacije imaju jasan cilj, fotografije i redovita ažuriranja.</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="https://petpark.hr/udruge/apelacije" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Kreiraj apelaciju</a>
      </div>
    `, 'Kreirajte apelacije za donacije i povežite se s donatorima.'),
  },
];

// --- Role to Sequence Mapping ---

const sequences: Record<EmailRole, EmailSequenceConfig[]> = {
  owner: ownerSequence,
  sitter: sitterSequence,
  groomer: groomerSequence,
  trainer: trainerSequence,
  breeder: breederSequence,
  rescue: rescueSequence,
  admin: ownerSequence, // Admins get owner sequence as fallback
};

// --- Public API ---

/**
 * Get welcome email sequence for a user role
 */
export function getWelcomeSequence(role: EmailRole): EmailSequenceConfig[] {
  return sequences[role] || sequences.owner;
}

/**
 * Send a specific sequence email immediately
 */
export async function sendSequenceEmail(
  user: User,
  role: EmailRole,
  emailName: string
): Promise<{ success: boolean; error?: string }> {
  const sequence = getWelcomeSequence(role);
  const email = sequence.find(e => e.name === emailName);
  
  if (!email) {
    return { success: false, error: 'Email not found in sequence' };
  }

  return sendEmail({
    to: user.email,
    subject: email.subject,
    html: email.getHtml(user),
  });
}

/**
 * Schedule a welcome sequence for a new user
 * This creates database entries for scheduled emails
 */
export async function scheduleWelcomeSequence(
  user: User,
  role: EmailRole
): Promise<void> {
  try {
    // For now, we just send the day 0 email immediately
    // Full scheduling would require a cron job system
    const result = await sendSequenceEmail(user, role, `${role}_day0_welcome`);
    
    if (result.success) {
      appLogger.info('email_sequence', `Welcome email sent to ${user.email}`, { role });
    } else {
      appLogger.error('email_sequence', `Failed to send welcome email to ${user.email}`, { error: result.error });
    }
  } catch (error) {
    appLogger.error('email_sequence', 'Failed to schedule welcome sequence', { error: String(error), userId: user.id });
  }
}

// --- Transactional Email Functions ---

/**
 * Send booking confirmation email
 */
export function sendBookingConfirmationEmail(
  user: User,
  bookingDetails: {
    petName: string;
    serviceName: string;
    providerName: string;
    dates: string;
    totalPrice: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const html = baseSequenceLayout(`
    <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Rezervacija potvrđena! ✅</h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Pozdrav ${user.name},</p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Vaša rezervacija je uspješno potvrđena!</p>
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 8px; color: #374151;"><strong>Ljubimac:</strong> ${bookingDetails.petName}</p>
      <p style="margin: 0 0 8px; color: #374151;"><strong>Usluga:</strong> ${bookingDetails.serviceName}</p>
      <p style="margin: 0 0 8px; color: #374151;"><strong>Pružatelj:</strong> ${bookingDetails.providerName}</p>
      <p style="margin: 0 0 8px; color: #374151;"><strong>Datumi:</strong> ${bookingDetails.dates}</p>
      <p style="margin: 0; color: #374151;"><strong>Ukupno:</strong> ${bookingDetails.totalPrice}</p>
    </div>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Detalje rezervacije možete pogledati u svom dashboardu.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="https://petpark.hr/dashboard" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Pogledaj rezervaciju</a>
    </div>
  `, `Vaša rezervacija za ${bookingDetails.petName} je potvrđena!`);

  return sendEmail({
    to: user.email,
    subject: `Rezervacija potvrđena — ${bookingDetails.serviceName}`,
    html,
  });
}

/**
 * Send review request email after completed booking
 */
export function sendReviewRequestEmail(
  user: User,
  reviewDetails: {
    petName: string;
    providerName: string;
    serviceName: string;
    bookingId: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const html = baseSequenceLayout(`
    <h2 style="color: #1f2937; font-size: 22px; font-weight: 700;">Kako je prošla usluga? ⭐</h2>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Pozdrav ${user.name},</p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Nedavno je završeno čuvanje za vašeg ljubimca <strong>${reviewDetails.petName}</strong>.</p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Vaše mišljenje nam je važno! Ostavite recenziju i pomozite drugim vlasnicima pronaći najbolju brigu za svoje ljubimce.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="https://petpark.hr/dashboard/vlasnik?review=${reviewDetails.bookingId}" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px;">Ostavi recenziju</a>
    </div>
    <p style="color: #9ca3af; font-size: 14px;">Recenzija traje samo minutu, a pomaže puno!</p>
  `, `Ostavite recenziju za ${reviewDetails.providerName}`);

  return sendEmail({
    to: user.email,
    subject: 'Kako je prošla usluga? Ostavite recenziju ⭐',
    html,
  });
}

// --- Cron Job Handler ---

/**
 * Process scheduled emails for the email sequences
 * This should be called by a cron job (e.g., daily)
 */
export async function processScheduledEmails(): Promise<{
  sent: number;
  failed: number;
}> {
  // This is a placeholder for full scheduling implementation
  // In production, you would:
  // 1. Query scheduled_emails table for pending emails where send_at <= now
  // 2. Send each email
  // 3. Mark as sent or failed
  
  appLogger.info('email_sequence', 'Processing scheduled emails');
  
  return { sent: 0, failed: 0 };
}
