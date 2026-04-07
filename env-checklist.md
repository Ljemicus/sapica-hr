# Environment Variables Checklist - PetPark Production

## Required Variables (MUST be set)

### 1. Supabase (Core Database)
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public/anonymous API key for client-side operations
- `SUPABASE_SERVICE_ROLE_KEY` - **Server-only** service role key for admin operations (cron jobs, KPI digest, ops audit)

**Status:** ✅ URL and Anon Key set in .env.prod  
**⚠️ Missing:** `SUPABASE_SERVICE_ROLE_KEY` - Required for production cron jobs

### 2. Stripe (Payments)
- `STRIPE_SECRET_KEY` - Server-side Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Client-side publishable key  
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side publishable key (same as above)

**Status:** ✅ All Stripe keys set in .env.prod

### 3. Resend (Email Service)
- `RESEND_API_KEY` - API key for transactional emails (password reset, notifications)

**Status:** ✅ Set as `resend_api_key` in .env.prod (note: variable name mismatch)

### 4. Cron Security
- `CRON_SECRET` - Authentication secret for Vercel cron endpoints

**Status:** ✅ Set in .env.prod

### 5. Slack Webhooks (Alerting)
- `SLACK_INCIDENTS_WEBHOOK` - P0/P1 critical incident alerts
- `SLACK_OPS_WEBHOOK` - P2-P4 operational alerts

**Status:** ✅ Both set in .env.prod (note: `SLACK_INCIDENT_WEBHOOK` vs `SLACK_INCIDENTS_WEBHOOK` - typo in variable name)

## Optional but Recommended

### 6. Sentry (Error Tracking)
- `NEXT_PUBLIC_SENTRY_DSN` - Client-side DSN
- `SENTRY_DSN` - Server-side DSN
- `SENTRY_ORG` - Sentry organization slug
- `SENTRY_PROJECT` - Sentry project name

**Status:** ❌ Not set - Recommended for production monitoring

### 7. Cloudinary (Image Uploads)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name for image uploads

**Status:** ❌ Not set - Optional for pet photo uploads

### 8. Web Push Notifications (VAPID)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Public VAPID key for web push
- `VAPID_PRIVATE_KEY` - Private VAPID key (server-only)
- `VAPID_SUBJECT` - Email contact for push service

**Status:** ❌ Not set - Optional for browser notifications

## Validation Checklist

### ✅ Already Configured:
- [x] NEXT_PUBLIC_SUPABASE_URL
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY  
- [x] STRIPE_SECRET_KEY
- [x] STRIPE_PUBLISHABLE_KEY
- [x] STRIPE_WEBHOOK_SECRET
- [x] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [x] RESEND_API_KEY (as `resend_api_key`)
- [x] CRON_SECRET
- [x] Slack webhooks (with typo: `SLACK_INCIDENT_WEBHOOK`)

### ⚠️ Missing Critical:
- [ ] SUPABASE_SERVICE_ROLE_KEY - **BLOCKER** for cron jobs

### 🔧 Recommended to Add:
- [ ] NEXT_PUBLIC_SENTRY_DSN
- [ ] SENTRY_DSN  
- [ ] SENTRY_ORG
- [ ] SENTRY_PROJECT
- [ ] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- [ ] VAPID keys (if push notifications needed)

## Action Items

1. **URGENT**: Get `SUPABASE_SERVICE_ROLE_KEY` from Supabase dashboard → Project Settings → API → Service Role Key
2. Fix variable name: `SLACK_INCIDENT_WEBHOOK` → `SLACK_INCIDENTS_WEBHOOK` (plural)
3. Set up Sentry DSN for error tracking
4. Consider adding Cloudinary for image uploads
5. Generate VAPID keys if push notifications required

## Vercel Environment Variables Setup

Add these to Vercel project settings (Production environment):

1. Go to Vercel Dashboard → PetPark project → Settings → Environment Variables
2. Add all variables from `.env.prod` (except Vercel auto-generated ones)
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is added
4. Update Slack webhook variable name
5. Add Sentry variables if using error tracking

## Validation Script

Run `node scripts/validate-env.js` to check all required variables are set.

---

*Last Updated: 2026-04-07*  
*Next Review: Before production launch*