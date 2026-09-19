---
active: true
iteration: 1
max_iterations: 30
completion_promise: "PROJECT LIFECYCLE COMPLETE"
started_at: "2026-02-23T00:00:00Z"
---

# Project Lifecycle Orchestrator

You are managing the full lifecycle of a project autonomously. Each iteration, determine the current state and execute the next step. Do not ask questions — make reasonable decisions and keep moving.

## Problem Description

Implement Stripe-powered license key system API in the stoked-ui backend (NestJS + MongoDB + AWS Lambda via SST). This includes: Mongoose models (license + product) in sui-common-api, NestJS license module in sui-media-api with endpoints for activate/validate/deactivate/checkout, Stripe webhook handling for payment events, key generation, SES email integration, and infrastructure changes (secrets, rawBody support, stripe dependency). The API is generic to support licensing for multiple products (Flux first, then others). Full spec at `/Users/stoked/.claude/plans/glistening-pondering-tide.md`. NOTE: Only implement the backend (stoked-ui repo). The Swift client work is in a separate repo and out of scope for this project.

## Lifecycle State Management

The lifecycle state file lives with the project it belongs to:

- **Before project exists (iteration 1):** State is at `.claude/ralph-loop.local.md`
- **After `/project-create` runs:** State moves to `projects/{slug}/stoked.md` with a symlink at `.claude/ralph-loop.local.md` pointing to it

### Relocate State (run every iteration after the first)

At the start of each iteration, check if the state file has been relocated yet:

```bash
# If ralph-loop.local.md is a regular file (not a symlink) AND a project slug exists, relocate it
if [ ! -L .claude/ralph-loop.local.md ]; then
  # Find the project slug for this lifecycle
  SLUG=$(ls projects/ 2>/dev/null | while read dir; do
    if [ -f "projects/$dir/orchestration-state.json" ]; then
      has_integration=$(cat "projects/$dir/orchestration-state.json" | jq -r '.integration.integrated_at // empty')
      if [ -z "$has_integration" ]; then
        echo "$dir"
        break
      fi
    fi
  done)

  if [ -n "$SLUG" ]; then
    echo "Relocating state file to projects/$SLUG/stoked.md"
    mv .claude/ralph-loop.local.md "projects/$SLUG/stoked.md"
    ln -sf "../projects/$SLUG/stoked.md" .claude/ralph-loop.local.md
    echo "Symlink: .claude/ralph-loop.local.md → projects/$SLUG/stoked.md"
  fi
fi
```

**If multiple unintegrated projects exist**, match the correct one by comparing the project title against this lifecycle's Problem Description. Use the project whose title most closely matches.

## State Machine

Execute these checks IN ORDER. Stop at the first match and run that phase.

### Check 1: Find Active Project

Search for `./projects/*/orchestration-state.json` files. Look for any file that does NOT have an `integration.integrated_at` field (meaning integration hasn't completed).

**If multiple unintegrated projects exist**, match the correct one by comparing the project title against this lifecycle's Problem Description above. Use the project whose title most closely matches the problem.

- **No file found at all** → Execute **Phase A** (Create)
- **File exists but has no `project_number` field** → Execute **Phase A** (Create/Resume)
- **File exists with `project_number`** → Continue to Check 2

### Check 2: Is Integration Already Complete?

Read `./projects/<slug>/integration-state.json` (if it exists).

- **File exists AND `current_phase` equals `"complete"`** → Execute **Phase D** (Done)
- **Otherwise** → Continue to Check 3

### Check 3: Are All GitHub Items Done?

Query the GitHub project:

```bash
OWNER=$(gh repo view --json owner -q .owner.login)
PROJECT_NUM=<project_number from orchestration-state.json>
NOT_DONE=$(gh project item-list $PROJECT_NUM --owner $OWNER --format json | jq '[.items[] | select(.content.type == "Issue") | select(.fieldValues.Status != "Done")] | length')
echo "Items not done: $NOT_DONE"
```

- **Any items NOT "Done" (NOT_DONE > 0)** → Execute **Phase B** (Start)
- **ALL items "Done" (NOT_DONE == 0)** → Execute **Phase C** (Integrate)

---

## Phase A: Create Project

Use the Skill tool to invoke the project-create command:

```
Skill(skill: "project-create", args: "<the Problem Description above>")
```

This will create the PFB, PRD, GitHub Project, and all issues. After it completes, this iteration ends. The next iteration will pick up at Phase B.

## Phase B: Start / Continue Project

Use the Skill tool to invoke the project-start command with the project number:

```
Skill(skill: "project-start", args: "<project_number from orchestration-state.json>")
```

This reads current state from GitHub and the worktree, picks up wherever it left off, and works on remaining items. If it completes all items, the next iteration will move to Phase C. If it runs out of context, the next iteration will resume right where it left off.

## Phase C: Integrate Project

Use the Skill tool to invoke the project-integrate command with the project number:

```
Skill(skill: "project-integrate", args: "<project_number from orchestration-state.json>")
```

This validates, syncs with main, creates a PR, squash merges, and cleans up. After completion, the next iteration will detect integration is complete and finish the loop.

## Phase D: Complete

The project has been fully created, implemented, and integrated into main. Output the completion signal:

<promise>PROJECT LIFECYCLE COMPLETE</promise>

Report a final summary:
- Project number and title
- PR number and URL (from integration-state.json)
- Total phases and items completed
- The project is now on main
