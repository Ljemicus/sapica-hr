#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');

const baseUrl = process.env.A11Y_BASE_URL || 'http://127.0.0.1:3017';
const routes = ['/', '/pretraga', '/blog', '/veterinari', '/zajednica'];
const outDir = path.join(process.cwd(), 'evidence/_artifacts/axe');
fs.mkdirSync(outDir, { recursive: true });

function safeName(route) {
  return route === '/' ? 'home' : route.replace(/^\//, '').replace(/[^a-z0-9-]+/gi, '-');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const summary = [];

  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:auto!important}' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const seriousOrCritical = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    const artifact = {
      url,
      route,
      timestamp: new Date().toISOString(),
      seriousOrCriticalCount: seriousOrCritical.length,
      violations: results.violations,
    };
    fs.writeFileSync(path.join(outDir, `${safeName(route)}.json`), JSON.stringify(artifact, null, 2));
    summary.push({ route, seriousOrCritical: seriousOrCritical.length, total: results.violations.length });
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
  console.table(summary);

  const failing = summary.filter((item) => item.seriousOrCritical > 0);
  if (failing.length > 0) {
    process.exitCode = 1;
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
