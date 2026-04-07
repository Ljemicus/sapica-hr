# PetPark Production Launch Checklist

## Overview
Final verification checklist before launching PetPark to production. Complete all items before making the site publicly available.

## Legend
- ✅ = Complete
- ⚠️ = In Progress/Needs Review  
- ❌ = Not Started/Blocking
- 🔄 = Automated/Continuous

## 1. Environment Variables (🔧 CRITICAL)

### Required Variables:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - ✅ Set in .env.prod
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - ✅ Set in .env.prod  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - ❌ **BLOCKING** - Missing (required for cron jobs)
- [ ] `STRIPE_SECRET_KEY` - ✅ Set in .env.prod
- [ ] `STRIPE_PUBLISHABLE_KEY` - ❌ Missing from .env.prod
- [ ] `STRIPE_WEBHOOK_SECRET` - ✅ Set in .env.prod
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - ❌ Missing from .env.prod
- [ ] `RESEND_API_KEY` - ⚠️ Set as `resend_api_key` (variable name mismatch)
- [ ] `CRON_SECRET` - ✅ Set in .env.prod
- [ ] `SLACK_INCIDENTS_WEBHOOK` - ⚠️ Set as `SLACK_INCIDENT_WEBHOOK` (singular/plural mismatch)
- [ ] `SLACK_OPS_WEBHOOK` - ✅ Set in .env.prod

### Validation:
- [ ] Run validation script: `node scripts/validate-env.js`
- [ ] All variables set in Vercel Production environment
- [ ] No test/placeholder values in production

**Action Items:**
1. Get `SUPABASE_SERVICE_ROLE_KEY` from Supabase dashboard
2. Add missing Stripe publishable keys
3. Fix variable name mismatches (Resend, Slack)

## 2. Database & Migrations

### Supabase Setup:
- [ ] Production database migrated (Supabase → Dashboard → Database)
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Backup schedule configured (daily)
- [ ] Connection pooling configured

### Data Migration:
- [ ] Test data cleared from production
- [ ] Seed data loaded (breeds, services, etc.)
- [ ] User migration completed (if applicable)

### Verification:
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check backup status
-- (In Supabase Dashboard → Database → Backups)
```

## 3. Domain & SSL

### Domain Configuration:
- [ ] `petpark.hr` domain registered and configured
- [ ] DNS records set (A record: 76.76.21.21, CNAME: cname.vercel-dns.com)
- [ ] Domain added in Vercel Dashboard → Settings → Domains

### SSL Certificate:
- [ ] SSL certificate issued (automatic via Vercel)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] Certificate valid (not expired)

### Testing:
- [ ] `https://petpark.hr` loads correctly
- [ ] `https://www.petpark.hr` loads correctly
- [ ] SSL Labs grade A or A+
- [ ] Mixed content check passed

## 4. Analytics & Monitoring

### Google Analytics 4:
- [ ] GA4 property created
- [ ] Measurement ID obtained (`G-XXXXXXXXXX`)
- [ ] GA4 script integrated (`lib/analytics/ga4.ts`)
- [ ] Cookie consent banner implemented
- [ ] GDPR compliance verified

### Error Tracking:
- [ ] Sentry configured (optional but recommended)
- [ ] Error boundaries in React components
- [ ] Unhandled error tracking

### Performance Monitoring:
- [ ] Core Web Vitals tracking
- [ ] Page load time monitoring
- [ ] API response time monitoring

## 5. Security

### Headers & CSP:
- [ ] Security headers configured (next.config.ts) - ✅ Done
- [ ] Content Security Policy (CSP) tested - ⚠️ Needs GA/Cloudinary testing
- [ ] CORS properly configured - ⚠️ Verify Supabase origins

### Authentication:
- [ ] Password policy enforced
- [ ] Session timeout configured
- [ ] Brute force protection
- [ ] Email verification required

### Payment Security:
- [ ] Stripe webhook signature verification
- [ ] PCI compliance maintained
- [ ] No sensitive data in logs

### Regular Security Tasks:
- [ ] Dependency vulnerability scan (`npm audit`)
- [ ] Secret rotation schedule
- [ ] Access control review

## 6. Performance

### Build Optimization:
- [ ] Production build successful: `npm run build`
- [ ] Bundle size analysis passed
- [ ] Image optimization configured
- [ ] Code splitting implemented

### Runtime Performance:
- [ ] Lighthouse score > 90 (Performance)
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s  
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.5s

### Database Performance:
- [ ] Indexes on frequently queried columns
- [ ] Query optimization completed
- [ ] Connection pooling configured

## 7. Testing

### Automated Tests:
- [ ] Unit tests passing: `npm test`
- [ ] Integration tests passing
- [ ] E2E tests passing (Cypress/Playwright)

### Manual Testing:
- [ ] User registration flow
- [ ] Login/logout functionality
- [ ] Pet listing creation
- [ ] Booking/payment flow
- [ ] Search functionality
- [ ] Mobile responsiveness
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### Edge Cases:
- [ ] Network failure handling
- [ ] Form validation
- [ ] Error page (404, 500)
- [ ] Loading states
- [ ] Empty states

## 8. Content & SEO

### Content Review:
- [ ] All text proofread
- [ ] Images optimized and have alt text
- [ ] Links working (no 404s)
- [ ] Metadata complete (title, description, OG tags)

### SEO Configuration:
- [ ] XML sitemap generated (`/sitemap.xml`)
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] Structured data (JSON-LD) implemented

### Analytics Verification:
- [ ] Google Search Console property added
- [ ] Sitemap submitted to Search Console
- [ ] Analytics tracking verified

## 9. Third-Party Services

### Email (Resend):
- [ ] Transactional emails working (welcome, password reset)
- [ ] Email templates designed
- [ ] DKIM/SPF records configured (if using custom domain)

### Payments (Stripe):
- [ ] Live mode activated
- [ ] Webhook endpoints configured
- [ ] Payment methods tested (card)
- [ ] Refund process tested

### Hosting (Vercel):
- [ ] Production deployment successful
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active

## 10. Compliance & Legal

### GDPR/Privacy:
- [ ] Privacy policy page
- [ ] Cookie consent banner
- [ ] Data processing agreement (if needed)
- [ ] Right to erasure procedure

### Terms & Conditions:
- [ ] Terms of service page
- [ ] Acceptable use policy
- [ ] Refund/cancellation policy

### Accessibility:
- [ ] WCAG 2.1 AA compliance check
- [ ] Keyboard navigation tested
- [ ] Screen reader compatibility

## 11. Rollback Plan

### Preparedness:
- [ ] Database backup procedure documented
- [ ] Vercel deployment history accessible
- [ ] Rollback script/tested
- [ ] Communication plan for downtime

### Rollback Triggers:
- Critical security vulnerability
- Major functionality broken
- Performance degradation > 50%
- Data corruption/loss

### Rollback Steps:
1. Notify team/users of maintenance
2. Revert to previous Vercel deployment
3. Restore database from backup if needed
4. Verify functionality
5. Post-mortem analysis

## 12. Launch Day

### Pre-Launch (Day Before):
- [ ] Final backup of database
- [ ] Team notified of launch time
- [ ] Monitoring alerts configured
- [ ] Support channels prepared

### Launch Moment:
- [ ] DNS propagation checked
- [ ] Final smoke test
- [ ] Analytics verified
- [ ] Announcement scheduled

### Post-Launch (First 24h):
- [ ] Monitor error rates
- [ ] Watch performance metrics
- [ ] Check payment processing
- [ ] Review user feedback

## 13. Documentation

### Internal:
- [ ] Runbook for common issues
- [ ] Deployment procedures
- [ ] Troubleshooting guide
- [ ] Contact list for emergencies

### External:
- [ ] User documentation/help center
- [ ] API documentation (if public)
- [ ] FAQ page

## Validation Scripts

Run these scripts before final launch:

```bash
# 1. Environment validation
node scripts/validate-env.js

# 2. Build test
npm run build

# 3. Security headers check
curl -I https://petpark.hr | grep -i "x-"

# 4. SSL check
openssl s_client -connect petpark.hr:443 -servername petpark.hr 2>/dev/null | openssl x509 -noout -dates

# 5. Performance audit
npm run lighthouse -- https://petpark.hr
```

## Emergency Contacts

- **Technical Issues**: [Team Slack Channel]
- **Payment Issues**: Stripe Support
- **Domain/DNS**: Domain Registrar Support
- **Hosting**: Vercel Support

---

## Completion Status

**Overall Readiness:** ⚠️ **NOT READY FOR LAUNCH**

### Critical Blockers:
1. ❌ `SUPABASE_SERVICE_ROLE_KEY` missing - cron jobs will fail
2. ❌ Stripe publishable keys missing - payments may not work
3. ⚠️ Variable name mismatches need fixing

### High Priority:
1. ⚠️ Domain configuration (`petpark.hr`)
2. ⚠️ SSL certificate setup
3. ⚠️ Final testing of all user flows

### Recommended:
1. ⚠️ GA4 analytics setup
2. ⚠️ Sentry error tracking
3. ⚠️ Performance optimization

---

*Checklist Version: 1.0*  
*Last Updated: 2026-04-07*  
*Next Review: Before launch*