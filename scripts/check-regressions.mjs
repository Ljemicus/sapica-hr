#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const baselinePath = path.join(root, 'docs/recovery/ci-regression-baseline.json');
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

const scanRoots = ['app', 'lib', 'tests', 'scripts'];
const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function walk(dir) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  const out = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const p = path.join(full, entry.name);
    const rel = path.relative(root, p);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'coverage', 'test-results'].includes(entry.name)) continue;
      out.push(...walk(rel));
    } else if (textExtensions.has(path.extname(entry.name))) {
      out.push(rel);
    }
  }
  return out;
}

const files = scanRoots.flatMap(walk).sort();

function lineMatches(pattern) {
  const matches = [];
  for (const file of files) {
    const lines = fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (pattern.test(line)) {
        matches.push(`${file}:${idx + 1}:${line.trim()}`);
      }
    });
  }
  return matches.sort();
}

function findNewMatches(name, current) {
  const allowed = new Set(baseline[name] ?? []);
  return current.filter((entry) => !allowed.has(entry));
}

const legacyUserReads = lineMatches(/\.from\(\s*['"]users['"]\s*\)/);
const newLegacyUserReads = findNewMatches('legacyUserReads', legacyUserReads);

function checkoutCreateFindings() {
  const findings = [];
  for (const file of files) {
    const lines = fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (!/stripe\.checkout\.sessions\.create\s*\(/.test(line)) return;
      const lookahead = lines.slice(idx, Math.min(lines.length, idx + 12)).join('\n');
      if (!/idempotencyKey\s*:/.test(lookahead)) {
        findings.push(`${file}:${idx + 1}:${line.trim()}`);
      }
    });
  }
  return findings.sort();
}

const checkoutMissingIdempotency = checkoutCreateFindings();
const newCheckoutMissingIdempotency = findNewMatches('checkoutMissingIdempotency', checkoutMissingIdempotency);

const failures = [];
if (newLegacyUserReads.length > 0) {
  failures.push({
    title: 'block regression strings: new .from(\'users\') references',
    entries: newLegacyUserReads,
  });
}
if (newCheckoutMissingIdempotency.length > 0) {
  failures.push({
    title: 'block regression strings: new stripe.checkout.sessions.create without idempotencyKey',
    entries: newCheckoutMissingIdempotency,
  });
}

if (failures.length > 0) {
  console.error('CI regression check failed.');
  for (const failure of failures) {
    console.error(`\n${failure.title}`);
    for (const entry of failure.entries) console.error(`- ${entry}`);
  }
  process.exit(1);
}

console.log('CI regression check passed.');
console.log(`legacyUserReads baseline/current: ${(baseline.legacyUserReads ?? []).length}/${legacyUserReads.length}`);
console.log(`checkoutMissingIdempotency baseline/current: ${(baseline.checkoutMissingIdempotency ?? []).length}/${checkoutMissingIdempotency.length}`);
