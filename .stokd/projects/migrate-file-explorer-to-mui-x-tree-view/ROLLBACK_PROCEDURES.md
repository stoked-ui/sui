# Rollback Procedures - FileExplorer Migration

**Project:** #8 - Migrate FileExplorer to MUI X RichTreeView
**Work Item:** 4.5 - Rollout Validation and Monitoring
**Version:** 1.0.0
**Date:** 2026-01-19

---

## Table of Contents

1. [Overview](#overview)
2. [Rollback Types](#rollback-types)
3. [Emergency Rollback](#emergency-rollback)
4. [Planned Rollback](#planned-rollback)
5. [Partial Rollback](#partial-rollback)
6. [Rollback Validation](#rollback-validation)
7. [Communication Plan](#communication-plan)
8. [Post-Rollback Actions](#post-rollback-actions)

---

## Overview

### Purpose

This document provides step-by-step procedures for rolling back the FileExplorer migration to MUI X RichTreeView. It covers emergency, planned, and partial rollback scenarios.

### Rollback Capability

The feature flag system enables **instant rollback without code deployment**:

- **Feature flags** can be disabled in <5 minutes
- **Users automatically** switch to legacy implementation
- **Zero downtime** rollback process
- **Gradual rollback** option available

### When to Rollback

**Immediate Emergency Rollback:**
- P0 bug (app crash, data loss, security)
- Error rate >1%
- Complete feature breakdown
- Stakeholder directive

**Planned Rollback:**
- Sustained high error rate (>0.5% for 1+ hour)
- Performance regression >15%
- Multiple P1 bugs accumulating
- User satisfaction declining

**Partial Rollback:**
- Single feature problematic
- Specific user cohort affected
- Plugin conflict
- Isolated performance issue

---

## Rollback Types

### Quick Reference

| Type | Trigger | Time | Scope | Approval |
|------|---------|------|-------|----------|
| **Emergency** | P0 bug, >1% errors | <5 min | Full | On-call |
| **Planned** | Degradation, >0.5% errors | <1 hour | Full | Tech Lead |
| **Partial** | Single feature issue | <30 min | Feature | On-call |

---

## Emergency Rollback

### Triggers

Execute emergency rollback immediately if:

1. **P0 Critical Bug:**
   - Application crashes for all users
   - Data loss or corruption
   - Security vulnerability
   - Authentication/authorization failure

2. **Extreme Error Rate:**
   - Error rate >1% of sessions
   - 100+ errors in 5 minutes
   - Sustained errors for 5+ minutes

3. **Complete Feature Breakdown:**
   - FileExplorer not rendering
   - All drag-and-drop broken
   - Complete UI failure

4. **Security Incident:**
   - XSS vulnerability discovered
   - Data exposure risk
   - Authentication bypass

### Procedure (< 5 minutes)

#### Step 1: Disable Feature Flags (Immediate)

**Option A: API Call (Recommended)**

```bash
# Emergency kill switch for all flags
curl -X POST https://api.stoked-ui.com/feature-flags/emergency-disable-all \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "P0 bug: Application crash in FileExplorer",
    "bugId": "BUG-1234",
    "disabledBy": "oncall-engineer-name",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'
```

**Option B: Admin Dashboard**

```
1. Navigate to: https://admin.stoked-ui.com/feature-flags
2. Click "EMERGENCY DISABLE ALL" button
3. Enter reason: "P0 bug: [description]"
4. Confirm action
5. Verify all flags show "DISABLED"
```

**Option C: Direct Database (Last Resort)**

```sql
-- Connect to production database
UPDATE feature_flags
SET enabled = false,
    emergency_disabled = true,
    emergency_reason = 'P0 bug: Application crash',
    updated_at = NOW()
WHERE flag_name LIKE 'fileExplorer_%';

-- Verify
SELECT flag_name, enabled, emergency_disabled
FROM feature_flags
WHERE flag_name LIKE 'fileExplorer_%';
```

**Expected Result:**
```
Flag: useMuiXRendering    Status: DISABLED  Traffic: 0%
Flag: dndInternal         Status: DISABLED  Traffic: 0%
Flag: dndExternal         Status: DISABLED  Traffic: 0%
Flag: dndTrash            Status: DISABLED  Traffic: 0%
```

**Time Target:** <2 minutes

---

#### Step 2: Verify Rollback (Immediate)

**Check 1: Monitoring Dashboard**

```
1. Open: https://monitoring.stoked-ui.com/rollout-status
2. Verify:
   - All feature flags show: DISABLED (🔴)
   - Traffic distribution: 0% New, 100% Legacy
   - Error rate: Declining
```

**Check 2: Test User Sessions**

```bash
# Test in incognito/private browser
1. Open application
2. Navigate to FileExplorer
3. Verify: Legacy rendering (no MUI X components)
4. Test: Basic file operations work
```

**Check 3: Error Rate**

```bash
# Query error tracking service
curl -X GET https://api.stoked-ui.com/metrics/error-rate?last=5m \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: Error rate declining
# Before: 1.2%
# After 2min: 0.4%
# After 5min: 0.1%
```

**Time Target:** <3 minutes (total: 5 minutes from trigger)

---

#### Step 3: Communicate (Immediate)

**Slack Notification (Auto-triggered):**

```
🚨 EMERGENCY ROLLBACK EXECUTED 🚨

Project: FileExplorer Migration
Action: All feature flags DISABLED
Time: 2026-01-19 14:35:00 UTC
Reason: P0 bug - Application crash
Bug ID: BUG-1234
By: oncall-engineer-name

Status:
✅ All flags disabled
✅ Users on legacy implementation
✅ Error rate declining

Dashboard: https://monitoring.stoked-ui.com/rollout-status
Incident: [Create Incident] (auto-created)
```

**Manual Communication:**

1. **#incidents Channel:**
   ```
   @here Emergency rollback of FileExplorer migration completed.
   Reason: [brief description]
   Status: All users on legacy, error rate declining
   Incident: INC-5678
   ```

2. **Email to Stakeholders:**
   ```
   Subject: [P0] Emergency Rollback - FileExplorer Migration

   An emergency rollback was executed at 14:35 UTC due to [reason].

   Actions Taken:
   - All feature flags disabled
   - Users automatically switched to legacy
   - Error rate declining from 1.2% to 0.1%

   Next Steps:
   - Root cause analysis in progress
   - Fix estimated: [TBD]
   - Re-deployment plan: [TBD]

   Current Status: STABLE
   ```

3. **Status Page (if applicable):**
   ```
   Investigating - We're investigating reports of issues with the file
   management feature. A fix has been applied and we're monitoring.
   ```

**Time Target:** <5 minutes (concurrent with Step 2)

---

### Post-Emergency Actions (< 30 minutes)

#### Step 4: Root Cause Analysis

**Immediate Investigation:**

```bash
# Collect logs from last 30 minutes
./scripts/collect-logs.sh --component=file-explorer --last=30m

# Analyze error patterns
./scripts/analyze-errors.sh --severity=P0 --last=30m

# Identify triggering event
./scripts/find-trigger.sh --timestamp=2026-01-19T14:30:00Z
```

**Key Questions:**
1. What was the error message?
2. Which users were affected?
3. When did it start?
4. What changed recently?
5. Can we reproduce it?

**Document Findings:**
- Error stack traces
- Affected user count
- Timeline of events
- Related code changes
- Hypothesized root cause

---

#### Step 5: Create Incident Report

**Incident Template:**

```markdown
# Incident Report: INC-5678

## Summary
Emergency rollback of FileExplorer migration due to P0 application crash.

## Timeline
- 14:30 UTC: First error reported
- 14:32 UTC: Error rate elevated to 1.2%
- 14:33 UTC: P0 bug confirmed
- 14:35 UTC: Emergency rollback executed
- 14:37 UTC: Rollback verified
- 14:40 UTC: Error rate normalized to 0.1%

## Impact
- Duration: 10 minutes
- Affected Users: ~500 users (5% of active users)
- Error Rate: 1.2% peak
- Data Loss: None
- Revenue Impact: None

## Root Cause
[To be determined - investigation in progress]

Preliminary findings:
- TypeError in FileExplorer.render()
- Null reference when accessing item.children
- Triggered by specific file tree structure

## Resolution
Emergency rollback to legacy implementation via feature flag disable.

## Action Items
1. [ ] Fix null reference bug (assigned: engineer-name)
2. [ ] Add null checks in render logic
3. [ ] Add test case for edge case
4. [ ] Re-deploy with fix
5. [ ] Post-mortem meeting (scheduled: tomorrow)

## Lessons Learned
[To be added after post-mortem]
```

---

#### Step 6: Plan Fix and Re-deployment

**Fix Planning:**

1. **Prioritize Fix:**
   - Assign engineer
   - Estimate timeline
   - Block other work if needed

2. **Testing Plan:**
   - Reproduce bug in staging
   - Verify fix resolves issue
   - Regression testing
   - Performance validation

3. **Re-deployment Strategy:**
   - Start at lower traffic (5%)
   - Extended monitoring (24 hours)
   - Gradual increase (5% → 10% → 25%)
   - Approval gates at each step

**Example Timeline:**
```
Day 0 (Today):    Emergency rollback, investigation
Day 1:            Fix developed, tested in staging
Day 2:            Re-deploy at 5%, monitor 24h
Day 3:            Increase to 10%, monitor 24h
Day 4:            Increase to 25%, monitor 48h
Day 6:            Resume gradual rollout if stable
```

---

## Planned Rollback

### Triggers

Execute planned rollback if:

1. **Sustained High Error Rate:**
   - Error rate >0.5% for 1+ hour
   - Error rate >0.3% for 4+ hours
   - Upward error trend over 24 hours

2. **Performance Degradation:**
   - P95 render time >550ms for 1+ hour
   - Performance regression >15% sustained
   - Memory leak detected

3. **Multiple P1 Bugs:**
   - 5+ P1 bugs within 1 week
   - 3+ P1 bugs unresolved after 48 hours
   - Bug rate increasing

4. **User Satisfaction Declining:**
   - Satisfaction score <3.5 for 48+ hours
   - Support ticket spike (>15 per week)
   - User complaints increasing

### Procedure (< 1 hour)

#### Step 1: Assessment (15 minutes)

**Gather Data:**

```bash
# Performance metrics
./scripts/get-performance-metrics.sh --last=24h

# Error analysis
./scripts/analyze-errors.sh --last=24h --group-by=type

# User feedback
./scripts/get-user-feedback.sh --last=7d --threshold=3.5

# Support tickets
./scripts/get-support-tickets.sh --status=open --priority=P1,P2
```

**Analysis:**
- [ ] Error rate trend (increasing/stable/decreasing)
- [ ] Performance metrics vs targets
- [ ] Open bug count and severity
- [ ] User satisfaction trend
- [ ] Support ticket volume

**Decision Matrix:**

| Metric | Threshold | Current | Action |
|--------|-----------|---------|--------|
| Error rate | >0.5% (1h) | 0.6% | ROLLBACK |
| P95 render | >550ms (1h) | 520ms | MONITOR |
| P1 bugs | >5 (1w) | 3 | MONITOR |
| Satisfaction | <3.5 (48h) | 3.8 | MONITOR |

**Decision:** ROLLBACK if 2+ metrics exceed threshold

---

#### Step 2: Approval (15 minutes)

**Required Approvals:**

1. **Engineering Lead:**
   - Reviews metrics
   - Confirms technical justification
   - Approves rollback

2. **Product Manager:**
   - Reviews user impact
   - Confirms business justification
   - Approves rollback

3. **On-call Engineer:**
   - Confirms operational readiness
   - Prepared to execute

**Approval Channel:**
```
Slack: #rollback-approvals

@eng-lead @product-manager
Requesting approval for planned rollback of FileExplorer migration.

Reason: Sustained error rate >0.5% for 2 hours
Current Metrics:
- Error rate: 0.6% (target: <0.1%)
- P95 render: 520ms (target: <500ms)
- Open P1 bugs: 3

Proposed Action: Gradual rollback over 30 minutes
75% → 50% → 25% → 0%

Approve? [Yes] [No] [Discuss]
```

---

#### Step 3: Gradual Rollback (30 minutes)

**Incremental Reduction:**

**Phase 1: 75% → 50% (10 minutes)**

```bash
# Reduce traffic to 50%
curl -X POST https://api.stoked-ui.com/feature-flags/update \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "useMuiXRendering": { "enabled": true, "trafficPercentage": 50 },
    "dndInternal": { "enabled": true, "trafficPercentage": 50 },
    "dndExternal": { "enabled": true, "trafficPercentage": 50 },
    "dndTrash": { "enabled": true, "trafficPercentage": 50 }
  }'

# Verify
curl -X GET https://api.stoked-ui.com/feature-flags/status

# Monitor for 10 minutes
# Expected: Error rate should decrease
```

**Metrics to Watch:**
- Error rate (should drop by ~25%)
- Active sessions (should remain stable)
- User complaints (should stabilize)

**Go/No-Go:** If error rate drops below 0.3%, continue to Phase 2

---

**Phase 2: 50% → 25% (10 minutes)**

```bash
# Reduce traffic to 25%
curl -X POST https://api.stoked-ui.com/feature-flags/update \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "useMuiXRendering": { "enabled": true, "trafficPercentage": 25 },
    "dndInternal": { "enabled": true, "trafficPercentage": 25 },
    "dndExternal": { "enabled": true, "trafficPercentage": 25 },
    "dndTrash": { "enabled": true, "trafficPercentage": 25 }
  }'

# Monitor for 10 minutes
# Expected: Error rate should decrease further
```

**Metrics to Watch:**
- Error rate (should drop below 0.2%)
- Performance metrics (should improve)
- User experience (should stabilize)

**Go/No-Go:** If error rate drops below 0.15%, continue to Phase 3

---

**Phase 3: 25% → 0% (10 minutes)**

```bash
# Full rollback - disable all flags
curl -X POST https://api.stoked-ui.com/feature-flags/update \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "useMuiXRendering": { "enabled": false },
    "dndInternal": { "enabled": false },
    "dndExternal": { "enabled": false },
    "dndTrash": { "enabled": false }
  }'

# Verify complete rollback
curl -X GET https://api.stoked-ui.com/feature-flags/status

# Expected: All flags disabled, 0% traffic
```

**Final Verification:**
- Error rate returns to baseline (<0.1%)
- Performance metrics normalized
- All users on legacy implementation
- No new errors introduced

---

#### Step 4: Communicate (Concurrent)

**Stakeholder Updates:**

**15-minute update:**
```
Planned rollback in progress (Phase 1/3)
Traffic reduced to 50%
Error rate: 0.6% → 0.4% (decreasing)
Proceeding to Phase 2
```

**30-minute update:**
```
Planned rollback in progress (Phase 2/3)
Traffic reduced to 25%
Error rate: 0.4% → 0.2% (decreasing)
Proceeding to Phase 3 (final)
```

**60-minute update:**
```
Planned rollback COMPLETE
Traffic: 0% (all users on legacy)
Error rate: 0.08% (normalized)
Next steps: Root cause analysis and fix planning
```

---

## Partial Rollback

### When to Use

Partial rollback is appropriate when:

1. **Single Feature Issue:**
   - Trash feature broken, but DnD working
   - External drop failing, but internal DnD fine
   - Specific plugin conflict

2. **User Cohort Affected:**
   - Issue only in Safari browser
   - Problem for mobile users only
   - Specific geography affected

3. **Performance Issue:**
   - One feature causing slowdown
   - Isolated memory leak
   - Specific interaction slow

### Procedures

#### Option 1: Disable Specific Feature

**Example: Disable Trash Feature Only**

```bash
# Keep other features, disable trash
curl -X POST https://api.stoked-ui.com/feature-flags/update \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "useMuiXRendering": { "enabled": true, "trafficPercentage": 50 },
    "dndInternal": { "enabled": true, "trafficPercentage": 50 },
    "dndExternal": { "enabled": true, "trafficPercentage": 50 },
    "dndTrash": { "enabled": false, "emergencyDisabled": true }
  }'
```

**Result:**
- MUI X rendering: ✅ Enabled
- Internal DnD: ✅ Enabled
- External DnD: ✅ Enabled
- Trash: ❌ Disabled

**Use Case:** Trash feature has bugs, but other features stable

---

#### Option 2: Reduce Traffic Percentage

**Example: Reduce from 50% to 25%**

```bash
# Reduce exposure but keep feature enabled
curl -X POST https://api.stoked-ui.com/feature-flags/update \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "useMuiXRendering": { "enabled": true, "trafficPercentage": 25 }
  }'
```

**Result:**
- Fewer users exposed to potential issue
- Can monitor smaller cohort
- Easier to debug with smaller dataset

**Use Case:** Intermittent issue, want to reduce blast radius

---

#### Option 3: User Cohort Exclusion

**Example: Exclude Safari Users**

```typescript
// Custom rollback logic
function shouldShowFeature(userId: string): boolean {
  const userAgent = navigator.userAgent;

  // Disable for Safari due to rendering bug
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return false;
  }

  // Standard traffic percentage logic
  return hashUserId(userId) % 100 < trafficPercentage;
}
```

**Result:**
- Safari users: Legacy implementation
- Chrome/Firefox users: New implementation
- Targeted rollback for affected cohort

**Use Case:** Browser-specific bug

---

## Rollback Validation

### Validation Checklist

After any rollback, verify:

**Technical Validation:**
- [ ] Feature flag status correct (disabled/reduced)
- [ ] Traffic distribution accurate
- [ ] Error rate declining
- [ ] Performance metrics improving
- [ ] No errors in rollback process itself
- [ ] Monitoring confirms change

**User Validation:**
- [ ] Users automatically switched to legacy
- [ ] No user sessions interrupted
- [ ] File operations still working
- [ ] No data loss
- [ ] User feedback improving

**Operational Validation:**
- [ ] Alerts stopped firing
- [ ] On-call notified
- [ ] Incident created
- [ ] Stakeholders informed
- [ ] Post-mortem scheduled

### Success Criteria

**Rollback is successful when:**

1. **Error Rate Normalized:**
   - Returns to baseline (<0.1%) within 15 minutes
   - No new error patterns
   - Downward trend confirmed

2. **Performance Restored:**
   - P95 render time <500ms
   - P95 drag latency <50ms
   - Memory usage stable
   - FPS ≥55fps

3. **User Impact Minimized:**
   - No session interruptions
   - Features working correctly
   - No data loss
   - Support ticket rate stable

4. **System Stable:**
   - No cascading failures
   - All services healthy
   - Monitoring green
   - No additional alerts

### Rollback Failure

**If rollback doesn't resolve issue:**

1. **Immediate:**
   - Check if rollback actually applied
   - Verify legacy code is running
   - Look for other root causes

2. **Escalate:**
   - Notify engineering leadership
   - Assemble war room
   - Investigate alternative causes

3. **Consider:**
   - Complete service restart
   - Database rollback (if data corruption)
   - Hotfix deployment
   - Maintenance mode

---

## Communication Plan

### Stakeholder Matrix

| Stakeholder | Emergency | Planned | Partial |
|-------------|-----------|---------|---------|
| On-call Engineer | Immediate | 15 min | 15 min |
| Engineering Team | 5 min | 30 min | 1 hour |
| Product Manager | 10 min | 15 min | 1 hour |
| VP Engineering | 15 min | 1 hour | 4 hours |
| Customer Support | 15 min | 30 min | 2 hours |
| Users (if needed) | 30 min | N/A | N/A |

### Communication Templates

#### Emergency Rollback

**Slack (#incidents):**
```
🚨 EMERGENCY ROLLBACK - FileExplorer Migration

Time: 14:35 UTC
Reason: P0 bug - Application crash
Action: All feature flags DISABLED
Status: ✅ Complete - Error rate declining

Impact:
- Duration: 10 minutes
- Affected: ~500 users
- Resolution: Users on legacy, stable

Next Steps:
- Root cause analysis in progress
- Incident report: INC-5678
- Fix timeline: TBD

Dashboard: [link]
```

#### Planned Rollback

**Email to Stakeholders:**
```
Subject: Planned Rollback - FileExplorer Migration

Team,

We are executing a planned rollback of the FileExplorer migration due to
sustained elevated error rates.

Details:
- Current error rate: 0.6% (target: <0.1%)
- Duration of issue: 2 hours
- Rollback approach: Gradual (75% → 50% → 25% → 0%)
- Timeline: 30 minutes

Current Status: In Progress (Phase 2/3)
Expected Completion: 15:30 UTC

We will provide updates every 15 minutes until complete.

Next Steps:
- Complete rollback
- Root cause analysis
- Fix development
- Re-deployment planning

Dashboard: [link]
Incident: INC-5679
```

#### Partial Rollback

**Slack (#engineering):**
```
Partial rollback: Trash feature disabled

Reason: High error rate in trash operations (0.8%)
Action: dndTrash flag DISABLED
Impact: Trash feature unavailable, other features working
Status: ✅ Complete

Other features unaffected:
✅ MUI X rendering
✅ Internal drag-and-drop
✅ External drag-and-drop

Investigation ongoing. ETA for fix: 24 hours
```

---

## Post-Rollback Actions

### Immediate (< 1 hour)

1. **Verify Stability:**
   - Monitor metrics for 1 hour
   - Confirm error rate baseline
   - Validate performance normalized
   - Check user feedback

2. **Create Incident Report:**
   - Timeline of events
   - Root cause (preliminary)
   - Impact assessment
   - Resolution steps

3. **Notify Stakeholders:**
   - Rollback complete
   - System stable
   - Next steps outlined

### Short-term (< 24 hours)

1. **Root Cause Analysis:**
   - Deep dive into logs
   - Reproduce issue
   - Identify exact cause
   - Document findings

2. **Fix Development:**
   - Assign engineer
   - Develop fix
   - Write tests
   - Code review

3. **Testing:**
   - Test fix in staging
   - Regression testing
   - Performance validation
   - User acceptance testing

### Medium-term (< 1 week)

1. **Re-deployment Planning:**
   - Updated rollout plan
   - Risk mitigation
   - Monitoring enhancements
   - Communication plan

2. **Post-mortem Meeting:**
   - Review incident
   - Lessons learned
   - Process improvements
   - Action items

3. **Documentation Updates:**
   - Update runbooks
   - Enhance monitoring
   - Improve alerts
   - Training materials

---

## Runbook Quick Reference

### Emergency Rollback (< 5 min)

```bash
# 1. Disable all flags
curl -X POST https://api.stoked-ui.com/feature-flags/emergency-disable-all \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"reason": "P0 bug: [description]"}'

# 2. Verify
curl -X GET https://api.stoked-ui.com/feature-flags/status

# 3. Check error rate
curl -X GET https://api.stoked-ui.com/metrics/error-rate?last=5m

# 4. Notify
./scripts/notify-rollback.sh --type=emergency --reason="[description]"
```

### Planned Rollback (< 1 hour)

```bash
# Phase 1: 75% → 50%
./scripts/rollback.sh --traffic=50 --reason="[description]"
sleep 600  # Wait 10 minutes

# Phase 2: 50% → 25%
./scripts/rollback.sh --traffic=25
sleep 600  # Wait 10 minutes

# Phase 3: 25% → 0%
./scripts/rollback.sh --traffic=0
```

### Partial Rollback

```bash
# Disable specific feature
./scripts/rollback.sh --feature=dndTrash --disable

# Reduce traffic
./scripts/rollback.sh --traffic=25 --keep-features
```

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-19
**Status:** Ready for Use
