# Stoked UI — Recommendations

> **Generated:** 2026-05-05 (fresh) | **Updated:** 2026-05-21 (0.3.0 → 0.4.0) · **Refreshed:** 2026-05-28, **2026-06-06** (timed)
> **Meta version:** 0.4.0
> **Repository:** `@stoked-ui/sui` v0.1.0-alpha.5
> **Root:** `/opt/worktrees/stoked-ui/stoked-ui-main`

This document captures actionable recommendations across code quality, architecture, testing, security, and performance, derived from a read of the monorepo (manifests, build config, CI workflows, source layout, and the existing `.stokd/meta/*` documents). Items are grouped by category and tagged **P0 / P1 / P2** by recommended urgency.

**2026-06-06 refresh changes:**

- **§2.1** — Refreshed the commit sample. The top of `main` now uses informal conventional prefixes (`restore:`, `refactor:`, `fix:`), but the `shove ×4` / `derp` commits still sit a few commits back in history. Still **no `.husky/` and no `commitlint.config.*`** — the enforcement gap stands and the P0 holds.
- **§2.2** — Corrected: the `@minh.nguyen/plugin-transform-destructuring` fork lives in the **`resolutions`** block (33 keys, still present), **not** in `pnpm.overrides` (22 keys, none referencing it). Because pnpm ignores `resolutions`, that fork override is almost certainly *not applied at all* — which strengthens the "delete `resolutions`" recommendation and means the Babel fork is either dead weight or relying on a transitive default.
- **§3.1 / §3.3** — `packages/sui-media` now ships a real Jest suite (`MediaCard.utils.test.ts`, `MediaViewer/*`, `abstractions/{Auth,Router,Queue,Payment,KeyboardShortcuts}.test.ts`, `integration-backward-compatibility.test.ts`). The "sui-media untested" framing is retired; `MediaFile.fromUrl()` retry/backoff still appears uncovered.
- **§3.5 / §4.7** — The audit-bot is **no longer untested**: `docs/src/modules/auditBot/tools.test.ts` (11 specs) covers the new `urlSafety.ts` SSRF guard for the `fetch_company_site` tool and the tool surface. Remaining gaps narrowed to `conversationRunner`, `save-lead`, `llmClient`, and (still-absent) rate limiting on `api/audit/turn.ts`.
- **§8.1** — `@stoked-ui/media` has dropped to `0.1.0-alpha.5` (aligned with the root); only `@stoked-ui/media-api` remains `1.0.0`. The version-spread concern is partially resolved.
- **CI inventory** — Now **9 workflows**: `ci.yml`, `ci-check.yml`, `codeql.yml`, `scorecards.yml`, `vale-action.yml`, `deploy-site.yml`, `publish-packages.yml`, `claude.yml`, `claude-code-review.yml`. Referenced where relevant.

---

## 1. Architecture & Boundaries

### 1.1 [P0] Enforce the `sui-media-api` boundary in code, not just docs

The "media-API endpoints only" boundary (`AX-REPO-MEDIA-API-BOUNDARY`) is documented in `CLAUDE.md`, `AGENTS.md`, `.stokd/meta/SC_CONTEXT.md`, and `.stokd/meta/SC_AXIOMS.md`, but nothing structural prevents a NestJS contributor from adding `products`, `clients`, `licenses`, `invoices`, or non-media `users` controllers to `packages/sui-media-api/src/`.

Current `packages/sui-media-api/src/` modules (verified this refresh): `auth/`, `blog/`, `clients/`, `users/`, `media/`, `uploads/`, `s3/`, `health/`, `performance/`, `database/`. The `blog/`, `clients/`, and non-media `users/` modules are the borderline cases that the rule says belong in `docs/pages/api/*`. Either:

- Migrate non-media modules out of `sui-media-api` into `docs/pages/api/<domain>/*`, or
- Update `SC_CONTEXT.md` / `SC_AXIOMS.md` to reflect the actual scope (media + identity + content) and define which submodules are sanctioned exceptions.

Then enforce structurally:

- Add a custom ESLint rule in `packages-internal/eslint-plugin-stoked-ui/` (`no-business-routes-in-media-api`) that fails the build when files under `packages/sui-media-api/src/` define controllers for disallowed domains.
- Add a CI grep gate in `.github/workflows/ci.yml` that fails if a new top-level folder appears under `packages/sui-media-api/src/` without a matching entry in an allowlist (`packages/sui-media-api/.allowed-modules.txt`).

**Why P0:** the boundary is load-bearing for product clarity but is enforced by humans reading four different markdown files. That is a recipe for drift, especially with multi-agent contributions.

### 1.2 [P1] Decide between Turbo and NX — running both is a tax

`turbo.json` orchestrates `dev`, `build`, `test`, `lint`, `typescript`. `nx.json` exists solely for the `zero-runtime` (Pigment CSS) workspace via `pnpm watch:zero` / `pnpm build:zero`. `lerna.json` is also present (versioning only). All three were re-confirmed present this refresh.

Three task runners is two too many:

- Move the Pigment CSS targets into `turbo.json` and delete `nx.json` + the `nx` dependency unless there is a documented Pigment-specific reason (NX project-graph features Turbo lacks). If there is, document it in `SC_OVERVIEW.md` so future contributors stop asking.
- Lerna's only job is `lerna version --no-private`. Replace with `changesets` or a small `pnpm publish --recursive` script to drop a heavy dependency tree.

### 1.3 [RESOLVED in 0.4.0] `sui-file-explorer-v2` references purged from `SC_TEST.md`

Previously `SC_TEST.md` planned tests for a `packages/sui-file-explorer-v2/` directory that did not exist. As of the 0.4.0 refresh those references are gone. If a v2 rewrite is revived, add a `packages/sui-file-explorer-v2/` entry to `SC_MODULES.md` first, then a co-located `.stokd/meta/packages/sui-file-explorer-v2/SC_MODULE.md`. Tombstone kept so future regressions are obvious.

### 1.4 [P1] Document and resolve the optional WASM dependency contract

`packages/sui-editor/package.json` declares `@stoked-ui/video-renderer-wasm` as an `optionalDependency` with a `file:` path to `../sui-video-renderer/pkg`. `EditorEngine.ts` dynamically imports it and auto-detects bundler vs web target. The artifact is present: `packages/sui-video-renderer/pkg/wasm_preview_bg.wasm` (note the actual basename is `wasm_preview_*`, **not** `sui_video_renderer_wasm_*` — earlier docs/build-gate examples used the wrong name; see §5.1).

Risks:

- Consumers of `@stoked-ui/editor` outside this monorepo cannot resolve `file:../sui-video-renderer/pkg`, so the published package is broken for npm consumers unless `pkg/` is itself published.
- `packages/sui-video-renderer/` has no `package.json` of its own (it's a Rust workspace) — there is no published package to satisfy the optional dep.

Action: publish the `pkg/` output as `@stoked-ui/video-renderer-wasm` to npm (or scope it under `@stoked-ui/editor` as a subpath), and switch the editor manifest to a semver range, not a `file:` link. Until then, document this as a "monorepo-only" capability and codify it (it is already captured as `AX-REPO-WASM-RENDERER-DEP`).

---

## 2. Code Quality

### 2.1 [P0] Commit hygiene and branch protection on `main`

The most recent commits adopt conventional prefixes informally, but the regression they were correcting is still right behind them in history:

```
6145267e70 restore: auto-extract first frame from videos for thumbnails
a1a92da872 refactor: simplify MediaCard to use video poster attribute directly
f0015cada9 fix: use CORS-friendly video URLs for media card examples
e54d836bef fix: add missing archiver dependency for CDN zip export
...
41c62c9bfe shove
03ffcd2088 shove
9ec7c38537 shove
23e87134f2 derp
```

The `shove ×4` / `derp` block is hostile to bisection, blame, and reviewers, and there is still **no `.husky/` directory and no `commitlint.config.*`** in the repo (verified this refresh) — the recent good subjects are convention, not enforcement. Direct pushes to `main` continue. Recommend:

- Add `.husky/commit-msg` + `commitlint` and a CI lint job; adopt conventional-commits.
- Branch protection: require PRs into `main` (no direct pushes), require a squash-merge with a meaningful title.
- Add `commitlint.config.js` at the root and wire it into `ci.yml`.

### 2.2 [P1] Reconcile dependency pin / override sprawl — the `resolutions` block is dead weight

`package.json` carries a `pnpm.overrides` block (**22 keys**) pinning MUI 5.17.1, React 18.3.1, and security minimums for `tar`, `axios`, `multer`, `qs`, `glob`, `webpack`, `lodash`, `js-yaml`, `fast-xml-parser`, `diff`, `micromatch`. A **separate `resolutions` block (33 keys) still exists** and duplicates several Babel/React/MUI constraints.

Issues (corrected this refresh):

- `resolutions` is yarn-style and **ignored by pnpm** (`preinstall: only-allow pnpm` rules out yarn) — dead weight. Delete it.
- The `@babel/plugin-transform-destructuring` → `npm:@minh.nguyen/plugin-transform-destructuring@^7.5.2` fork lives **only in `resolutions`**, *not* in `pnpm.overrides`. Since pnpm ignores `resolutions`, this fork override is almost certainly **not being applied** — the install is resolving stock `@babel/plugin-transform-destructuring` (or a transitive pin) instead. Either promote the fork into `pnpm.overrides` with an exact version *and document why* (supply-chain risk; see §4.6), or confirm it is no longer needed and drop it with the dead `resolutions` block.
- Align dev/dependency declarations with the actual override so the silent winner isn't confusing.

These pins are now binding invariants (`AX-REPO-MUI-REACT-PINS`); any audit must keep MUI 5.17.1 / React 18.3.1 intact unless the upgrade is run as a governed project.

### 2.3 [P1] React 18.3 → React 19 / MUI v6 migration plan

React 18.3.1 and MUI v5.17.1 are pinned tree-wide. React 19 is GA and Next 15 / MUI v6 / `@testing-library/react@16` have first-class support. Plan a coordinated, governed bump (this touches `AX-REPO-MUI-REACT-PINS`):

1. MUI v5 → v6 (breaking theme/`sx` changes).
2. React 18.3 → 19.x.
3. Next 13.5 → 15 (docs app).

Track this as a `stokd project` with phased acceptance criteria; without movement the codebase accumulates advisories on transitively pinned deps.

### 2.4 [P2] Replace the silent `console.log` suppression in the media API

`packages/sui-media-api/src/main.ts` silences `console.log` in prod (per `SC_OVERVIEW.md` §6). This hides legitimate operator logs. Replace with a real logger (`nestjs-pino` or the built-in NestJS `Logger` with a `LogLevel` env) so verbosity is config-driven, not global-overwrite-driven.

### 2.5 [P2] Trim `package.json` script surface

The root `package.json` exposes 90+ scripts, many of them thin workspace aliases (`common`, `editor`, `timeline`, `docs`, …) or release/dry-run flows. Consolidate release flows (`release:version`, `release:publish:dry-run`, `local-npm:*`) into one `scripts/release.mjs` with subcommands; keep the workspace shortcuts but document them in `SC_OVERVIEW.md`.

---

## 3. Testing

> **TDD is mandatory (Axiom 5).** Every code-touching task must add a failing test first (red), then implement to green. The recommendations below feed that workflow; new packages need a Jest harness in place so a contributor *can* write the red test cheaply.

### 3.1 [P0] Wire all packages into the CI test matrix

CI today is `ci.yml` + `ci-check.yml` with a `test-dev` job across macOS/Windows/Ubuntu (the old `test-coverage.yml` is gone). Real Jest suites now exist in at least `sui-media-api` (§3.3) and `sui-media` (§3.3) — but there is still no aggregate `test:jest` Turbo target surfacing their coverage in CI. The biggest immediate wins:

- Add a `test:jest` / `test:jest:ci` Turbo target so CI runs all packages' Jest suites in parallel.
- Add Jest configs to `sui-timeline`, `sui-editor`, `sui-common-api`, `sui-github`, `sui-docs` using the canonical template in `SC_TEST.md` §6.2.
- Set realistic coverage thresholds per package — start at the current measured number + 5%, not 80% on day one, to avoid blocking PRs.

### 3.2 [P1] Standardize on one test runner per layer

The repo runs Mocha + Karma + Jest + Playwright + `nyc`. Non-controversial split:

- **Unit (any package):** Jest.
- **Conformance (MUI-style):** Mocha + `describeConformance` (preserve).
- **Browser/cross-browser:** Karma is heavyweight; if only a couple of suites need real browsers, migrate to Playwright component tests and retire Karma.
- **E2E (website):** Playwright against port 5199.

Document the split in `SC_TEST.md` §3.1 and label each package's test scripts so a contributor instantly knows the runner.

### 3.3 [P1 — REVISED] Critical-path coverage: media-API + sui-media are now covered; revenue paths still thin

**Server (covered):** `packages/sui-media-api` ships Jest specs for `auth.service`, `s3.service`, `uploads.service`, `uploads.controller`, `media.service`, `media/metadata/metadata-extraction.service`, `media/thumbnail-generation.service`, `health.controller`, plus `test/uploads-e2e.spec.ts`. Keep these green and wire them into CI (§3.1).

**Client media (now covered):** `packages/sui-media` ships `components/MediaCard/__tests__/MediaCard.utils.test.ts`, `components/MediaViewer/__tests__/{MediaViewer.test.tsx, hooks.test.ts}`, `components/WebUserDirectChat/__tests__/*`, `abstractions/__tests__/{Auth,Router,Queue,Payment,KeyboardShortcuts}.test.ts`, and `__tests__/integration-backward-compatibility.test.ts`. The earlier "sui-media untested" framing is retired.

Still-thin, high-value targets:

- **`packages/sui-media/src/MediaFile/MediaFile.ts`** (~1000 lines) — `fromUrl()` retry/backoff behavior. Exactly the regression class the `extractVideoMetadata` `count > 0` guard fixed; no dedicated test guards `fromUrl()` today even though sibling abstractions are now covered.
- **Poster/first-frame extraction** — the active `media-pairing-poster-detection` work (recent commits `6145267e70`, `a1a92da872`, `76a8732750`) auto-extracts a video first frame for CORS-friendly posters across `MediaCard` and the `sui-cdn` `CdnBrowser`. `MediaCard.utils.test.ts` exists; confirm it exercises the pairing/poster-selection logic (per the project's Phase-01 "pure-logic" acceptance), and add a `CdnBrowser` gallery-collapse test (Phase-02).
- **License store (revenue-critical):** `docs/src/modules/license/{licenseStore.ts, licenseApiUtils.ts, stripeClient.ts}` — **still no `*.test.*` files exist** under `docs/src/modules/license/`. Cover `activate` / `validate` / `deactivate` and the Stripe webhook reconciliation path (`AX-REPO-STRIPE-LICENSE-COMMERCE`).
- **Auth role determination:** `docs/src/modules/auth/` `determineRole` (auto-admin for `@*.stokd.cloud` emails) — needs domain-matching regression tests (§4.3).

### 3.4 [P2] Visual regression (Argos) integration is partially wired

`pnpm test:argos` exists but there is no documented set of stories/screenshots feeding it. If Argos is being paid for, document which routes/components are captured and add an Argos CI step.

### 3.5 [P1 — REVISED] Audit-bot SSRF guard is now tested; the runner / persistence / LLM paths are not

`docs/src/modules/auditBot/` is a substantial subsystem — `conversationRunner.ts`, `playbooks/` (`ai-readiness`, `cloud-cost`, `security`), `channels/` (`linkedin`, `voice`, `web`), `llmClient.ts`, `tools.ts`, `urlSafety.ts`, `deliverables.ts`, `auditStore.ts`, `notifyTelegram.ts`, `types.ts` — wired to public endpoints `docs/pages/api/audit/{turn.ts, save-lead.ts}`.

**Progress:** `auditBot/tools.test.ts` (11 specs) now covers the new `urlSafety.ts` SSRF guard (loopback / cloud-metadata / RFC-1918 / IPv6-loopback / non-http schemes / embedded-credential rejection) and the tool surface (unknown-tool error path, removed `email_report` tool no longer advertised). The "zero tests" framing is retired.

Still uncovered on this revenue/lead-capture path (a silent regression loses leads):

- **`conversationRunner` playbook state transitions** — per-playbook happy path + early-exit; nothing tests these yet.
- **`save-lead` persistence + dedupe** — and the Telegram notify side-effect (`notifyTelegram.ts`), mocked.
- **`llmClient` base-URL / model resolution** from env (`AUDIT_BOT_BASE_URL`, `AUDIT_BOT_MODEL`, `AUDIT_BOT_API_KEY`) with a mocked OpenAI-compatible transport — these tests double as documentation of the LM Studio / Qwen contract.

---

## 4. Security

### 4.1 [P0] AWS credentials and the `stokd-cloud` profile

`deploy:prod` pins `AWS_PROFILE=stokd-cloud AWS_DEFAULT_PROFILE=stokd-cloud` (codified as `AX-REPO-AWS-PROFILE-STOKED`). The default AWS profile is a customer production account. Keep these explicit; additionally:

- In `infra/index.ts`, add a bootstrap guard that refuses to deploy if `AWS_PROFILE` is unset or `default`. Note there is now a dedicated `deploy-site.yml` workflow — make sure the guard runs there too, not only in the local script.
- This is documented in `SC_CONTEXT.md` / `SC_AXIOMS.md` so contributors and agents see it without reading a private global file.

### 4.2 [P0→P1] Secrets scanning in CI

Good news (re-confirmed): `.env*` files **are** gitignored (`**/.env*`, `**/.env` in `.gitignore`), and `scorecards.yml` + `codeql.yml` workflows are present. Remaining gap:

- Add `gitleaks` (or `trufflehog`) as a dedicated CI job so accidental credential commits are blocked at PR time — **still absent** (no workflow references `gitleaks`/`trufflehog`). CodeQL/Scorecards do not catch hard-coded secrets reliably.
- The new `publish-packages.yml` and `deploy-site.yml` workflows touch npm/AWS credentials — verify they read from GitHub OIDC / encrypted secrets, never inline.
- Confirm `infra/secrets.ts` / `infra/envVars.ts` reference SSM Parameter Store / Secrets Manager, not literals.

### 4.3 [P1] JWT and auth surfaces deserve a focused audit

`docs/src/modules/auth/` implements registration, login, JWT verification, and role determination (auto-admin for `@*.stokd.cloud`). Checklist:

- Verify the cross-origin `/api/auth/transfer` → `/api/auth/exchange` flow (`SC_FLOWS.md` §2) signs with an asymmetric key (RS256), not HS256 with a shared secret.
- Confirm 5-minute transfer tokens are single-use (nonce-tracked) — otherwise replay is trivial.
- Add tests for `determineRole` email-domain matching (§3.3).
- Confirm `bcryptjs` cost ≥ 12 in production.

### 4.4 [P1] Webhook signature verification

`docs/pages/api/webhooks/stripe.ts` and `docs/src/modules/license/stripeClient.ts` handle Stripe webhooks. This handler is the authoritative license-reconciliation point (`AX-REPO-STRIPE-LICENSE-COMMERCE`). Confirm signature verification is the only path that reaches license-activation logic (no body-only path), and the webhook secret lives in Secrets Manager and is rotated.

### 4.5 [P2] CSP and frame-ancestors for the docs site

The docs app embeds CodeSandbox/StackBlitz iframes. Verify `docs/next.config.mjs` sets a CSP allowing those origins and disallowing the rest, plus `frame-ancestors` to block clickjacking of authed routes.

### 4.6 [P2] Supply-chain hygiene

`pnpm.overrides` captures known CVEs. Extend the practice:

- Enable Dependabot or Renovate (weekly batch) instead of manual override bumps.
- Run `pnpm audit --prod --audit-level=high` in CI; fail on high/critical.
- Resolve the `@minh.nguyen/plugin-transform-destructuring` personal-fork situation (§2.2): it currently sits in the pnpm-ignored `resolutions` block, so it is both a supply-chain question *and* a likely no-op. Decide explicitly — adopt it in `pnpm.overrides` with a pinned exact version and a documented reason, or remove it.

### 4.7 [P1 — REVISED] Lead/PII handling and outbound notifications in the audit bot

The audit bot ingests untrusted user input on a public `web` channel and persists leads (`save-lead.ts` → `auditStore.ts`) and notifies via Telegram (`notifyTelegram.ts`). Status:

- **SSRF (mitigated):** the `fetch_company_site` tool now routes visitor-supplied URLs through `auditBot/urlSafety.ts`, which rejects loopback, cloud-metadata (`169.254.169.254`), RFC-1918/CGNAT/link-local, IPv6 ULA/loopback, non-http(s) schemes, and embedded credentials — and is unit-tested (`tools.test.ts`). Keep these green; ensure the **post-DNS-resolution** address is also re-checked in `tools.ts` (the helper is intentionally network-free), so a public hostname that resolves to a private IP is still blocked.
- **Prompt injection / untrusted content:** `conversationRunner` feeds user text to an LLM and to `tools.ts`. Treat all channel input as data, never instructions; ensure tool invocation cannot be steered by the visitor (per global guardrails). No test guards this yet (§3.5).
- **Lead data is PII** and is business-domain data — it must persist in MongoDB (`AX-REPO-MONGODB-BUSINESS-DATA`), not in any browser store, and `save-lead` should validate/sanitize before write.
- **Outbound secrets:** the Telegram bot token and `AUDIT_BOT_API_KEY` must come from env/Secrets Manager and never be logged or echoed into a chat transcript.
- **Rate limiting (still missing):** `docs/pages/api/audit/turn.ts` (111 lines) is an unauthenticated public endpoint that proxies an LLM and has **no rate-limit/throttle reference**. Add per-IP rate limiting and a max-tokens guard to prevent cost-amplification abuse.

---

## 5. Performance

### 5.1 [P1] WASM bundle size and editor cold-start

`packages/sui-video-renderer/wasm-preview` compiles to WASM (`packages/sui-video-renderer/pkg/wasm_preview_bg.wasm`) and is consumed by `sui-editor`.

- `wasm-pack build --target bundler` (or `web`) enables tree-shaking via webpack.
- Add a build-time gate: fail if `wasm_preview_bg.wasm` exceeds (e.g.) 1.5 MB without an explicit override. (Earlier drafts named the file `sui_video_renderer_wasm_bg.wasm` — the actual basename is `wasm_preview_bg.wasm`; use that in the gate.)
- `experiments.asyncWebAssembly: true` is set in `docs/next.config.mjs` (`AX-REPO-WASM-RENDERER-DEP`); verify the WASM is loaded lazily via dynamic import only when the editor view renders, not on every page load.

### 5.2 [P1] Next.js docs site bundle

`pnpm docs:size-why` exists (`DOCS_STATS_ENABLED=true`). Recommendations:

- Add a CI job running `docs:size-why` on PRs touching `docs/` or any consumed `@stoked-ui/*` package, posting a delta comment.
- Audit always-loaded components for synchronous imports of heavy `@stoked-ui/editor` / `@stoked-ui/timeline` modules — `/about` should not pull the timeline engine. This intersects `AX-REPO-BROWSER-NO-SERVER-DEPS` (browser barrels must stay server-free).

### 5.3 [P2] Sharp and ffmpeg in Lambda cold-starts

`packages/sui-media-api/src/lambda.ts` uses `@codegenie/serverless-express`. `sharp` and `fluent-ffmpeg` are heavy cold-start contributors:

- Use `arm64` Lambdas with `sharp` arm64 binaries.
- Provisioned concurrency on the thumbnail Lambda only, not the whole API.
- Consider splitting thumbnail generation into a dedicated Lambda triggered by S3 `ObjectCreated` events, keeping the synchronous request path lean. (Note the dual-runtime constraint `AX-REPO-MEDIA-API-DUAL-BUNDLE` — any split must keep Express and Lambda behavior identical.)

### 5.4 [P2] MongoDB index hygiene

`packages/sui-media-api/src/database/` and `packages/sui-common-api/src/models/` define Mongoose schemas (`AX-REPO-MONGODB-BUSINESS-DATA`, `AX-REPO-SWAP-ID-WIRE-FORMAT`). There is no documented index-creation step. Add:

- A `pnpm db:indexes` script that connects and ensures all schema indexes (recommend `autoIndex: false` in prod, handled explicitly by the script).
- Document required indexes in `.stokd/meta/` so an operator can recreate them on a fresh cluster.

---

## 6. Documentation

### 6.1 [P1] Finish the per-package meta migration

The 0.4.0 layout moves module docs into per-package folders:

```
.stokd/meta/packages/<pkg>/
  SC_MODULE.md
  SC_TEST.md
```

All 11 packages have both files. The old top-level `SC_MODULE_SUI_*.md` files are deleted. Follow-ups:

- Commit the deletions so the migration lands cleanly; do not restore.
- Grep `SC_OVERVIEW.md`, `SC_MODULES.md`, `SC_VIEWS.md`, `SC_FLOWS.md` for residual `SC_MODULE_SUI_` links and rewrite to `packages/<pkg>/SC_MODULE.md`.
- Keep `SC_MODULES.md` a thin index linking each per-package `SC_MODULE.md`.
- Ensure `SC_OVERVIEW.md` references `SC_PRODUCT_STOKED_UI_SUI.md` once (it does, §9).

### 6.2 [P1] Per-package READMEs are missing or thin

`packages/sui-cdn/README.md` now exists (added with the CDN zip-export work). Remaining gaps: `packages/sui-common/` and `packages/sui-github/` lack a one-page README covering: what the package does/doesn't do, public exports (per the single-barrel contract `AX-REPO-PACKAGE-BARREL`), peer-dep contract + example consumer code, and a link to its `SC_MODULES.md` row. The docs site serves end-users; npm browsers see only `README.md`.

### 6.3 [P2] CONTRIBUTING.md should reference port 5199 and the WASM build

The dev server runs on **port 5199, never 3000** (`AX-REPO-DOCS-PORT-5199`), and editor work requires `pnpm video-renderer:build-wasm` first (`AX-REPO-WASM-RENDERER-DEP`). Both belong in `CONTRIBUTING.md` and the top of `README.md`.

---

## 7. Developer Experience

### 7.1 [P1] `pnpm dev` orchestration is fragile

`dev` = `./scripts/kill-dev-services.sh && turbo run dev:prepare && turbo run dev --parallel --concurrency 15 --ui tui`.

- `kill-dev-services.sh` is silent about scope — document it or switch to a pidfile approach so it can't kill unrelated processes.
- `--concurrency 15` with ~12 packages is wasteful on small machines; use `--concurrency=$(nproc)` or Turbo's default heuristic.
- A failing `dev:prepare` silently leaves a stale build — add a top-level error gate.

### 7.2 [P2] Onboarding script

A `pnpm setup` / `bin/bootstrap` that: verifies pnpm 10.5.1+, Node, Rust toolchain + `wasm-pack`; runs `pnpm i`; runs `pnpm video-renderer:build-wasm`; optionally seeds local Mongo and starts the docs server. Today this is implicit knowledge.

### 7.3 [P2] CI feedback loop

`.github/workflows/{ci.yml, ci-check.yml}` are the gating jobs (cross-OS `test-dev`); `claude.yml` and `claude-code-review.yml` add agent-assisted review. Recommend:

- Split lint + typecheck + unit + e2e into parallel jobs and enable Turbo remote cache (`TURBO_TOKEN`) for near-instant repeat builds.
- Add a `concurrency:` group keyed on PR ref so duplicate runs auto-cancel.
- The `claude-code-review.yml` workflow is review-only — do not let it substitute for the unit/e2e gates above; keep both.

---

## 8. Release & Operations

### 8.1 [P1 — UPDATED] Versioning split is converging but still mixed

Current versions: `@stoked-ui/sui` `0.1.0-alpha.5` (root, private), `@stoked-ui/media` **`0.1.0-alpha.5`** (dropped from 1.0.0 — now aligned with the root), `@stoked-ui/editor` `0.1.2`, `@stoked-ui/timeline` `0.1.3`, while `@stoked-ui/media-api` is still **`1.0.0`**. The media package realigning to 0.x is the right move; `media-api` at 1.0.0 alone now looks anomalous. Decide whether `media-api` is genuinely 1.x-stable; if not, drop it to 0.x before downstream consumers pin to 1. Document the stability promise per package in each README and `SC_MODULES.md`.

### 8.2 [P2] SST stage isolation

`pnpm deploy:prod` deploys to `--stage production` (and there is now a `deploy-site.yml` workflow). Confirm a `staging` stage and a documented `pnpm deploy:stage staging` pre-prod gate exists; today only `deploy:local` and `deploy:prod` are clear. Also clean up the vestigial `sst@^3.6.19` pin in `docs/package.json` (root deploys with SST v4.2.0; the v3 docs pin does not drive deploys — see `SC_OVERVIEW.md` §4).

---

## 9. Quick-Win Checklist (first sprint)

Ordered by ROI:

1. Add `commitlint` + `.husky/commit-msg` + branch protection on `main` (P0, §2.1) — `shove ×4` / `derp` still in recent history; still no husky/commitlint.
2. Add `gitleaks` to CI alongside the present CodeQL/Scorecards (P0→P1, §4.2) — still absent.
3. Add a `test:jest` Turbo coverage gate surfacing the existing `sui-media-api` and `sui-media` suites, then add Jest configs to `sui-timeline`/`sui-editor`/`sui-common-api`/`sui-github`/`sui-docs` (P0/P1, §3.1, §3.3).
4. Write the next audit-bot tests (`conversationRunner`, `save-lead`, `llmClient`) — the SSRF guard is already tested — and add rate-limiting to `api/audit/turn.ts` (P1, §3.5, §4.7).
5. Delete the dead `resolutions` block and resolve the pnpm-ignored `@minh.nguyen` Babel fork (adopt-and-pin in `pnpm.overrides`, or remove) (P1, §2.2, §4.6).
6. Resolve the `@stoked-ui/video-renderer-wasm` publication strategy or label editor monorepo-only; fix the WASM size-gate filename to `wasm_preview_bg.wasm` (P1, §1.4, §5.1).
7. Add a bootstrap AWS-profile guard in `infra/index.ts` and the `deploy-site.yml` workflow (P0, §4.1).
8. Add license-store tests (`activate`/`validate`/`deactivate` + webhook path) (P1, §3.3, §4.4).

---

## 10. Cross-References

- Architecture overview: `.stokd/meta/SC_OVERVIEW.md`
- Repo-global axioms (referenced inline as `AX-REPO-*`): `.stokd/meta/SC_AXIOMS.md`
- Product brief: `.stokd/meta/SC_PRODUCT_STOKED_UI_SUI.md`
- Module index: `.stokd/meta/SC_MODULES.md`
- Per-package module + test docs: `.stokd/meta/packages/<pkg>/SC_MODULE.md` and `.../SC_TEST.md`
- Test plan (aggregate): `.stokd/meta/SC_TEST.md`
- Views and screens: `.stokd/meta/SC_VIEWS.md`
- User flows: `.stokd/meta/SC_FLOWS.md`
- Active governed project: `.stokd/projects/media-pairing-poster-detection/` (PRD + 5 phase plans)
- Guardrails: `.stokd/meta/SC_CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`
