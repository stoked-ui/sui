# Rollback Procedure: MUI X File Explorer Migration

## Overview

This document provides comprehensive procedures for rolling back the MUI X File Explorer implementation to the original implementation at any point during the rollout. Rollback procedures are organized by phase and by trigger type.

**Key Principle:** Rollback is a **controlled operational procedure**, not an emergency panic button. While some triggers require immediate action, all rollbacks follow a structured process to ensure data integrity and clear communication.

---

## Rollback Triggers & Decision Tree

### Trigger Classification

#### Immediate Rollback Required (≤15 minutes)
- P0 severity issue affecting core functionality
- Error rate spike >5% from baseline
- P95 render time >baseline + 20%
- Emergency security issue discovered
- Data loss or data corruption

#### Urgent Rollback (≤1 hour)
- Multiple P1 bugs (≥3 in 24 hours)
- Significant performance regression (10-20%)
- Accessibility violations discovered
- User escalations >5% of active users

#### Standard Rollback (≤4 hours)
- Single P1 bug requiring investigation
- Minor performance issues needing optimization
- Feature regression affecting specific cohort

### Decision Matrix

```
Is this a P0 issue affecting core functionality?
├─ YES → IMMEDIATE ROLLBACK (Section 3.1)
└─ NO  → Continue

Is error rate spike >5% from baseline?
├─ YES → IMMEDIATE ROLLBACK (Section 3.1)
└─ NO  → Continue

Is P95 render time >baseline + 20%?
├─ YES → IMMEDIATE ROLLBACK (Section 3.1)
└─ NO  → Continue

Are there ≥3 P1 issues in 24 hours?
├─ YES → URGENT ROLLBACK (Section 3.2)
└─ NO  → Continue

Is performance regression 10-20%?
├─ YES → URGENT ROLLBACK (Section 3.2)
└─ NO  → Continue

Is this a single P1 bug or minor issue?
├─ YES → STANDARD ROLLBACK (Section 3.3)
└─ NO  → Escalate for decision
```

---

## Pre-Rollback Checklist

Before executing ANY rollback, complete this checklist:

- [ ] Verify the trigger condition independently (not just from alerts)
- [ ] Check if issue is user-segment specific or environment-wide
- [ ] Confirm that rollback is the right action (not a configuration fix)
- [ ] Document the trigger condition and initial observations
- [ ] Notify on-call engineer (if not already involved)
- [ ] Notify engineering lead for final approval (except immediate rollback)
- [ ] Prepare incident communication template
- [ ] Ensure monitoring dashboards are open and accessible

---

## Section 1: Immediate Rollback Procedure (P0/Critical Issues)

### 1.1 P0 Issue or Data Corruption Rollback

**When to use:** Data loss, security breach, core functionality failure, >5% error rate spike

**Estimated Duration:** 5-15 minutes total (including validation)

### Step 1: Initiate Rollback (2-3 minutes)

**Who:** On-call engineer or engineering lead (no approval needed)

1. Access feature flag configuration system
2. Set feature flag parameters:
   ```
   {
     "enabled": false,
     "trafficPercentage": 0,
     "phase": "rolled-back",
     "emergencyDisabled": true,
     "notes": "IMMEDIATE ROLLBACK: [Reason] - Issue started at [HH:MM:SS UTC]"
   }
   ```
3. **DO NOT ADD** to deployment queue - deploy immediately
4. Verify deployment completed successfully
5. Record rollback initiation time

**Command example:**
```bash
# Update configuration file directly
cat > feature-flag-config.ts << 'EOF'
export const FEATURE_FLAG_CONFIG = {
  production: {
    enabled: false,
    trafficPercentage: 0,
    phase: 'rolled-back',
    emergencyDisabled: true,
    notes: 'IMMEDIATE ROLLBACK: P0 issue - [description]'
  }
};
EOF

# Deploy to production
npm run deploy:config -- --env production --immediate
```

### Step 2: Validate Rollback (2-3 minutes)

1. Verify original FileExplorer component is serving 100% of users
2. Check error rate is decreasing (should stabilize within 5 minutes)
3. Confirm P95 render time returns to baseline
4. Test FileExplorer functionality manually:
   - Can open/close file explorer
   - Can expand/collapse files
   - Can select files
   - Can perform drag & drop
   - No console errors appearing

### Step 3: Notify Stakeholders (1-2 minutes)

Send notifications through ALL channels simultaneously:

**Slack Notification:**
```
:red_alert: ROLLBACK INITIATED

Component: MUI X File Explorer Migration
Status: ROLLED BACK to original implementation
Traffic Exposure: 100% → 0% (reverted)
Reason: [P0 Issue Description]
User Impact: All users now using original FileExplorer
Time Started: [HH:MM:SS UTC]
Engineer: [Your Name]

Actions:
1. Monitoring for stability - check dashboard
2. Root cause analysis in progress
3. Team meeting scheduled in 30 minutes
```

**Email Notification:**
- To: Engineering team, Product team, Support team
- Subject: URGENT - File Explorer Migration Rolled Back
- Include: Issue description, timestamp, expected resolution timeline

**PagerDuty Incident:**
- Create high-priority incident
- Assign to on-call engineer
- Link to dashboard and this runbook

### Step 4: Begin Root Cause Analysis (Ongoing)

**In parallel with monitoring:**
1. Collect all relevant logs for the timeframe
2. Review monitoring dashboard for error patterns
3. Check for any recent code changes
4. Document exact error conditions
5. Identify specific user affected

---

## Section 2: Urgent Rollback Procedure (P1 Issues/Significant Regression)

### 2.1 Multiple P1 Bugs or Significant Performance Regression

**When to use:** 3+ P1 bugs in 24 hours, 10-20% performance regression, accessibility failures

**Estimated Duration:** 20-45 minutes (including engineering discussion)

### Step 1: Engineering Assessment (5-10 minutes)

**Who:** On-call engineer + Engineering lead

1. Convene quick assessment meeting (5-10 min)
2. Review affected users and severity
3. Evaluate alternatives:
   - Can this be fixed quickly in production?
   - Is rollback necessary or can we address root cause?
   - How many users are affected?
4. Make go/no-go decision for rollback

### Step 2: Prepare Rollback (5-10 minutes)

1. If approved, prepare rollback command
2. Set feature flag configuration:
   ```
   {
     "enabled": false,
     "trafficPercentage": 0,
     "phase": "rolled-back",
     "emergencyDisabled": false,
     "notes": "URGENT ROLLBACK: [Issue summary] - Rolled back for investigation and fix"
   }
   ```
3. Stage deployment (don't deploy yet)
4. Prepare validation checklist

### Step 3: Execute Rollback (2-3 minutes)

1. Get final approval from engineering lead
2. Deploy configuration immediately
3. Monitor error rates drop (should see improvement within 2-3 minutes)
4. Verify original FileExplorer serving 100%

### Step 4: Notification (2-3 minutes)

**Slack (abbreviated):**
```
:warning: ROLLBACK - P1 Issues Detected

Component: MUI X File Explorer
Status: Rolled back to investigate
Reason: Multiple P1 issues / Performance regression
Impact: [Number] users affected
Analysis: In progress
ETA for resume: [Timeline if known]
```

**Email:** Summary to technical teams + brief description

### Step 5: Investigation & Fix (Ongoing)

1. Root cause analysis in staging environment
2. Implement and test fix
3. Return to Phase 1 when ready

---

## Section 3: Standard Rollback Procedure (P1/Minor Issues)

### 3.1 Single P1 Bug or Feature Regression

**When to use:** Single P1 issue, minor feature gaps, cohort-specific problems

**Estimated Duration:** 1-4 hours (assessment before deciding rollback)

### Step 1: Assessment (15-30 minutes)

**Who:** On-call engineer + Engineering lead

1. Evaluate the issue severity and scope
2. Determine if it's:
   - Cohort-specific → Can we disable flag for that cohort only?
   - Fixable quickly → Can we patch in production?
   - Requires rollback → Need to revert to Phase 1
3. Document assessment findings

### Step 2: Decision Options

**Option A: Pause and Investigate (Preferred)**
- Reduce traffic to 0% temporarily while investigating
- Keep flag configuration with phase: "paused"
- Implement fix in parallel
- Re-enable when ready

**Option B: Full Rollback**
- Complete rollback to original implementation
- Fix in staging/dev environment
- Re-enter Phase 1 when ready

**Option C: Cohort Rollback** (if segment-specific)
- Identify affected user segment
- Revert flag for that segment only
- Continue rollout for unaffected users
- Requires sophisticated flag implementation

### Step 3: Execute Decision (Variable)

**For Option A (Pause):**
```
{
  "enabled": true,
  "trafficPercentage": 0,
  "phase": "paused",
  "emergencyDisabled": false,
  "notes": "PAUSED for investigation: [Issue description] - Will resume when fix validated"
}
```

**For Option B (Full Rollback):**
```
{
  "enabled": false,
  "trafficPercentage": 0,
  "phase": "rolled-back",
  "emergencyDisabled": false,
  "notes": "ROLLED BACK: [Issue description] - Returning to Phase 1 for fix validation"
}
```

### Step 4: Notification (1-2 minutes)

**Slack:**
```
:pause_button: PAUSE/ROLLBACK - P1 Issue

Component: MUI X File Explorer
Status: Paused for investigation
Issue: [Brief description]
Impact: [Scope of affected users]
Next Steps: Investigation and fix
Timeline: [Estimate for resolution]
```

**Email:** Technical leads only with issue details

---

## Section 4: Phase-Specific Rollback Procedures

### 4.1 Rollback from Phase 1 (Internal - Dev/Staging)

**Timeline:** No user impact - can rollback instantly

1. Disable flag in staging: `staging.enabled = false`
2. Redeploy configuration
3. Verify original FileExplorer showing in staging
4. Fix issue in dev environment
5. Re-enter Phase 1 with another validation round

**Communication:** Internal team message only (no public impact)

### 4.2 Rollback from Phase 2 (Beta - 5-10% Production)

**Timeline:** Affects 500-1000 users (adjust for your user base)

**Procedure:**
1. Execute immediate rollback procedure (Section 1 or 2)
2. Rollback configuration:
   ```
   production.enabled = false
   production.trafficPercentage = 0
   ```
3. Validate: Original FileExplorer serving 100%
4. Notify support: Be prepared for user questions
5. Root cause analysis:
   - Why wasn't this caught in Phase 1?
   - What testing gaps existed?
   - What improvements needed?
6. Implement fix and return to Phase 1 with enhanced testing

**User Communication:** "FileExplorer infrastructure update - rolled back for optimization"

### 4.3 Rollback from Phase 3 (Canary - 25% Production)

**Timeline:** Affects 2500-5000 users

**Procedure:**
1. Execute urgent rollback procedure (Section 2)
2. Consider intermediate steps:
   - Option A: Reduce to 10% traffic for investigation
   - Option B: Full rollback to 0%
3. If reducing traffic first:
   - Monitor for 30 minutes at 10%
   - If issue continues, complete rollback
   - If issue resolves, investigate user segment
4. If full rollback needed:
   - Deploy configuration immediately
   - Validate error rates dropping
5. Post-mortem:
   - Why wasn't this caught at 5-10%?
   - What additional monitoring needed?
   - User segment analysis needed

**User Communication:** "FileExplorer optimization update - rolling back for additional validation"

### 4.4 Rollback from Phase 4 (Gradual - 50% Production)

**Timeline:** Affects 5000-10000 users

**Procedure:**
1. Execute urgent rollback procedure (Section 2)
2. Step-down approach:
   - Option A: Reduce to 25% first, investigate
   - Option B: Reduce to 10%, investigate further
   - Option C: Full rollback to 0%
3. Recommended: Step-down unless P0 issue
   - Allows for monitoring at each step
   - May isolate issue to specific user segment
4. Full analysis:
   - Quality assurance process review
   - Testing gaps identified
   - Risk mitigation for future rollouts

**User Communication:** "FileExplorer performance optimization - brief rollback while we improve"

### 4.5 Rollback from Phase 5 (Full - 100% Production)

**Timeline:** Affects ALL users - highest priority

**Procedure:**
1. Execute immediate rollback procedure (Section 1)
2. Deploy configuration to set enabled=false and trafficPercentage=0
3. Verify ALL users see original FileExplorer within 5 minutes
4. Broadcast incident notification immediately
5. Critical post-mortem:
   - How did this get to 100%?
   - What monitoring alerts missed?
   - What testing was insufficient?
   - What process changes needed?

**User Communication:**
```
Incident Alert: File Explorer Optimization
We've temporarily reverted an optimization to the file explorer
while we investigate and improve stability. Service is fully
restored. We apologize for any disruption.
```

---

## Section 5: Rollback Validation Checklist

### Immediate Validation (After Rollback Deployment)

- [ ] Feature flag configuration deployed successfully
- [ ] Monitoring dashboards show traffic shifting to original (100%)
- [ ] Error rate decreasing (should see drop within 2-3 minutes)
- [ ] No new errors appearing in console
- [ ] P95 render time returning to baseline
- [ ] FileExplorer component functional in staging
- [ ] Manual test: Can open, expand, select, drag files

### Extended Validation (15-30 minutes after rollback)

- [ ] Error rate fully stabilized at baseline
- [ ] User engagement metrics normal
- [ ] Support ticket volume normal
- [ ] No continued user escalations about FileExplorer
- [ ] Monitoring alerts cleared/resolved
- [ ] Original FileExplorer serving 100% (verify in logs)

### Post-Rollback Validation (1-2 hours after rollback)

- [ ] All metrics stable for 1 hour minimum
- [ ] Team confirmed no ongoing issues
- [ ] Root cause analysis initiated
- [ ] Fix planned and assigned
- [ ] Timeline for re-entry to rollout established
- [ ] Stakeholders notified of timeline

---

## Section 6: Post-Rollback Process

### 6.1 Root Cause Analysis

**Timeline:** Begin immediately, complete within 4 hours

**Required outputs:**
1. **What happened:** Specific issue description
2. **Why it happened:** Root cause analysis
3. **When it started:** Exact timeline
4. **Who was affected:** User segment, count
5. **Why it wasn't caught earlier:** Testing/monitoring gap analysis
6. **Prevention:** What monitoring/testing additions needed

**Template:**
```markdown
# Incident Report: MUI X FileExplorer Rollback

## Summary
[One sentence description of issue]

## Timeline
- HH:MM:SS - Issue started
- HH:MM:SS - Issue detected
- HH:MM:SS - Rollback initiated
- HH:MM:SS - Rollback complete
- HH:MM:SS - Stability confirmed

## Root Cause
[Technical description of why issue occurred]

## Impact
- Users affected: [Number and percentage]
- Duration: [Minutes/hours]
- Feature impacted: [Which functionality]

## Why Not Caught Earlier
- Phase 1 testing gap: [What was missed]
- Monitoring gap: [What wasn't monitored]
- Staging vs production difference: [If applicable]

## Prevention
- Add monitoring rule: [Specific metric and threshold]
- Add testing: [Specific test case]
- Process change: [If applicable]

## Timeline to Re-rollout
- Fix implementation: [Date/time]
- Testing in staging: [Date/time]
- Phase 1 restart: [Date/time]
```

### 6.2 Process Improvements

Based on analysis, identify:

1. **Monitoring Improvements:**
   - New metrics to track
   - New alert thresholds
   - Gaps in dashboard coverage

2. **Testing Improvements:**
   - Test cases that should have caught this
   - New edge cases to cover
   - Load testing scenarios needed

3. **Rollout Process Improvements:**
   - Should phase durations be longer?
   - Should traffic percentages be smaller?
   - Additional validation gates needed?

4. **Communication Improvements:**
   - What could have been communicated better?
   - How can we improve alert clarity?

### 6.3 Fix Implementation

**In Staging Environment:**
1. Implement fix for identified root cause
2. Add specific test case for the issue
3. Run full test suite
4. Performance validation
5. Manual testing of fixed functionality

**Before Phase 1 Restart:**
1. Code review of fix
2. Staging validation sign-off
3. Enhanced monitoring deployment
4. Incident retrospective (optional)
5. Go/no-go decision for re-entry to Phase 1

---

## Section 7: Escalation Path

### Escalation Timeline

```
Immediate (0-15 minutes):
└─ On-call engineer → Execute rollback for P0 issues

Urgent (15-60 minutes):
├─ On-call engineer escalates to engineering lead
└─ Engineering lead approves rollback for P1/regression issues

Standard (1-4 hours):
├─ On-call engineer assesses
├─ Engineering lead decides on rollback vs fix
└─ Product team notified for user communication

Critical (Rollback from 100%):
├─ All hands alert
├─ CEO/leadership notification
└─ Public incident communication
```

### Escalation Contacts

**On-Call Engineer:**
- Primary responder for all triggers
- Can execute immediate rollback for P0 issues
- Responsible for validation

**Engineering Lead:**
- Approves urgent/standard rollbacks
- Makes strategic decisions
- Owns root cause analysis

**Product Manager:**
- Coordinates user communication
- Decides on public status updates
- Works with support on messaging

**VP Engineering (if rollback from 100%):**
- Immediate notification
- Executive decision-making
- Stakeholder communication

---

## Section 8: Preventing Rollbacks

### Best Practices

1. **Thorough Phase 1 Testing:**
   - Run all 8 plugins
   - Test edge cases
   - Performance validation
   - Don't rush Phase 1

2. **Extended Phase Durations:**
   - Phase 2: 3-5 days minimum (not rushing to canary)
   - Phase 3: Full 2-3 days (not jumping to gradual)
   - Each phase must pass full duration

3. **Granular Monitoring:**
   - Monitor BEFORE problems occur
   - Set alerts at early warning thresholds
   - Multiple independent alert mechanisms

4. **Staged Traffic Increases:**
   - 5% → 10% (not 0% → 10%)
   - 10% → 25% (not 5% → 25%)
   - 25% → 50% → 100%
   - Smaller steps = earlier detection

5. **Team Confidence Gates:**
   - Explicit team sign-off at each phase
   - Engineering lead must approve each transition
   - Product team must confirm no user impact

---

## Appendix A: Rollback Command Reference

### Quick Rollback Commands

**Emergency Rollback (P0):**
```bash
./scripts/rollback-feature-flag.sh \
  --environment production \
  --flag "use-mui-x-file-explorer" \
  --reason "P0_ISSUE: [description]" \
  --severity immediate
```

**Urgent Rollback (P1):**
```bash
./scripts/rollback-feature-flag.sh \
  --environment production \
  --flag "use-mui-x-file-explorer" \
  --reason "P1_ISSUES: [description]" \
  --severity urgent
```

**Standard Rollback (Investigation):**
```bash
./scripts/rollback-feature-flag.sh \
  --environment production \
  --flag "use-mui-x-file-explorer" \
  --reason "INVESTIGATION: [description]" \
  --severity standard
```

**Pause (Investigation Without Rollback):**
```bash
./scripts/pause-feature-flag.sh \
  --environment production \
  --flag "use-mui-x-file-explorer" \
  --reason "PAUSED: [description]"
```

### Validation Commands

**Check Current Status:**
```bash
./scripts/check-feature-flag.sh \
  --flag "use-mui-x-file-explorer" \
  --environment production
```

**Monitor Error Rates:**
```bash
./scripts/monitor-errors.sh \
  --component FileExplorer \
  --duration 10m
```

---

## Appendix B: Communication Templates

### Slack - Immediate Rollback
```
:red_alert: IMMEDIATE ROLLBACK - MUI X FILE EXPLORER

Issue: [P0 Issue Description]
Status: Rolled back to original FileExplorer
User Impact: All users now using original implementation
Timestamp: [HH:MM:SS UTC]
Engineer: @[Name]

Investigation starting immediately.
Dashboard: [Link]
Runbook: [Link]
```

### Slack - Urgent Rollback
```
:warning: URGENT ROLLBACK - MUI X FILE EXPLORER

Issue: [P1 Issue or Multiple Issues]
Status: Investigating, rolled back for safety
Impact: [Number] users affected
Analysis: In progress
Timeline: Investigation completing in [timeframe]

Will update in 30 minutes.
Dashboard: [Link]
```

### Email - Stakeholder Notification
```
Subject: File Explorer Migration - Rollback to Investigate Issues

Team,

We've temporarily rolled back the MUI X FileExplorer migration
to investigate and resolve issues identified during rollout testing.

What happened: [Brief description]
Impact: [Who/how many affected]
Timeline: [When caught, when rolled back]
Status: All users now using original FileExplorer - fully functional
Investigation: In progress, ETA for resolution [timeframe]

Next steps:
1. Root cause analysis (30-60 min)
2. Fix implementation (TBD)
3. Re-entry to Phase 1 (TBD)

Questions? Contact [Engineering Lead Name]
```

---

## Appendix C: Checklist Printable

**Print and keep on desk during rollout:**

### Pre-Rollout Checklist
- [ ] Trigger verified (not false alarm)
- [ ] Issue confirmed independently
- [ ] Monitoring dashboards open
- [ ] Notification templates ready
- [ ] Engineering lead aware

### Immediate Rollback Checklist
- [ ] Feature flag updated (enabled=false)
- [ ] Deployment initiated
- [ ] Rollback completion confirmed (5 min)
- [ ] Error rate verified dropping
- [ ] Manual FileExplorer test passed
- [ ] Slack notification sent
- [ ] Email notification sent
- [ ] Dashboard monitored (15 min window)

### Post-Rollback Checklist
- [ ] Stability confirmed (1 hour)
- [ ] Root cause analysis started
- [ ] Team meeting scheduled
- [ ] Fix timeline estimated
- [ ] Stakeholders notified
- [ ] Incident report template prepared
