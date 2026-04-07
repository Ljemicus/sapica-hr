# Rollback Plan - PetPark Production

## Overview
This document outlines the procedures for rolling back PetPark to a previous stable version in case of critical issues after deployment.

## Rollback Triggers

### Immediate Rollback (Critical Issues):
- ✅ **Security vulnerability** discovered
- ✅ **Data corruption** or loss
- ✅ **Complete service outage** (> 15 minutes)
- ✅ **Payment processing failure**
- ✅ **Authentication system failure**

### Consider Rollback (Major Issues):
- ⚠️ **Performance degradation** > 50% from baseline
- ⚠️ **Key functionality broken** (booking, search, listings)
- ⚠️ **Multiple user reports** of same critical issue
- ⚠️ **Third-party service dependency** failure

### Monitor & Fix (Minor Issues):
- 🔄 **Cosmetic issues** (UI bugs, styling)
- 🔄 **Non-critical functionality** issues
- 🔄 **Performance issues** affecting < 10% of users
- 🔄 **Third-party service** partial degradation

## Rollback Decision Matrix

| Issue Severity | Impact | Response Time | Action |
|----------------|--------|---------------|--------|
| P0 - Critical | System down, data loss, security breach | < 15 min | Immediate rollback |
| P1 - High | Core functionality broken, payments failing | < 1 hour | Rollback if fix > 2 hours |
| P2 - Medium | Partial functionality affected | < 4 hours | Hotfix preferred |
| P3 - Low | Cosmetic/minor issues | < 24 hours | Schedule fix |

## Rollback Procedures

### 1. Pre-Rollback Preparation

#### Communication:
```bash
# 1. Notify team via Slack
/send "#petpark-alerts 🚨 Initiating rollback due to: [ISSUE]"

# 2. Update status page (if available)
echo "🔄 Maintenance: Rolling back to previous version" > status.md

# 3. Prepare user notification (if extended downtime)
Draft email/tweet: "We're temporarily rolling back to fix an issue..."
```

#### Verification:
- [ ] Identify which deployment caused the issue
- [ ] Check database backup status
- [ ] Confirm rollback target version is stable

### 2. Vercel Deployment Rollback

#### Via Vercel Dashboard:
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select PetPark project
3. Navigate to **Deployments**
4. Find the previous stable deployment
5. Click **"..."** → **"Promote to Production"**
6. Confirm the rollback

#### Via Vercel CLI:
```bash
# List deployments
vercel list

# Rollback to specific deployment
vercel rollback <deployment-id>

# Or rollback to previous
vercel rollback --prod
```

#### Expected Timeline:
- Deployment rollback: 2-5 minutes
- DNS propagation: 0-5 minutes (Vercel uses same URL)
- **Total estimated: < 10 minutes**

### 3. Database Rollback (If Needed)

#### Scenario A: Code-only issue (no data changes)
- No database rollback needed
- Just redeploy previous code version

#### Scenario B: Database migration caused issue
```sql
-- 1. Check if backup exists
-- (Supabase Dashboard → Database → Backups)

-- 2. If automatic backup available:
-- Restore from most recent pre-deployment backup

-- 3. If manual backup needed:
-- Run reverse migration scripts
```

#### Supabase Backup Restoration:
1. Go to Supabase Dashboard → Database → Backups
2. Select backup from before problematic deployment
3. Click **"Restore"** (creates new database)
4. Update connection strings if needed

**⚠️ Warning:** Database restoration may cause data loss of changes made after backup.

### 4. Environment Variables Rollback

If environment variables changed and caused issues:

#### Via Vercel Dashboard:
1. Settings → Environment Variables
2. Compare current vs previous deployment
3. Revert any changed variables
4. Redeploy if variables changed build output

#### Verification:
```bash
# Check env vars for specific deployment
vercel env ls --environment production

# Compare with previous
git diff HEAD~1 -- .env.prod
```

### 5. Post-Rollback Verification

#### Smoke Tests:
```bash
# 1. Homepage loads
curl -I https://petpark.hr

# 2. Key API endpoints
curl https://petpark.hr/api/health

# 3. Authentication
# Test login with test account

# 4. Payments (test mode)
# Attempt test booking
```

#### Monitoring:
- [ ] Error rate returns to baseline
- [ ] Performance metrics normalized
- [ ] User reports of issue stop
- [ ] Payment processing works

### 6. Communication & Follow-up

#### Internal:
```markdown
## Rollback Complete - [DATE/TIME]

**Issue:** [Brief description]
**Root Cause:** [If known]
**Action Taken:** Rolled back to deployment [ID]
**Duration:** [Start time] - [End time]
**Impact:** [Number of users affected, if known]

**Next Steps:**
1. [ ] Investigate root cause
2. [ ] Develop fix
3. [ ] Test fix thoroughly
4. [ ] Schedule re-deployment
```

#### External (if needed):
```markdown
## Service Update

We encountered an issue with our latest update and have rolled back to a stable version. 
Service has been restored.

We apologize for any inconvenience and are working to fix the issue.

- PetPark Team
```

## Rollback Scenarios

### Scenario 1: Broken Authentication
**Symptoms:** Users cannot log in, password reset fails
**Action:** Immediate rollback
**Procedure:** Vercel deployment rollback only (no DB changes likely)

### Scenario 2: Payment Processing Failure  
**Symptoms:** Stripe payments failing, error messages
**Action:** Immediate rollback
**Procedure:** 
1. Vercel rollback
2. Check Stripe webhook configuration
3. Verify environment variables

### Scenario 3: Performance Regression
**Symptoms:** Page load times 2x slower, high server load
**Action:** Rollback if fix > 2 hours
**Procedure:**
1. Identify performance bottleneck
2. If code-related, rollback
3. If infrastructure, scale resources

### Scenario 4: Data Corruption
**Symptoms:** Missing user data, incorrect calculations
**Action:** Immediate rollback + database restore
**Procedure:**
1. Vercel rollback
2. Restore database from backup
3. Investigate migration scripts

## Prevention Measures

### Pre-Deployment Checks:
```bash
# 1. Run test suite
npm test

# 2. Build verification
npm run build

# 3. Environment validation
node scripts/validate-env.js

# 4. Performance baseline
npm run lighthouse:baseline

# 5. Database migration dry-run
npm run db:migrate:dry-run
```

### Deployment Strategy:
- **Canary deployments:** Roll out to 10% of users first
- **Feature flags:** Disable problematic features without rollback
- **A/B testing infrastructure:** Compare new vs old version

### Monitoring & Alerting:
```yaml
Alerts:
  - Error rate > 5% for 5 minutes
  - Response time p95 > 3s for 10 minutes  
  - Payment failure rate > 2% for 15 minutes
  - Authentication failure rate > 10% for 5 minutes
```

## Tools & Resources

### Vercel:
- [Deployment History](https://vercel.com/docs/deployments/deployment-history)
- [Rollback Guide](https://vercel.com/docs/deployments/rollback)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

### Supabase:
- [Backups & Restores](https://supabase.com/docs/guides/database/backups)
- [Point-in-Time Recovery](https://supabase.com/docs/guides/database/pitr)

### Monitoring:
- **Sentry:** Error tracking
- **Google Analytics:** User behavior
- **Custom dashboards:** Business metrics

## Team Responsibilities

### On-Call Engineer:
- [ ] Execute rollback procedure
- [ ] Communicate with team
- [ ] Document incident

### Product Manager:
- [ ] User communication
- [ ] Business impact assessment
- [ ] Priority setting for fix

### DevOps/Infrastructure:
- [ ] Database operations
- [ ] Infrastructure verification
- [ ] Performance analysis

## Post-Rollback Analysis

### Required Documentation:
1. **Incident Report:** What happened, when, impact
2. **Root Cause Analysis:** Why it happened
3. **Timeline:** Detection → Decision → Action → Resolution
4. **Lessons Learned:** How to prevent recurrence

### Follow-up Actions:
- [ ] Fix the issue in development
- [ ] Add tests to catch similar issues
- [ ] Update deployment procedures
- [ ] Schedule re-deployment with fixes

---

## Quick Reference

### Emergency Contacts:
- **Technical Lead:** [Name/Contact]
- **Product Manager:** [Name/Contact]  
- **Vercel Support:** https://vercel.com/support
- **Stripe Support:** https://support.stripe.com
- **Supabase Support:** https://supabase.com/support

### One-Line Rollback:
```bash
# Most common rollback command
vercel rollback --prod --yes
```

### Status Page:
- **Operational:** https://status.petpark.hr
- **Updates:** #petpark-alerts Slack channel

---

*Document Version: 1.0*  
*Last Updated: 2026-04-07*  
*Next Review: After first production incident*