function baseLayout(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>PetPark</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheader}</div>` : ''}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #14b8a6 100%); border-radius: 12px 12px 0 0; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                &#128062; PetPark
              </h1>
              <p style="margin: 4px 0 0; color: rgba(255, 255, 255, 0.85); font-size: 14px; font-weight: 400;">
                Briga za ljubimce s povjerenjem
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 0 0 12px 12px; padding: 0 40px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; line-height: 1.5;">
                      Ovu poruku ste primili jer imate račun na PetParku.
                    </p>
                    <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; line-height: 1.5;">
                      <a href="https://petpark.hr/postavke/obavijesti" style="color: #f97316; text-decoration: underline;">Upravljajte obavijestima</a>
                      &nbsp;&middot;&nbsp;
                      <a href="https://petpark.hr" style="color: #f97316; text-decoration: underline;">petpark.hr</a>
                    </p>
                    <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">
                      &copy; ${new Date().getFullYear()} PetPark. Sva prava pridržana.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 28px 0 8px;">
  <tr>
    <td align="center">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${href}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="50%" fillcolor="#f97316">
        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">${text}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${href}" target="_blank" style="display: inline-block; background-color: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 24px; mso-hide: all;">
        ${text}
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

function heading(text: string): string {
  return `<h2 style="margin: 0 0 20px; color: #1f2937; font-size: 22px; font-weight: 700; line-height: 1.3;">${text}</h2>`;
}

function paragraph(text: string): string {
  return `<p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">${text}</p>`;
}

function infoBox(text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 16px 0;">
  <tr>
    <td style="background-color: #fef3e2; border-left: 4px solid #f97316; border-radius: 0 8px 8px 0; padding: 16px 20px;">
      <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.5; font-weight: 500;">${text}</p>
    </td>
  </tr>
</table>`;
}

// --- Email templates ---

export function newBookingRequestEmail(
  sitterName: string,
  ownerName: string,
  petName: string,
  serviceName: string,
  dates: string,
): string {
  const content = `
    ${heading('Novi upit za čuvanje! &#127881;')}
    ${paragraph(`Pozdrav ${sitterName},`)}
    ${paragraph(`<strong>${ownerName}</strong> želi rezervirati <strong>${serviceName}</strong> za ljubimca <strong>${petName}</strong>.`)}
    ${infoBox(`&#128197; Datumi: ${dates}`)}
    ${paragraph('Pregledajte upit i odgovorite što prije kako biste osigurali rezervaciju.')}
    ${ctaButton('Pogledaj upit', 'https://petpark.hr/dashboard/sitter')}
  `;
  return baseLayout(content, `${ownerName} želi rezervirati ${serviceName} za ${petName}`);
}

export function bookingAcceptedEmail(
  ownerName: string,
  sitterName: string,
  petName: string,
  dates: string,
): string {
  const content = `
    ${heading('Rezervacija potvrđena! &#127881;')}
    ${paragraph(`Sjajne vijesti, ${ownerName}!`)}
    ${paragraph(`<strong>${sitterName}</strong> je prihvatio/la rezervaciju za <strong>${petName}</strong>.`)}
    ${infoBox(`&#128197; Datumi: ${dates}`)}
    ${paragraph('Možete kontaktirati sittera putem poruka kako biste dogovorili detalje.')}
    ${ctaButton('Pogledaj rezervaciju', 'https://petpark.hr/dashboard/vlasnik')}
  `;
  return baseLayout(content, `${sitterName} je prihvatio/la rezervaciju za ${petName}`);
}

export function bookingRejectedEmail(
  ownerName: string,
  sitterName: string,
  petName: string,
  dates: string,
): string {
  const content = `
    ${heading('Rezervacija odbijena')}
    ${paragraph(`Pozdrav ${ownerName},`)}
    ${paragraph(`Nažalost, <strong>${sitterName}</strong> ne može prihvatiti rezervaciju za <strong>${petName}</strong> (<strong>${dates}</strong>).`)}
    ${paragraph('Ne brinite — na PetParku možete lako pronaći drugog pouzdanog sittera za vašeg ljubimca.')}
    ${ctaButton('Pronađi drugog sittera', 'https://petpark.hr/pretraga')}
  `;
  return baseLayout(content, `${sitterName} ne može prihvatiti rezervaciju za ${petName}`);
}

export function bookingCancelledEmail(
  recipientName: string,
  petName: string,
  dates: string,
): string {
  const content = `
    ${heading('Rezervacija otkazana')}
    ${paragraph(`Pozdrav ${recipientName},`)}
    ${paragraph(`Nažalost, rezervacija za <strong>${petName}</strong> (<strong>${dates}</strong>) je otkazana.`)}
    ${paragraph('Ne brinite — na PetParku možete lako pronaći drugog pouzdanog sittera za vašeg ljubimca.')}
    ${ctaButton('Pronađi drugog sittera', 'https://petpark.hr/pretraga')}
  `;
  return baseLayout(content, `Rezervacija za ${petName} je otkazana`);
}

export function newMessageEmail(
  recipientName: string,
  senderName: string,
): string {
  const content = `
    ${heading('Nova poruka &#128172;')}
    ${paragraph(`Pozdrav ${recipientName},`)}
    ${paragraph(`<strong>${senderName}</strong> vam je poslao/la poruku na PetParku.`)}
    ${paragraph('Odgovorite što prije kako biste nastavili razgovor.')}
    ${ctaButton('Pogledaj poruku', 'https://petpark.hr/poruke')}
  `;
  return baseLayout(content, `${senderName} vam je poslao/la poruku`);
}

export function walkUpdateEmail(
  ownerName: string,
  petName: string,
  sitterName: string,
): string {
  const content = `
    ${heading('Vaš ljubimac je na šetnji! &#128694;')}
    ${paragraph(`Pozdrav ${ownerName},`)}
    ${paragraph(`<strong>${sitterName}</strong> je krenuo/la u šetnju s <strong>${petName}</strong>.`)}
    ${infoBox('&#128205; Pratite šetnju uživo na PetParku — GPS lokacija, prijeđena udaljenost i fotografije.')}
    ${paragraph('Otvorite aplikaciju za praćenje u stvarnom vremenu.')}
    ${ctaButton('Prati šetnju', 'https://petpark.hr/dashboard/vlasnik')}
  `;
  return baseLayout(content, `${sitterName} je krenuo/la u šetnju s ${petName}`);
}

export function paymentConfirmationEmail(
  ownerName: string,
  petName: string,
  serviceName: string,
  dates: string,
  amountFormatted: string,
): string {
  const content = `
    ${heading('Plaćanje potvrđeno! &#9989;')}
    ${paragraph(`Pozdrav ${ownerName},`)}
    ${paragraph(`Vaše plaćanje za <strong>${serviceName}</strong> za ljubimca <strong>${petName}</strong> je uspješno provedeno.`)}
    ${infoBox(`&#128197; Datumi: ${dates}<br>&#128176; Iznos: ${amountFormatted}`)}
    ${paragraph('Rezervacija je potvrđena. Čuvar će biti obaviješten.')}
    ${ctaButton('Pogledaj rezervaciju', 'https://petpark.hr/dashboard/vlasnik')}
  `;
  return baseLayout(content, `Plaćanje za ${serviceName} je potvrđeno`);
}

export function sitterPaymentNotificationEmail(
  sitterName: string,
  ownerName: string,
  petName: string,
  serviceName: string,
  dates: string,
  payoutFormatted: string,
): string {
  const content = `
    ${heading('Nova uplata primljena! &#128176;')}
    ${paragraph(`Pozdrav ${sitterName},`)}
    ${paragraph(`<strong>${ownerName}</strong> je platio/la <strong>${serviceName}</strong> za ljubimca <strong>${petName}</strong>.`)}
    ${infoBox(`&#128197; Datumi: ${dates}<br>&#128176; Vaša zarada: ${payoutFormatted}`)}
    ${paragraph('Sredstva će biti dostupna na vašem Stripe računu nakon završetka usluge.')}
    ${ctaButton('Pogledaj dashboard', 'https://petpark.hr/dashboard/sitter')}
  `;
  return baseLayout(content, `${ownerName} je platio/la za ${serviceName}`);
}

export function welcomeEmail(userName: string): string {
  const content = `
    ${heading('Dobrodošli na PetPark! &#128062;')}
    ${paragraph(`Dobrodošli na PetPark, ${userName}!`)}
    ${paragraph('Drago nam je što ste se pridružili zajednici ljubitelja životinja. PetPark je platforma koja povezuje vlasnike kućnih ljubimaca s pouzdanim čuvarima — jer vaš ljubimac zaslužuje najbolju brigu.')}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: top; padding-right: 12px; font-size: 20px;">&#128269;</td>
              <td>
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.5;"><strong>Pretražite sittere</strong> — pronađite provjerene čuvare u vašoj blizini</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: top; padding-right: 12px; font-size: 20px;">&#128054;</td>
              <td>
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.5;"><strong>Dodajte ljubimca</strong> — kreirajte profil za vašeg mezimca</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: top; padding-right: 12px; font-size: 20px;">&#128205;</td>
              <td>
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.5;"><strong>Otkrijte dog-friendly mjesta</strong> — parkovi, kafići i više</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${ctaButton('Započni pretragu', 'https://petpark.hr/pretraga')}
  `;
  return baseLayout(content, `Dobrodošli na PetPark, ${userName}!`);
}
