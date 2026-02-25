---
productId: stokd-cloud
title: Review Commands
---

# Review Commands

<p class="description">Three hierarchical Claude Code slash commands that perform automated quality review at the item, phase, and project level with parallel sub-agent execution.</p>

## What They Do

The review commands are Claude Code skills that automate quality assurance across your GitHub Projects. They follow a hierarchical structure -- `/review-item` reviews a single issue, `/review-phase` orchestrates parallel item reviews across a phase, and `/review-project` orchestrates parallel phase reviews across an entire project. Each level produces structured reports and automatically updates issue statuses in GitHub.

## Command Hierarchy

```
/review-project  (Director of Engineering -- executive oversight)
      |
      +-- launches parallel -->  /review-phase  (Engineering Manager -- phase coordination)
                                      |
                                      +-- launches parallel -->  /review-item  (Senior SET -- individual review)
```

## Commands

### /review-item -- Individual Issue Review

Reviews a single GitHub issue by reading its requirements, validating acceptance criteria, reviewing code changes, and updating the issue status.

**Usage:**

```bash
# Review by issue number
claude /review-item 59

# Review by project number + phase.item
claude /review-item 70 2.2
```

**Persona:** Senior Software Engineer turned SET (Software Engineer in Test).

**What it does:**

1. Fetches the issue and reads all requirements and comments.
2. Validates that acceptance criteria exist and are clearly defined.
3. Reviews related code changes and test coverage.
4. Marks the issue as Done if all criteria are met, or back to Todo with an explanation if not.
5. Adds a detailed verification comment to the issue.
6. Notifies the VSCode extension to refresh via signal files.

**Example output:**

```
Review Summary: Issue #2

Status: Complete

Acceptance Criteria:
- [x] MongoDB schema defined with all required fields
- [x] Indexes configured for performance
- [x] TypeScript types match schema
- [x] Validation rules implemented

Action Taken:
- Marked as "Done" in project #70
- Added verification comment
- Closed issue #2

Next Steps: None - ready for production
```

### /review-phase -- Phase Orchestration

Reviews all items in a project phase by launching parallel `/review-item` sub-agents and aggregating results.

**Usage:**

```bash
# Review by project number + phase number
claude /review-phase 70 2

# Review by phase master issue number
claude /review-phase 1
```

**Persona:** Engineering Manager coordinating quality review.

**What it does:**

1. Identifies all items belonging to the specified phase.
2. Launches parallel `/review-item` sub-agents for each item.
3. Aggregates results into a phase summary with completion percentage.
4. Updates the phase master issue with the summary.
5. Identifies blockers and provides recommendations.

**Example output:**

```
Phase 2 Review Summary

Total Items: 8
Complete: 5 (62%)
Incomplete: 2 (25%)
Not Started: 1 (13%)

Complete Items:
  Phase 2.1 - NestJS Project Setup (#2)
  Phase 2.2 - MongoDB Schema Design (#3)
  Phase 2.3 - API Key Authentication (#4)
  Phase 2.4 - Health Check Endpoints (#10)
  Phase 2.5 - Project Fields API (#11)

Incomplete Items:
  Phase 2.6 - SST Deployment (#7)
    Missing: Production environment configuration
  Phase 2.7 - Custom Domain (#8)
    Missing: SSL certificate setup

Not Started:
  Phase 2.8 - E2E Tests (#9)

Phase Status: In Progress (62% complete)

Recommendation: Complete items 2.6 and 2.7 before marking phase as done.
```

### /review-project -- Project-Wide Orchestration

Reviews an entire project across all phases and produces a stakeholder-ready executive summary.

**Usage:**

```bash
# Review entire project
claude /review-project 70
```

**Persona:** Director of Engineering providing executive oversight.

**What it does:**

1. Identifies all phases in the project.
2. Launches parallel `/review-phase` sub-agents for each phase.
3. Aggregates results into a comprehensive project health report.
4. Identifies the critical path and blockers.
5. Calculates velocity and estimated completion date.
6. Provides strategic recommendations and next steps.

**Example output:**

```
PROJECT HEALTH REPORT: Build Stokd State Tracking API

Project: #70

OVERALL STATUS: ON TRACK (with concerns)

Progress: 52% complete (22/42 items)
Velocity: 4.2 items/week
Estimated Completion: 2 weeks

COMPLETED WORK:
- Phase 1: Foundation complete (8/8 items)
- Core schemas validated and tested
- Authentication system implemented

IN PROGRESS:
- Phase 2: Session tracking (6/8 items, 75%)
- Phase 3: Recovery system (5/10 items, 50%)

BLOCKERS:
1. Phase 2.6: SST deployment config needed
   Impact: Blocking Phases 4 & 5 (18 items)
2. Phase 3.2: Failure detection tests failing
   Impact: Blocking Phase 3 completion

CRITICAL NEXT STEPS:
1. Configure AWS credentials for SST
2. Fix failure detection test failures
3. Complete Phase 2 heartbeat testing

RECOMMENDATIONS:
1. Resolve SST deployment blocker (unblocks 18 items)
2. Deploy Phases 1-2 to staging for early feedback
```

## Installation

The review commands are installed as global Claude Code slash commands. The VSCode extension installs them automatically on first activation to:

```
~/.claude/commands/review-item.md
~/.claude/commands/review-phase.md
~/.claude/commands/review-project.md
```

You can also install them manually by running the test script:

```bash
./examples/test-review-commands.sh
```

## Integration with VSCode Extension

The review commands automatically notify the VSCode extension when they make changes:

1. Commands update GitHub issues and projects through the unified service layer.
2. Commands write signal files to `.claude-sessions/`.
3. The extension detects signal file changes via file watchers.
4. The extension auto-refreshes the project view.
5. Updated statuses appear immediately in the Stokd panel.

## Usage Patterns

| Scenario | Command | When to Use |
|----------|---------|-------------|
| Quick item check | `claude /review-item 5` | After completing a feature |
| Phase sign-off | `claude /review-phase 70 1` | Before moving to the next phase |
| Weekly status | `claude /review-project 70` | Weekly stakeholder updates |
| Pre-release validation | `claude /review-project 70` | Before deploying to production |
| During code review | `claude /review-item 42` | When unsure if work is complete |

## Requirements

- **GitHub CLI** (`gh`) installed and authenticated.
- **Git repository** with a valid GitHub remote.
- **Claude Code** with the latest version and skills support.
- **VSCode Extension** (Stokd) installed for automatic UI refresh.

## Tips

1. **Run in the project root** -- Commands need access to `.git` and project files.
2. **Parallel execution** -- Phase and project reviews launch sub-agents in parallel for speed.
3. **Be patient** -- Full project reviews can take 5-10 minutes for large projects.
4. **Idempotent** -- Commands are safe to rerun; they will not duplicate comments or status changes.
5. **Verbose mode** -- Use `claude --verbose /review-item 5` for detailed output when debugging.
