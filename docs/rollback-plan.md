# PetPark Rollback Plan

## Quick Rollback (< 2 minutes)

### Vercel Production Rollback
```bash
# List recent deployments
vercel list

# Rollback to previous version
vercel --prod --version <PREVIOUS_DEPLOYMENT_ID>

# Or use Vercel dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "Promote to Production"
```

### Database Rollback (if needed)
```bash
# If migration caused issues, restore from backup
# This requires a pre-deployment backup!

# Using Supabase CLI
supabase db restore <backup_id>

# Or manually revert specific migrations
supabase migration repair <timestamp> --status reverted
```

## Rollback Scenarios

### Scenario 1: Critical Error in New Deployment
**Symptoms**: Site down, 500 errors, critical functionality broken

**Actions**:
1. Immediately rollback Vercel deployment (~30 sec)
2. Notify team via Discord
3. Check Sentry for error details
4. Fix issue in staging
5. Redeploy when fixed

### Scenario 2: Database Migration Issue
**Symptoms**: API errors related to schema, missing columns

**Actions**:
1. Stop new deployments
2. Assess if rollback needed or hotfix possible
3. If rollback needed:
   - Restore database from backup
   - Rollback code deployment
4. If hotfix possible:
   - Create migration fix
   - Deploy hotfix

### Scenario 3: Performance Degradation
**Symptoms**: Slow page loads, high error rates

**Actions**:
1. Check Vercel Analytics for metrics
2. If related to new deployment:
   - Rollback deployment
   - Profile performance issue
3. If infrastructure issue:
   - Check Supabase status
   - Check Stripe status
   - Scale resources if needed

### Scenario 4: Security Incident
**Symptoms**: Unauthorized access, data exposure

**Actions**:
1. **IMMEDIATE**: Take site offline if needed
2. Rotate all exposed credentials
3. Assess scope of exposure
4. Notify affected users if required
5. Post-incident review

## Prevention Checklist

Before every deployment:
- [ ] Tests passing (`npm run test:ci`)
- [ ] TypeScript check passing (`npm run type-check`)
- [ ] Database backup created
- [ ] Staging deployment verified
- [ ] Rollback plan reviewed
- [ ] Team notified of deployment window

## Communication Templates

### Rollback Notification (Discord)
```
🚨 ROLLBACK INITIATED

Reason: [Brief description]
Time: [Timestamp]
Impact: [User impact]
ETA: [Expected resolution]

Incident lead: @username
```

### All Clear Notification
```
✅ ROLLBACK COMPLETE

Service restored to previous version.
Issue being investigated in staging.
No further action required.
```

## Post-Rollback Actions

1. **Document incident**:
   - What happened
   - When it was detected
   - Actions taken
   - Time to resolution

2. **Root cause analysis**:
   - Why wasn't it caught in staging?
   - What tests are missing?
   - Process improvements needed?

3. **Update runbooks**:
   - Add new failure mode
   - Update detection methods
   - Improve rollback procedures

## Emergency Contacts

| Role | Contact | Response Time |
|------|---------|---------------|
| Primary | Ljemicus (Discord) | 15 min |
| Vercel Support | support@vercel.com | 24h |
| Supabase Support | support@supabase.io | 24h |
| Stripe Support | support.stripe.com | 24h |

## Recovery Testing

Test rollback procedures monthly:
1. Deploy to staging
2. Simulate failure
3. Execute rollback
4. Verify service restored
5. Document time taken

## Decision Matrix

| Issue Severity | Rollback? | Notification |
|----------------|-----------|--------------|
| Site down | YES - Immediate | Discord + SMS |
| Core feature broken | YES - < 5 min | Discord |
| Minor bug | NO - Hotfix | Discord |
| Performance issue | MAYBE - Monitor | Discord |
| Security issue | YES - Immediate | All channels |
