# Incident Response Runbook: MUI X File Explorer Migration

## Quick Reference Card

Print and keep accessible during rollout phases 2-5.

### Critical Contacts
- **On-Call Engineer:** [Team Slack Channel] @on-call
- **Engineering Lead:** [Direct Slack]
- **Product Manager:** [Direct Slack]
- **VP Engineering:** [For escalation]

### Critical Links
- **Monitoring Dashboard:** [URL]
- **Feature Flag Config:** [Repository Path]
- **Rollback Procedure:** [This document]
- **Rollout Schedule:** [Schedule document]
- **Incident Response Channel:** [Slack Channel]

### Response Times
- **P0 Acknowledgement:** 5 minutes
- **P0 Resolution Start:** 15 minutes
- **P1 Acknowledgement:** 15 minutes
- **P1 Resolution Start:** 1 hour

---

## Section 1: Alert Received - First 5 Minutes

### 1.1 Alert Received Action

When you receive an alert for the FileExplorer migration:

**STEP 1: Acknowledge Receipt (30 seconds)**
```
1. Acknowledge in PagerDuty/Slack
2. Record exact time alert received
3. Note alert severity level
4. Post to incident response channel:
   "INCIDENT: [Alert Name] at [Time] - Investigating"
```

**STEP 2: Access Monitoring (1 minute)**
1. Open monitoring dashboard (bookmark in browser)
2. Locate the alert on dashboard
3. Review the specific metric that triggered alert
4. Check for related alerts (cascading failures?)

**STEP 3: Initial Assessment (2-3 minutes)**
```
Ask these questions:
1. Is this a real issue or false alarm?
   - Check metric behavior in last 5-10 minutes
   - Compare to baseline/previous phases

2. What is the severity?
   - How many users affected?
   - Is functionality impaired?
   - Are errors increasing?

3. Is rollback needed?
   - Can we investigate while users see it?
   - Should we pause traffic first?
```

**STEP 4: Communicate Initial Finding (4-5 minutes)**
```
Post to incident channel:
"Initial Assessment: [Description]
Severity: [P0/P1/P2]
Affected Users: [Estimate]
Next Action: [Investigate/Rollback/Monitor]
ETA for update: [Time + 5-10 minutes]"
```

---

## Section 2: P0/Critical Incident Response

### 2.1 When to Treat as P0

You have a P0 incident if ANY of these are true:

- [ ] Error rate spike >5% above baseline
- [ ] Core FileExplorer functionality failing (can't open/close)
- [ ] P95 render time >baseline + 20%
- [ ] Data loss or data corruption reported
- [ ] Security issue discovered
- [ ] Users unable to open editor files
- [ ] Drag & drop completely broken for >1% users
- [ ] User escalations indicating widespread impact

### 2.2 P0 Response Timeline

```
Minute 0: Alert arrives
Minute 1-2: Assess if real P0
Minute 3-5: Initiate rollback (if confirmed P0)
Minute 5-10: Rollback complete + validation
Minute 10: Team notification sent
Minute 15-20: Root cause analysis starts
Hour 1-2: Fix implemented and tested
Hour 2+: Re-entry to rollout planned
```

### 2.3 P0 Incident Steps

**STEP 1: Confirm P0 (2 minutes)**
```
1. Open monitoring dashboard
2. Verify alert metric independently
3. Check for multiple correlated alerts
4. Assess scope: % of users affected?
5. Confirm this is not a false alarm

Decision: Is this P0? (If unsure, treat as P0)
```

**STEP 2: Escalate (1 minute)**
```
1. If you are on-call engineer:
   - You have authority to execute rollback
   - Notify engineering lead via Slack

2. If you are not on-call:
   - Contact on-call engineer immediately
   - Send PagerDuty escalation
```

**STEP 3: Execute Rollback (2-3 minutes)**
```
Command:
./scripts/rollback-feature-flag.sh \
  --environment production \
  --flag "use-mui-x-file-explorer" \
  --severity immediate \
  --reason "P0: [Issue description]"

Wait for deployment confirmation.
```

**STEP 4: Validate Rollback (2-3 minutes)**
```
Checklist:
✓ Feature flag deployment confirmed
✓ Dashboard shows 100% original traffic
✓ Error rate graph showing decrease
✓ Error rate stabilizing at baseline
✓ Manual test: FileExplorer opens/functions
✓ No new console errors appearing
```

**STEP 5: Notify Team (2 minutes)**
```
Slack notification to incident channel:
":red_alert: ROLLBACK COMPLETE - P0 Incident

Issue: [Description]
Traffic: 100% → 0% (now original FileExplorer)
Duration: [Minutes from start to rollback complete]
Impact: All users affected, now resolved
Status: Monitoring for stability

Root cause analysis starting immediately.
Next update in 30 minutes."

Email: Quick summary to stakeholders
PagerDuty: Update incident status
```

**STEP 6: Begin Investigation (Ongoing)**
```
1. Assign root cause analysis to engineer
2. Collect logs for incident time window
3. Review code changes since last stable state
4. Check for deployment issues
5. Identify testing gaps
```

**STEP 7: Daily Status Update (Until Resolved)**
```
Post daily at same time until fix deployed:
"P0 Incident Status Update - [Date]
Issue: [Description]
Investigation: [Progress so far]
Fix Status: [Development/Testing/Ready]
ETA for Phase 1 restart: [Timeline]
Team: [Who is working on this]"
```

---

## Section 3: P1 Incident Response

### 3.1 When to Treat as P1

You have a P1 incident if ANY of these are true:

- [ ] 3+ P1 bugs reported in 24 hours
- [ ] Single P1 bug causing feature regression >5% of workflows
- [ ] Performance regression 10-20% (not >20%)
- [ ] Accessibility violations discovered
- [ ] User complaints >5 related to specific feature
- [ ] Grid view or DnD specific issues affecting >1% users
- [ ] Search/filter functionality degraded

### 3.2 P1 Response Timeline

```
Minute 0: Alert arrives
Minute 5-15: Assess severity and scope
Minute 15-30: Escalate to engineering lead
Minute 30-60: Decide rollback or investigate
Minute 60+: If rollback, complete and validate
Hour 1-4: Root cause analysis and fix planning
```

### 3.3 P1 Incident Steps

**STEP 1: Assess Severity (10-15 minutes)**
```
Questions:
1. How many users affected? (estimate)
2. Can we temporarily reduce traffic?
3. Is this fixable in next 1-2 hours?
4. Is rollback necessary?
5. User impact: Can they work around it?

Assessment: Investigate vs Rollback?
```

**STEP 2: Notify Engineering Lead (5 minutes)**
```
Slack DM:
"P1 Alert: [Issue]
Scope: [Users/feature affected]
My assessment: [Your recommendation]
Need your decision: Investigate or rollback?
Time: [How long we can investigate]"
```

**STEP 3: Decision Point (Made by Engineering Lead)**

**Option A: Investigate First**
```
Timeline: 30-60 minutes investigation window
Process:
1. Reduce traffic to 0% (pause, don't rollback)
2. Investigate in staging environment
3. Implement hotfix if possible
4. Test in staging
5. If fixed: Resume rollout
   If not fixed: Proceed to Option B
```

**Option B: Rollback**
```
Timeline: 5-10 minutes for rollback
Process:
1. Execute rollback via rollback procedure
2. Validate original FileExplorer working
3. Notify team
4. Schedule investigation for later
5. Plan re-entry to Phase 1
```

**STEP 4: Execute Decision (Variable)**
```
If investigating:
  1. Set trafficPercentage = 0, enabled = true
  2. Deploy pause configuration
  3. Note in config: "PAUSED for investigation"
  4. Inform team of investigation window

If rolling back:
  1. Follow rollback procedure (Section 4)
  2. Set enabled = false
  3. Complete full validation
```

**STEP 5: Notify Team (2-3 minutes)**
```
Slack:
":warning: P1 INCIDENT - MUI X FileExplorer

Issue: [Description]
Impact: [Scope]
Status: [Investigating/Rolled Back]
Action: [Pause for investigation/Rolled back for fix]
Timeline: [When we'll resume/what we're doing]

Team: [Who is investigating]"
```

**STEP 6: Monitor Investigation (Ongoing)**
```
Every 15 minutes:
1. Check progress on fix
2. Assess if rollback needed
3. Update timeline if changing
4. Communicate to team if status changes
```

---

## Section 4: Monitoring Phase Transition Incidents

### 4.1 Phase 2→3 Decision Point Issue

**Scenario:** Phase 2 (5-10% beta) completing, decision time for canary

**If issues found at phase-end decision:**

```
1. Do NOT proceed to Phase 3
2. Extend Phase 2 for additional investigation
3. Reduce traffic back to 5% if was increasing
4. Root cause analysis: Why wasn't this caught?
5. Implement monitoring/testing improvements
6. When fixed: Restart Phase 2 from beginning
```

**Communication:**
```
"Phase 2 Extended - Additional Investigation

We're extending Phase 2 to resolve identified issues
before proceeding to canary phase (Phase 3).

Users affected: Current beta cohort (5-10%)
Traffic: Holding at 5% until fix validated
Investigation: [Timeline]
Impact: Schedule shift of 2-3 days

We're being conservative to ensure quality before
wider rollout."
```

### 4.2 Phase 3→4 Decision Point Issue

**Scenario:** Phase 3 (25% canary) completing, decision time for 50%

**If issues found at phase-end:**

```
1. Do NOT proceed to Phase 4
2. Reduce traffic to 10% for investigation
3. Implement fix in staging
4. Extended testing before retry
5. Escalate decision to VP Engineering
```

**Communication:**
```
"Phase 3 Extended - Canary Testing Continued

We identified issues during canary testing and
are extending investigation before wider rollout.

Current exposure: Reducing from 25% to 10%
Timeline: 2-3 additional days
Impact: Production rollout schedule shifted

This is normal and safe practice - we're validating
thoroughly before broader exposure."
```

---

## Section 5: False Alarm Response

### 5.1 False Alarm Recognition

You have a false alarm if:
- Alert triggered but metric is actually normal
- Alert metric is noisy/variable (not steady degradation)
- Original FileExplorer shows same metric
- Error is transient and auto-resolving

### 5.2 False Alarm Steps

**STEP 1: Confirm False Alarm (2-3 minutes)**
```
1. Check metric over last 15-30 minutes
2. Compare to baseline/control group
3. Check if trend is actually concerning
4. Verify no other correlated issues
```

**STEP 2: Acknowledge Alert (1 minute)**
```
Post to incident channel:
"FALSE ALARM - [Alert Name]

Alert fired but metric is within normal variance.
Details: [Why this is not a real issue]
No action needed.
Resolution: Will adjust alert thresholds if needed."
```

**STEP 3: Document (2 minutes)**
```
Add to incident log:
- Alert name
- Time triggered
- Why it was false alarm
- Whether alert threshold should adjust
```

**STEP 4: Close Alert (30 seconds)**
```
1. Mark alert as resolved in monitoring system
2. Remove from incident list
3. Post close notification to incident channel
```

---

## Section 6: User Complaint Handling

### 6.1 Critical User Report

**When you receive:** Support ticket, user complaint, escalation

**Immediate Actions:**
```
1. Post to incident channel with user report
2. Assess: Is this isolated or widespread?
3. Check monitoring for related pattern
4. Assign severity: P0, P1, or non-critical
5. Coordinate response
```

**Communication to User:**
```
"Thank you for reporting this issue with FileExplorer.

We're investigating this immediately and will provide
an update within 30 minutes.

In the meantime: [Workaround if available]

Your report: [Reference number]
Support: [Contact email]"
```

### 6.2 Multiple Related Complaints

**If you receive >3 complaints about same issue:**

```
Escalate immediately to P1:
1. This indicates broader issue than isolated case
2. Post to incident channel: "Multiple user reports"
3. Notify engineering lead
4. Prepare for possible rollback
```

---

## Section 7: Performance Incident

### 7.1 Performance Degradation Detection

**Alerts:**
- P95 render time spike
- Memory usage increase
- Frame rate drop on scrolling
- Time to interactive regression

**Assessment (5 minutes):**
```
Questions:
1. Is degradation in MUI X only or both?
2. Is it consistent or variable?
3. Which operation triggers it? (expansion, drag, etc)
4. Can users work around it?
5. How many users affected?
```

**Decision:**
```
If ≤5% degradation: Monitor, don't act
If 5-20% degradation: Investigate/pause traffic
If >20% degradation: Rollback immediately
```

### 7.2 Performance Rollback Trigger

```
Condition: P95 render time > baseline × 1.2 (>20% worse)

Action:
1. Execute immediate rollback
2. Notify team: Performance regression detected
3. Plan optimization investigation
4. Return to Phase 1 when optimized
```

---

## Section 8: Accessibility Incident

### 8.1 Accessibility Issue Report

**Common issues:**
- Screen reader not announcing changes
- Keyboard navigation broken in specific scenario
- ARIA attributes missing or incorrect
- Color contrast violation reported

**Assessment (5 minutes):**
```
1. Verify the accessibility issue
2. Can users still use FileExplorer?
3. Is it specific to one feature?
4. How many users using assistive tech affected?
```

**Decision:**
```
If minor: Investigate and fix
If major (blocks core functionality): Rollback
```

### 8.2 Accessibility Rollback

```
Trigger: WCAG 2.1 AA violation blocking usage

Action:
1. Rollback immediately
2. Notify accessibility team
3. Plan comprehensive audit
4. Return to Phase 1 after audit passes
```

---

## Section 9: Recovery & Post-Incident

### 9.1 Stabilization Phase (After Rollback)

**Timeline: 1 hour after rollback**

```
Checklist:
✓ Error rates stable (5+ minutes)
✓ User activity normal
✓ No continued complaints
✓ Team confident in stability
✓ Original FileExplorer fully functional
```

**Status Update:**
```
"MUI X FileExplorer Rollback - Stability Confirmed

Incident resolved at [Time]
All users now using original FileExplorer
System fully functional
No ongoing issues detected

Root cause analysis in progress.
Next update: [Time + 1 hour]"
```

### 9.2 Root Cause Analysis

**Responsibility:** Engineering Lead + On-Call Engineer

**Timeline:** Begin immediately, complete within 4 hours

**Output Required:**
```
1. What was the issue?
   [Specific technical description]

2. Why did it occur?
   [Root cause analysis]

3. Why wasn't it caught earlier?
   [Testing/monitoring gap analysis]

4. What's the fix?
   [Technical solution]

5. How do we prevent recurrence?
   [Process/monitoring improvements]
```

### 9.3 Fix Implementation & Testing

**In Staging Environment:**

```
1. Implement fix based on root cause analysis
2. Add specific test case for this issue
3. Run full test suite
4. Performance validation
5. Accessibility validation
6. Manual testing of fixed area + surrounding features
```

**Sign-Off Required:**
```
- Code review: [Engineer]
- Testing: [QA]
- Performance: [Performance team]
- Go/no-go for Phase 1 restart: [Engineering Lead]
```

### 9.4 Return to Rollout

**Timeline: When fix passes all validation in staging**

```
1. Schedule Phase 1 restart
2. Extend Phase 1 duration: 3-4 days (not 2)
3. Enhanced monitoring in Phase 1
4. Team extended participation (not just devs)
5. Explicit sign-off before Phase 2
```

**Communication:**
```
"Phase 1 Restarted - MUI X FileExplorer Migration

Root cause identified and fixed: [Description]
Fix validated in staging: [Date]
Phase 1 timeline: 3-4 days (extended for safety)
Enhanced monitoring: Activated
Status: Staging [Date] → Phase 1 [Date]

We've implemented additional safeguards:
- [Monitoring improvement]
- [Testing improvement]
- [Process change]"
```

---

## Section 10: Escalation Scenarios

### 10.1 Escalation to VP Engineering

**Trigger: Rollback from Phase 4 or Phase 5**

**Who:** Engineering Lead initiates

**Message:**
```
Slack message to VP:
"Executive Escalation: MUI X FileExplorer Incident

Phase: [4 or 5 - widespread exposure]
Issue: [Description]
Action: Rolled back to original
Impact: [# users affected]
Timeline: [Duration of incident]
Root cause: [Brief explanation]

Investigating: [Who, when done]
Preventing future: [Planned improvements]

Awaiting your input on communication strategy."
```

### 10.2 Escalation to CEO/Public

**Trigger: Critical incident affecting 100% of users for >30 minutes**

**Who:** VP Engineering + Product leadership

**Decision:** Whether to communicate publicly

**Public Message (if needed):**
```
"FileExplorer Optimization Update

We're temporarily rolling back a FileExplorer
optimization to investigate and improve stability.
All users now have full FileExplorer functionality.

Timeline: [Duration of incident]
Impact: All users experienced brief interruption
Status: Fully resolved and functional

We're committed to maintaining reliability.
Thank you for your patience."
```

---

## Section 11: Prevention Checklist

### Pre-Phase 2 Launch

- [ ] Phase 1 testing completed (2+ days)
- [ ] All 8 plugins validated functionally
- [ ] Performance baseline established
- [ ] Monitoring dashboard tested and live
- [ ] Alert thresholds configured and tested
- [ ] Rollback procedure tested in staging
- [ ] Team trained on incident response
- [ ] Incident response channel created
- [ ] On-call rotation assigned
- [ ] Escalation contacts documented
- [ ] Communication templates prepared

### Ongoing During Rollout

- [ ] Daily monitoring review (morning standup)
- [ ] Alert threshold adjustments based on data
- [ ] New alert patterns detected proactively
- [ ] Team stays trained on procedures
- [ ] Rollback tested monthly in staging
- [ ] Communication templates kept current

---

## Section 12: Quick Reference Cards

### Severity Decision Tree

```
Is core FileExplorer broken?
├─ YES → P0 (Immediate rollback)
└─ NO  → Continue

Error rate spike >5%?
├─ YES → P0 (Immediate rollback)
└─ NO  → Continue

Performance >20% worse?
├─ YES → P0 (Immediate rollback)
└─ NO  → Continue

Multiple P1 issues in 24h (≥3)?
├─ YES → P1 (Urgent rollback or investigate)
└─ NO  → Continue

Single P1 or feature regression?
├─ YES → P1 (Standard rollback or investigate)
└─ NO  → Monitor

Minor issue or false alarm?
├─ YES → Log and continue monitoring
└─ NO  → Escalate
```

### Response Time Matrix

| Severity | Alert Response | Investigation Start | Rollback Complete |
|----------|---|---|---|
| P0 | 5 min | 5 min | 15 min |
| P1 | 15 min | 30 min | 60 min |
| P2 | 1 hour | 4 hours | N/A |

### Team Assignments

**Incident Commander:** On-call engineer
**Technical Lead:** Engineering lead
**Communications:** Product manager
**Escalations:** VP Engineering

---

## Appendix: Communication Templates

### Template 1: Incident Acknowledged

```
"Incident acknowledged - [Alert Name]

Time: [HH:MM:SS UTC]
Team: Investigating immediately
Dashboard: [Link]
Expected update: [Time + 5-10 minutes]"
```

### Template 2: Investigating Issue

```
"Investigation underway - [Issue Summary]

Initial findings: [What we know so far]
Current action: [What we're doing]
Impact: [Who is affected]
ETA for resolution: [Estimate]
Team: [Who is working on it]"
```

### Template 3: Rollback Initiated

```
":warning: Rollback initiated - [Issue]

Reason: [P0/P1 because...]
Action: Reverting to original FileExplorer
Timeline: 5-10 minutes to complete
Impact: All users now using original (functionality fully restored)
Investigation: Starting immediately"
```

### Template 4: Incident Resolved

```
"Incident resolved - [Issue]

Root cause: [What went wrong]
Fix: [What we did]
Duration: [From start to resolution]
Impact: [How many users affected]
Prevention: [What we're doing to prevent recurrence]"
```

---

## Appendix: Training Checklist

Ensure all team members are trained on:

- [ ] How to read monitoring dashboard
- [ ] Alert severity levels and responses
- [ ] When to escalate
- [ ] Rollback procedure (step by step)
- [ ] Communication templates
- [ ] Escalation contacts
- [ ] Where to find this runbook
- [ ] How to document incidents
- [ ] Post-incident review process

**Training:** Conduct 1-hour training before Phase 2 launch

---

## Appendix: Testing Rollback in Staging

**Do this 1 week before Phase 2:**

```
1. Full production-like data in staging
2. Trigger a test rollback
3. Verify all steps work:
   ✓ Feature flag can be toggled
   ✓ Configuration deploys successfully
   ✓ Users see original FileExplorer
   ✓ Monitoring shows change
   ✓ Manual testing confirms functionality
4. Document any issues
5. Fix any issues found
6. Train team on the tested procedure
```

This ensures the rollback procedure works before it's needed in an emergency.
