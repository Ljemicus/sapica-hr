# API Key Rotation Documentation

## Overview

This document outlines the API key rotation procedures for PetPark to maintain security and minimize exposure risk.

## Key Types and Rotation Schedules

### 1. Supabase Keys

**Files:** `.env.local`, `.env.prod`, Vercel Environment Variables

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Type:** Public (client-side safe)
- **Rotation Schedule:** Every 90 days or on suspected compromise
- **Impact:** Users will need to refresh their sessions
- **Procedure:**
  1. Generate new key in Supabase Dashboard → Project Settings → API
  2. Update in Vercel environment variables
  3. Deploy to trigger new build
  4. Monitor for errors
  5. Revoke old key after 24 hours

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Type:** Secret (server-only)
- **Rotation Schedule:** Every 60 days or immediately on suspected compromise
- **Impact:** Cron jobs and server functions may fail during rotation
- **Procedure:**
  1. Generate new key in Supabase Dashboard
  2. Update in Vercel environment variables
  3. Test cron jobs immediately
  4. Revoke old key immediately after verification

### 2. Stripe Keys

**Files:** `.env.prod`, Vercel Environment Variables

#### `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
- **Type:** Secret (server-only)
- **Rotation Schedule:** Every 90 days or on suspected compromise
- **Impact:** Payment processing interruption if not done carefully
- **Procedure:**
  1. Generate new restricted API key in Stripe Dashboard
  2. Update webhook secret (re-create webhook endpoint if needed)
  3. Update in Vercel environment variables
  4. Test payment flow in staging
  5. Deploy to production
  6. Monitor payment webhooks for 1 hour
  7. Revoke old key

### 3. Resend API Key

**Files:** `.env.prod`

- **Type:** Secret (server-only)
- **Rotation Schedule:** Every 90 days
- **Impact:** Email delivery may fail during rotation
- **Procedure:**
  1. Generate new API key in Resend Dashboard
  2. Update in Vercel environment variables
  3. Send test email
  4. Revoke old key

### 4. Upstash Redis Keys

**Files:** `.env.prod`

- **Type:** Secret (server-only)
- **Rotation Schedule:** Every 90 days
- **Impact:** Rate limiting may fail to in-memory fallback
- **Procedure:**
  1. Rotate token in Upstash Console
  2. Update `UPSTASH_REDIS_REST_TOKEN`
  3. Deploy and verify rate limiting works
  4. Old token expires automatically

### 5. Sentry DSN

**Files:** `.env.prod`

- **Type:** Public (client-side safe)
- **Rotation Schedule:** On suspected compromise only
- **Impact:** Error tracking interruption
- **Procedure:**
  1. Generate new DSN in Sentry Project Settings
  2. Update in Vercel environment variables
  3. Deploy
  4. Verify errors are being captured
  5. Revoke old DSN

### 6. VAPID Keys (Web Push)

**Files:** `.env.prod`

- **Type:** Secret (server-only for private key)
- **Rotation Schedule:** Every 180 days
- **Impact:** Existing push subscriptions will fail
- **Procedure:**
  1. Generate new keys: `npx web-push generate-vapid-keys`
  2. Update both public and private keys
  3. Update in Vercel environment variables
  4. Users will need to re-subscribe to push notifications
  5. Consider implementing key version management for graceful transition

### 7. Cloudinary Keys

**Files:** `.env.prod`

- **Type:** Secret (server-only)
- **Rotation Schedule:** Every 90 days
- **Impact:** Image uploads will fail
- **Procedure:**
  1. Generate new API key in Cloudinary Dashboard
  2. Update `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
  3. Deploy and test image upload
  4. Revoke old key

### 8. Cron Secret

**Files:** `.env.prod`, Vercel Project Settings

- **Type:** Secret (server-only)
- **Rotation Schedule:** Every 60 days
- **Impact:** Cron jobs will fail authentication
- **Procedure:**
  1. Generate new secret: `openssl rand -hex 32`
  2. Update in Vercel Project Settings (CRON_SECRET)
  3. Update in `.env.prod`
  4. Test cron endpoints
  5. No revocation needed (old secret simply becomes invalid)

## Emergency Rotation Procedures

### If Key is Compromised

1. **Immediately revoke** the compromised key in the respective service dashboard
2. **Generate new key** following procedures above
3. **Update environment variables** in Vercel
4. **Deploy immediately** to minimize downtime
5. **Investigate** how the key was compromised
6. **Review logs** for unauthorized usage

### If You Suspect Compromise

1. **Generate new key** without revoking old one
2. **Update and deploy**
3. **Monitor** for 24 hours
4. **Revoke old key** if no issues

## Automation

Consider implementing automated rotation for:
- Supabase Service Role Key (using Supabase Management API)
- Upstash tokens (using Upstash API)

## Key Storage Best Practices

1. **Never commit keys to git** - Use `.env.local` for local development
2. **Use Vercel Environment Variables** for production
3. **Use different keys** for staging and production
4. **Monitor key usage** in respective dashboards
5. **Set up alerts** for unusual API usage patterns

## Contact

For questions about key rotation, contact:
- Security: security@petpark.hr
- DevOps: devops@petpark.hr
