type StaticPage = {
  title: string;
  description: string;
  canonical: string;
  kicker: string;
  heading: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  cards?: Array<{ title: string; body: string; href: string }>;
  waitlist?: boolean;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function staticHtml(page: StaticPage) {
  const cards = page.cards?.length
    ? `<section class="wrap grid">${page.cards.map((card) => `<article class="card" data-testid="provider-card"><h2>${escapeHtml(card.title)}</h2><p>${escapeHtml(card.body)}</p><a href="${card.href}">Otvori →</a></article>`).join('')}</section>`
    : '';

  const secondary = page.secondaryHref && page.secondaryLabel
    ? `<a class="ghost" href="${page.secondaryHref}">${escapeHtml(page.secondaryLabel)}</a>`
    : '';

  const waitlist = page.waitlist
    ? `<section class="wrap waitlist"><form method="post" action="/api/waitlist" class="card waitlist-card"><h2>Ne vidiš svoj grad ili uslugu?</h2><p>Ostavi email i javit ćemo ti kad otvorimo dostupnost.</p><label>Email<br><input required name="email" type="email" class="field"></label><label>Grad<br><input name="city" value="Zagreb" class="field"></label><label>Usluga<br><input name="service" value="sitting" class="field field-last"></label><button class="pill button-reset" type="submit">Prijavi interes</button></form></section>`
    : '';

  return `<!doctype html>
<html lang="hr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.description)}" />
<link rel="canonical" href="${page.canonical}" />
<meta property="og:title" content="${escapeHtml(page.title)}" />
<meta property="og:description" content="${escapeHtml(page.description)}" />
<meta property="og:url" content="${page.canonical}" />
<meta name="robots" content="index,follow" />
<link rel="stylesheet" href="/static-public.css" />
</head>
<body>
<header class="nav"><div class="wrap nav-inner"><a class="logo" href="/">🐾 PetPark</a><nav class="navlinks" aria-label="Glavna navigacija"><a href="/pretraga">Pretraga</a> · <a href="/blog">Blog</a> · <a href="/postani-sitter">Postani sitter</a></nav></div></header>
<main>
<section class="hero"><div class="wrap"><p class="kicker">${escapeHtml(page.kicker)}</p><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.body)}</p><div class="actions"><a class="pill" href="${page.primaryHref}">${escapeHtml(page.primaryLabel)}</a>${secondary}</div></div></section>
${cards}
${waitlist}
</main>
<footer><div class="wrap">© ${new Date().getFullYear()} PetPark. Zagreb beta, bez izmišljenog inventoryja.</div></footer>
</body>
</html>`;
}

export function htmlResponse(html: string, revalidateSeconds: number) {
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': `s-maxage=${revalidateSeconds}, stale-while-revalidate=31536000`,
    },
  });
}
