# SUI Editor Completion — Phase Index

**Orchestrator:** Fable (sequential phases, basic agents per work item)

**Full PRD:** `../prd.md`

**Source assessment:** `.stokd/meta/SUI_EDITOR_SOFTWARE_REVIEW.md`

## Phase order

| Phase | File | Work items | Gate |
|-------|------|------------|------|
| 1 | `phase-01-critical-safety.md` | 1.1–1.7 | No crash paths; canvas dims correct |
| 2 | `phase-02-foundation-hygiene.md` | 2.1–2.6 | Dead code removed; console clean |
| 3 | `phase-03-wasm-orchestration.md` | 3.1–3.8 | WASM drives preview when enabled |
| 4 | `phase-04-timeline-performance.md` | 4.1–4.6 | Scrub/playback optimized |
| 5 | `phase-05-test-ci-gates.md` | 5.1–5.5 | Jest + CI contract gates |
| 6 | `phase-06-export-persistence.md` | 6.1–6.5 | .sue export + CLI bridge + OPFS proto |
| 7 | `phase-07-polish-ship.md` | 7.1–7.4 | Docs honest; E2E checklist green |

## Fable workflow

```bash
stokd project create -f .stokd/projects/sui-editor-completion/prd.md
# Then drive phases 1→7 sequentially via project-start / orchestrate skill
```

Each work item in `prd.md` is self-contained for a basic agent: Implementation Details, Acceptance Criteria, Acceptance Tests, Verification Commands.