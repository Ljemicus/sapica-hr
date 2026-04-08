# PetPark Deployment Checklist

## Pre-Deployment Verification

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server only)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (server only)
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] `SENTRY_DSN` - Sentry error tracking DSN
- [ ] `SENTRY_ORG` - Sentry organization slug
- [ ] `SENTRY_PROJECT` - Sentry project slug
- [ ] `UPSTASH_REDIS_REST_URL` - Upstash Redis URL (rate limiting)
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- [ ] `RESEND_API_KEY` - Resend email API key
- [ ] `NEXT_PUBLIC_APP_URL` - Production app URL (https://petpark.hr)

### Database
- [ ] Run all migrations: `supabase db push`
- [ ] Verify RLS policies are enabled on all tables
- [ ] Seed emergency vet clinics data
- [ ] Seed fraud detection rules
- [ ] Create initial admin user
- [ ] Verify indexes on frequently queried columns

### Build Verification
- [ ] `npm run type-check` - No TypeScript errors
- [ ] `npm run lint` - No ESLint errors
- [ ] `npm run test:ci` - All tests passing
- [ ] `npm run build` - Build succeeds without errors
- [ ] Bundle size check: < 200KB initial JS

### Security Checks
- [ ] CSP headers configured in next.config.ts
- [ ] `/api/csp-report` endpoint receiving reports
- [ ] Rate limiting enabled (Upstash Redis)
- [ ] `/api/health` endpoint responding 200
- [ ] No sensitive data in client bundles
- [ ] All API routes have proper authentication

### Feature Flags
- [ ] Forum disabled (`forum: false`)
- [ ] Shop disabled (`shop: false`)
- [ ] Challenges disabled (`challenges: false`)
- [ ] Photo contests disabled (`photoContests: false`)
- [ ] Core marketplace features enabled

## Deployment Steps

### 1. Staging Deployment
```bash
npm run deploy:staging
```
- [ ] Deploy to Vercel preview
- [ ] Run smoke tests
- [ ] Verify all API endpoints
- [ ] Check error tracking in Sentry

### 2. Production Database Migration
```bash
supabase db push --linked
```
- [ ] Backup production database
- [ ] Run migrations
- [ ] Verify data integrity

### 3. Production Deployment
```bash
npm run deploy:prod
```
- [ ] Deploy to Vercel production
- [ ] Verify `/api/health` returns 200
- [ ] Check build logs for errors

### 4. Post-Deployment Verification
- [ ] Homepage loads correctly
- [ ] Search functionality works
- [ ] Booking flow complete test
- [ ] Payment processing works
- [ ] Email notifications sent
- [ ] Sentry receiving errors
- [ ] Analytics events firing

## Monitoring Setup

### Sentry
- [ ] Source maps uploaded
- [ ] Release tracking configured
- [ ] Alert rules for error spikes
- [ ] Performance monitoring enabled

### Vercel
- [ ] Analytics enabled
- [ ] Speed Insights enabled
- [ ] Alert on build failures
- [ ] Log drains configured (if needed)

### Custom Monitoring
- [ ] `/api/health` monitored (200 OK)
- [ ] `/api/csp-report` monitored
- [ ] Database connection pool monitored
- [ ] Stripe webhook delivery monitored

## Rollback Plan

### Immediate Rollback (< 5 min)
```bash
# Revert to previous deployment
vercel --prod --version <PREVIOUS_VERSION>
```

### Database Rollback
1. Restore from backup if schema changed
2. Or revert migrations manually

### Communication
- [ ] Notify team of rollback
- [ ] Update status page if applicable
- [ ] Post-mortem within 24 hours

## Launch Day Checklist

### Before Launch
- [ ] All team members on standby
- [ ] Monitoring dashboards open
- [ ] Rollback plan reviewed
- [ ] Communication channels ready

### At Launch
- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Monitor error rates for 30 min
- [ ] Monitor performance metrics

### Post-Launch (First 24h)
- [ ] Monitor error rates hourly
- [ ] Check user feedback channels
- [ ] Verify conversion funnels
- [ ] Review performance metrics

## Emergency Contacts

- **Primary**: Ljemicus (Discord)
- **Technical Lead**: [TBD]
- **Hosting**: Vercel Support
- **Database**: Supabase Support
- **Payments**: Stripe Support
