#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const envArgIndex = args.indexOf('--env');
const envFile = envArgIndex >= 0 ? args[envArgIndex + 1] : '.env.local';
const envPath = path.resolve(process.cwd(), envFile);

const productionMode = envFile.includes('prod') || args.includes('--production');

const requiredAlways = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const requiredProduction = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET',
];

const recommendedProduction = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const placeholderPattern = /your-|replace|placeholder|example\.com|test-token|dummy/i;

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Env file not found: ${filePath}`);
  }

  const values = {};
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function isMissing(values, key) {
  return !values[key] || values[key].trim() === '';
}

try {
  const values = parseEnvFile(envPath);
  const required = productionMode ? [...requiredAlways, ...requiredProduction] : requiredAlways;
  const missing = required.filter((key) => isMissing(values, key));
  const placeholders = Object.entries(values)
    .filter(([key, value]) => required.includes(key) && placeholderPattern.test(value))
    .map(([key]) => key);
  const recommendedMissing = productionMode
    ? recommendedProduction.filter((key) => isMissing(values, key))
    : [];

  if (missing.length || placeholders.length) {
    console.error(`❌ Environment validation failed for ${envFile}`);
    if (missing.length) console.error(`Missing required: ${missing.join(', ')}`);
    if (placeholders.length) console.error(`Placeholder required values: ${placeholders.join(', ')}`);
    process.exit(1);
  }

  console.log(`✅ Environment validation passed for ${envFile}`);
  if (recommendedMissing.length) {
    console.warn(`⚠️ Recommended production values missing: ${recommendedMissing.join(', ')}`);
  }
} catch (error) {
  console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
