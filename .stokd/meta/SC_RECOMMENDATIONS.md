# Stoked UI — Recommendations

> **Generated:** 2026-05-05 (fresh) | **Updated:** 2026-05-21 (meta 0.3.0 → 0.4.0)
> **Meta version:** 0.4.0
> **Repository:** `@stoked-ui/sui` v0.1.0-alpha.5
> **Root:** `/opt/worktrees/stoked-ui/stoked-ui-main`

This document captures actionable recommendations across code quality, architecture, testing, security, and performance, derived from a fresh read of the monorepo (manifests, build config, source layout, and the existing `.stokd/meta/*` documents). Items are grouped by category and tagged **P0 / P1 / P2** by recommended urgency.

**v0.4.0 changes:** Meta layout migrated from flat `.stokd/meta/SC_MODULE_SUI_*.md` files to per-package `.stokd/meta/packages/<pkg>/SC_MODULE.md` (+ co-located `SC_TEST.md`). A new product-level brief lives at `.stokd/meta/SC_PRODUCT_STOKED_UI_SUI.md`. Section 6.1 has been rewritten to reflect this; other items are reverified against current state.

---

## 1. Architecture & Boundaries

### 1.1 [P0] Enforce the `sui-media-api` boundary in code, not just docs

The "media-API endpoints only" boundary is documented in `CLAUDE.md`, `AGENTS.md`, and `.stokd/meta/SC_CONTEXT.md`, but nothing structural prevents a NestJS contributor from adding `products`, `clients`, `licenses`, `invoices`, or `users` controllers to `packages/sui-media-api/src/`.

Concrete inspection:

- `packages/sui-media-api/src/` already contains `users/`, `auth/`, `clients/`, `blog/` modules — borderline cases that the rule says belong in `docs/pages/api/*`. Either:
  - Migrate non-media modules out of `sui-media-api` into `docs/pages/api/<domain>/*`, or
  - Update `SC_CONTEXT.md` to reflect the actual scope (media + identity + content) and define which submodules are exceptions.
- Add a custom ESLint rule in `packages-internal/eslint-plugin-stoked-ui/` (`no-business-routes-in-media-api`) that fails the build when files under `packages/sui-media-api/src/` import or define controllers for disallowed domains.
- Add a CI grep gate in `.github/workflows/ci.yml` that fails if a new top-level folder appears under `packages/sui-media-api/src/` without a matching entry in an allowlist file (`packages/sui-media-api/.allowed-modules.txt`).

**Why P0:** the boundary is currently load-bearing for product clarity, but it is enforced by humans reading three different markdown files. That is a recipe for drift, especially with multi-agent contributions.

### 1.2 [P1] Decide between Turbo and NX — running both is a tax

`turbo.json` orchestrates `dev`, `build`, `test`, `lint`, `typescript`. `nx.json` exists solely for the `@pigmentcss/*` (zero-runtime) workspace via `pnpm watch:zero` / `pnpm build:zero`. Lerna is also present (versioning only).

Three task runners is two too many. Recommendations:

- Move the Pigment CSS targets into `turbo.json` and delete `nx.json` + the `nx` dependency unless there is a documented Pigment-specific reason (e.g. its build requires NX project graph features not in Turbo). If there is, document it in `.stokd/meta/SC_OVERVIEW.md` so future contributors stop asking.
- Lerna's only remaining job is `lerna version --no-private`. Replace with `changesets` or a small custom script driven by `pnpm publish --recursive` to drop a heavy dependency tree.

### 1.3 [RESOLVED in 0.4.0] `sui-file-explorer-v2` references purged from `SC_TEST.md`

Previously, `.stokd/meta/SC_TEST.md` planned tests for a `packages/sui-file-explorer-v2/` directory that did not exist on disk. As of the 0.4.0 meta refresh, those references have been removed (`grep -c sui-file-explorer-v2 .stokd/meta/SC_TEST.md` → 0). If a v2 rewrite is revived, add a `packages/sui-file-explorer-v2/` entry to `SC_MODULES.md` first, then a co-located `.stokd/meta/packages/sui-file-explorer-v2/SC_MODULE.md`. Leaving here as a tombstone so future regressions are obvious.

### 1.4 [P2] Document the optional WASM dependency contract

`packages/sui-editor/package.json` declares `@stoked-ui/video-renderer-wasm` as an `optionalDependency` with a `file:` path to `../sui-video-renderer/pkg`. `EditorEngine.ts` dynamically imports it and auto-detects bundler vs web target.

Risks:

- Consumers of `@stoked-ui/editor` outside this monorepo cannot resolve `file:../sui-video-renderer/pkg`, so the published package is broken for npm consumers unless `pkg/` is itself published or replaced with a real npm name.
- `packages/sui-video-renderer/` has no `package.json` of its own (it's a Rust workspace) — there is no package being published to satisfy the optional dep.

Action: publish the `pkg/` output as `@stoked-ui/video-renderer-wasm` to npm (or scope it under `@stoked-ui/editor` as a subpath), and update the editor's manifest to use a semver range, not a `file:` link. Until that is done, document this as a "monorepo-only" capability.

---

## 2. Code Quality

### 2.1 [P0] Commit hygiene on `main`

Recent commits on `main`:

```
03ffcd2088 shove
9ec7c38537 shove
23e87134f2 derp
2243bdeca1 shove
```

This is hostile to bisection, blame, and reviewers. Recommend:

- Enforce conventional-commits (or any structured style) via a `commit-msg` hook in `.husky/` and a CI lint via `commitlint`.
- Branch protection: require PRs into `main` (no direct pushes), require at least one squash-merge with a meaningful title.
- Add `commitlint.config.js` at the root and wire it into `ci.yml`.

### 2.2 [P1] Reconcile dependency pin / override sprawl

`package.json` carries large `pnpm.overrides` and `resolutions` blocks that pin MUI v5.17.1, React 18.3.1, and security-driven minimums for `tar`, `axios`, `multer`, `qs`, `glob`, `webpack`, `lodash`, `js-yaml`, `fast-xml-parser`, `diff`, `micromatch`. There is also a `resolutions` block (yarn-style) that duplicates several of those constraints.

Issues:

- `resolutions` is ignored by pnpm — those entries are dead weight unless yarn is also supported (which `preinstall: only-allow pnpm` rules out).
- The `@babel/plugin-transform-destructuring` override to `@minh.nguyen/plugin-transform-destructuring@^7.5.2` is suspicious — it pins to a personal fork. Document why or remove.
- `@mui/material` is pinned to 5.17.1 in `pnpm.overrides` while `package.json` `devDependencies` lists `^5.15.21`. The override silently wins, but the inconsistency is confusing.

Action: delete the `resolutions` block, audit each override to add a one-line comment explaining why it exists (security CVE link or upstream incompatibility), and align dev/dependency declarations with the actual override.

### 2.3 [P1] React 18.3 → React 19 migration plan

React 18.3.1 is pinned across the workspace via `pnpm.overrides` and `resolutions`. React 19 is GA and several dependencies (Next.js 14 → 15, MUI v6, `@testing-library/react@16`) have first-class React 19 support. Plan a coordinated bump:

1. MUI v5 → v6 (breaking; new theme APIs and `sx` changes).
2. React 18.3 → 19.x.
3. Next 14 → 15.

Without movement, the codebase will increasingly attract security advisories on transitively pinned deps. Track this as a "platform upgrade" project in `.stokd/meta/`.

### 2.4 [P2] Drop the silent `console.log` suppression in the media API

`packages/sui-media-api/src/main.ts` "silences `console.log` in prod" (per `SC_OVERVIEW.md` §6). This hides legitimate logs from operators. Replace with a real logger (`pino`, `nestjs-pino`, or NestJS built-in `Logger` with a `LogLevel` config from env) so log volume is controlled by configuration, not by overwriting globals.

### 2.5 [P2] Trim `package.json` script surface

The root `package.json` exposes 90+ scripts. Many are aliases (`common`, `editor`, `timeline`, `docs`, …) that just call `pnpm -F @stoked-ui/<name>`. Others are dry-run/release flows that probably belong in `scripts/`. Consider:

- Move release flows (`release:version`, `release:publish:dry-run`, `local-npm:*`) into a single `scripts/release.mjs` with subcommands.
- Keep workspace shortcuts (`editor`, `timeline`, …) but document them in `SC_OVERVIEW.md` so contributors know they exist.

---

## 3. Testing

### 3.1 [P0] Adopt the `SC_TEST.md` Phase 1 plan

`SC_TEST.md` already lays out a thorough plan. The biggest immediate wins:

- Wire `test:jest` and `test:jest:ci` Turbo targets so CI can run all packages' Jest suites in parallel (currently only `sui-media` and `sui-media-api` are gated by `.github/workflows/test-coverage.yml`).
- Add Jest configs to `sui-timeline`, `sui-editor`, `sui-common-api`, `sui-github`, `sui-docs` using the canonical template in `SC_TEST.md` §6.2.
- Set realistic coverage thresholds per package — do not enforce 80% on day one; start at the current measured number + 5% to avoid blocking PRs.

### 3.2 [P1] Standardize on one test runner per layer

The repo runs Mocha + Karma + Jest + Playwright + `nyc`. The non-controversial split:

- **Unit (any package):** Jest.
- **Conformance (MUI-style):** Mocha + `describeConformance` (existing pattern, preserve).
- **Browser/cross-browser:** Karma is heavyweight; if only one or two suites need real browsers, migrate them to Playwright `@playwright/test` component tests and retire Karma.
- **E2E (website):** Playwright.

Document the chosen split in `SC_TEST.md` §3.1 and label every package's test scripts so a contributor instantly knows which runner is in play.

### 3.3 [P0] Critical-path tests that are currently missing

`packages/sui-media/src/MediaFile/MediaFile.ts` (1004 lines) and `packages/sui-media-api/src/uploads/uploads.service.ts` are core data paths and have minimal coverage. Concrete first targets:

- `MediaFile.fromUrl()` retry / backoff behavior — exactly the kind of regression a test would have caught when `extractVideoMetadata` previously blocked on an empty `ScreenshotStore` until a `count > 0` guard was added.
- `UploadsService.initiateUpload` → `completeUpload` happy-path with mocked `S3Service`.
- `auth.service` JWT verification edge cases.
- License-store `activateLicense` / `validateLicense` (revenue-critical, currently no tests in `docs/src/modules/license/`).

### 3.4 [P2] Visual regression (Argos) integration is partially wired

`pnpm test:argos` exists but there is no documented set of stories or screenshots feeding it. If Argos is being paid for, document which routes/components are captured and add a `.github/workflows/argos.yml` step.

---

## 4. Security

### 4.1 [P0] AWS credentials and the `stokd-cloud` profile

The repo's deploy script:

```
"deploy:prod": "cross-env ROOT_DOMAIN=sui.stokd.cloud,consulting.stokd.cloud AWS_PROFILE=stokd-cloud AWS_DEFAULT_PROFILE=stokd-cloud SST_BUILD=true dotenvx --debug run -- sst deploy --stage production"
```

pins `AWS_PROFILE` and `AWS_DEFAULT_PROFILE` to `stokd-cloud`. Per the user's global guidance, the default AWS profile is a customer's production account; everything Stoked must continue to use `--profile stokd-cloud`. Recommendations:

- Keep `AWS_PROFILE=stokd-cloud` explicit in deploy/removal scripts (don't rely on shell env).
- In `infra/index.ts`, add an explicit profile check on bootstrap: refuse to deploy if `AWS_PROFILE` is unset or set to `default`.
- Document this in `.stokd/meta/SC_CONTEXT.md` (project-level) so contributors and AI agents see it without needing to read a private global file.

### 4.2 [P0] Secrets scanning in CI

`packages/sui-media-api/` and the docs app rely on `dotenvx` for local config. Confirm:

- `.env*` files are present in `.gitignore` (verify).
- No real secrets are baked into `infra/secrets.ts` or `infra/envVars.ts` — those should reference SSM Parameter Store or AWS Secrets Manager, not literals.
- Add `gitleaks` (or `trufflehog`) to a CI job so accidental commits of credentials are blocked at PR time.

### 4.3 [P1] JWT and auth surfaces deserve a focused audit

`docs/src/modules/auth/authStore.ts` (referenced in `SC_TEST.md` §7.4) implements registration, login, JWT verification, and role determination — including auto-admin assignment for `@sui.stokd.cloud` emails (`determineRole`).

Concrete audit checklist:

- Verify the cross-origin `/api/auth/transfer` → `/api/auth/exchange` flow (`SC_FLOWS.md` §2.1) signs with an asymmetric key (RS256), not HS256 with a shared secret.
- Confirm 5-minute transfer tokens are single-use (nonce-tracked) — replay attacks otherwise become trivial.
- Add tests for `determineRole` covering the email domain matching to prevent regression.
- Confirm `bcryptjs` cost is ≥ 12 in production.

### 4.4 [P1] Webhook signature verification

`docs/pages/api/webhooks/` and `docs/src/modules/license/stripeClient.ts` handle Stripe webhooks. Confirm that `constructStripeWebhookEvent` is the only path that reaches license-activation logic (no body-only path), and that the webhook secret is rotated and stored in Secrets Manager.

### 4.5 [P2] CSP and frame-ancestors for the docs site

The docs app embeds CodeSandbox/StackBlitz iframes for live demos. Verify `docs/next.config.mjs` sets a CSP that allows those origins and disallows the rest, plus `frame-ancestors` to prevent the docs site itself from being framed by a malicious origin (clickjacking against authed routes).

### 4.6 [P2] Supply-chain hygiene

The `pnpm.overrides` block already captures known CVEs (axios, multer, tar, etc.). Add to that practice:

- Enable Dependabot or Renovate at low cadence (weekly batch PRs) instead of relying on manual override bumps.
- Run `pnpm audit --prod --audit-level=high` in CI; fail on high/critical.
- The `@minh.nguyen/plugin-transform-destructuring` override to a personal namespace fork is a supply-chain risk — document the exact reason and pin to a specific version, not a range.

---

## 5. Performance

### 5.1 [P1] WASM bundle size and editor cold-start

`packages/sui-video-renderer/wasm-preview` compiles to WASM for in-browser preview and is consumed by `sui-editor`.

- Build with `wasm-pack build --target bundler` (already done) ensures tree-shaking via webpack.
- Add a build-time check: fail if `pkg/sui_video_renderer_wasm_bg.wasm` exceeds (e.g.) 1.5 MB without an explicit override.
- `experiments.asyncWebAssembly: true` is already set in `docs/next.config.mjs`, but verify the WASM is loaded lazily via dynamic import only when the editor view is rendered, not on every Next.js page load.

### 5.2 [P1] Next.js docs site bundle

`pnpm docs:size-why` exists (`DOCS_STATS_ENABLED=true`). Recommendations:

- Add a CI job that runs `docs:size-why` on PRs touching `docs/` or any consumed `@stoked-ui/*` package and posts a delta comment.
- Audit `docs/src/modules/components/DiamondSponsors.js` and other always-loaded components for synchronous imports of heavy `@stoked-ui/editor` / `@stoked-ui/timeline` modules. The editor page should not pull the timeline engine on `/about`.

### 5.3 [P2] Sharp and ffmpeg in Lambda cold-starts

`packages/sui-media-api/src/lambda.ts` uses `@codegenie/serverless-express`. `sharp` and `fluent-ffmpeg` are heavyweight cold-start contributors. Mitigations:

- Use `arm64` Lambdas with `sharp` arm64 binaries (smaller and faster).
- Provisioned concurrency on the thumbnail-generation Lambda only, not the entire API.
- Consider splitting thumbnail generation into a dedicated Lambda triggered by S3 ObjectCreated events instead of an inline NestJS controller — keeps the synchronous request path lean.

### 5.4 [P2] MongoDB index hygiene

`packages/sui-media-api/src/database/` and `packages/sui-common-api/src/models/` define Mongoose schemas. There is no documented index-creation step. Add:

- A `pnpm db:indexes` script that connects and ensures all schema indexes (Mongoose's `autoIndex: false` in production is recommended; this script handles it explicitly).
- Document required indexes in `.stokd/meta/` so an operator can recreate them on a fresh cluster.

---

## 6. Documentation

### 6.1 [P1] Finish the per-package meta migration

The 0.4.0 meta layout moves module documentation from flat `.stokd/meta/SC_MODULE_SUI_*.md` files into per-package folders:

```
.stokd/meta/packages/<pkg>/
  SC_MODULE.md   ← what was previously SC_MODULE_SUI_<PKG>.md
  SC_TEST.md     ← per-package test plan
```

Currently every workspace package has both files (`sui-cdn`, `sui-common`, `sui-common-api`, `sui-docs`, `sui-editor`, `sui-file-explorer`, `sui-github`, `sui-media`, `sui-media-api`, `sui-timeline`, `sui-video-renderer`). The old top-level files (`SC_MODULE_SUI_COMMON.md`, `SC_MODULE_SUI_EDITOR.md`, etc.) show as deleted in `git status` and should be committed as removed.

Follow-ups:

- Commit the deletions so the migration lands cleanly. Do not restore.
- Grep `SC_OVERVIEW.md`, `SC_MODULES.md`, `SC_VIEWS.md`, `SC_FLOWS.md` for any remaining `SC_MODULE_SUI_` link and rewrite to `packages/<pkg>/SC_MODULE.md`.
- The aggregate index `SC_MODULES.md` should link to each per-package `SC_MODULE.md` rather than restating their contents — keep it as a thin table.
- The new `.stokd/meta/SC_PRODUCT_STOKED_UI_SUI.md` is the product-level brief — ensure `SC_OVERVIEW.md` references it once.

### 6.2 [P1] Per-package READMEs are missing or thin

Spot-checked `packages/sui-common/`, `packages/sui-cdn/`, `packages/sui-github/`. Each should have a one-page README covering:

- What the package does and what it does not.
- Public exports (one paragraph each).
- Peer-dep contract and example consumer code.
- Link to its `SC_MODULES.md` row.

The docs site is great for end-users but `npm` browsers see only `README.md`.

### 6.3 [P2] CONTRIBUTING.md should reference port 5199 and the WASM build

The dev server runs on **port 5199, never 3000**, and editor work requires `pnpm video-renderer:build-wasm` first. Both belong in `CONTRIBUTING.md` (and possibly the top of `README.md`) so contributors don't have to learn from incident.

---

## 7. Developer Experience

### 7.1 [P1] `pnpm dev` orchestration is fragile

The `dev` script is:

```
./scripts/kill-dev-services.sh && turbo run dev:prepare && turbo run dev --parallel --concurrency 15 --ui tui
```

Issues:

- `kill-dev-services.sh` is silent about what it kills — document its scope or replace with a `pidfile`-based approach so it cannot accidentally kill unrelated processes.
- `--concurrency 15` with 12 packages is wasteful on small machines; use `--concurrency=$(nproc)` or omit (Turbo's default heuristic).
- `dev:prepare` is required for downstream `dev` to work but the failure mode (when a package's `dev:prepare` errors) silently leaves a stale build. Add a top-level error gate.

### 7.2 [P2] Onboarding script

A `pnpm setup` (or `bin/bootstrap`) that:

1. Verifies pnpm 10.5.1+, Node 18.x, Rust toolchain, `wasm-pack`.
2. Runs `pnpm i`.
3. Runs `pnpm video-renderer:build-wasm`.
4. Optionally seeds local Mongo and starts the docs server.

Today this is implicit knowledge.

### 7.3 [P2] CI feedback loop

`.github/workflows/ci.yml` and `.github/workflows/test-coverage.yml` are the gating jobs. Recommend:

- Split lint + typecheck + unit + e2e into parallel jobs and use Turbo's remote cache (`turbo login` + `TURBO_TOKEN` in GH Actions) to make repeat builds near-instant.
- Add a `concurrency:` group keyed on PR ref so duplicate runs are auto-cancelled.

---

## 8. Release & Operations

### 8.1 [P1] Versioning split: alpha root, stable packages

`@stoked-ui/sui` is `0.1.0-alpha.5` (root, private). `@stoked-ui/media` and `@stoked-ui/media-api` are `1.0.0`. `@stoked-ui/timeline` is `0.1.3`. The mismatch is fine in principle (independent versioning via Lerna) but signals confidence levels inconsistently. Decide:

- Are `@stoked-ui/media` and `@stoked-ui/media-api` actually 1.x stable? If not, downgrade to 0.x to match the rest of the suite. Once 1.0 is published, semver-major bumps cost real downstream churn.
- Document the stability promise per package in each package's README and in `SC_MODULES.md`.

### 8.2 [P2] SST stage isolation

`pnpm deploy:prod` deploys to `--stage production`. Confirm there is a `staging` stage (and a documented `pnpm deploy:stage staging`) used as a pre-prod gate. Today only `deploy:local` and `deploy:prod` are clear.

---

## 9. Quick-Win Checklist (first sprint)

A focused punch list ordered by ROI:

1. Add `commitlint` + branch protection on `main` (P0, §2.1) — the most recent five commit subjects are `shove`, `shove`, `derp`, `chore: tag mongo clients for atlas attribution`, `shove`. This is still live.
2. Keep `AWS_PROFILE=stokd-cloud` explicit in deploy scripts and add a bootstrap guard (P0, §4.1).
3. Commit the per-package meta migration: stage the deletions of the old `SC_MODULE_SUI_*.md` files and the new `.stokd/meta/packages/<pkg>/SC_MODULE.md` files together (P1, §6.1).
4. Add `gitleaks` to CI (P0, §4.2).
5. Decide on `@stoked-ui/video-renderer-wasm` publication strategy or label the editor as monorepo-only (P1, §1.4).
6. Add per-package Jest configs for `sui-timeline`, `sui-editor`, `sui-common-api`, `sui-github`, `sui-docs` (P0, §3.1).
7. Audit `pnpm.overrides` and delete the dead `resolutions` block (P1, §2.2).
8. Link the new `SC_PRODUCT_STOKED_UI_SUI.md` brief from `SC_OVERVIEW.md` so contributors find it (P2, §6.1).

---

## 10. Cross-References

- Architecture overview: `.stokd/meta/SC_OVERVIEW.md`
- Product brief: `.stokd/meta/SC_PRODUCT_STOKED_UI_SUI.md` *(new in 0.4.0)*
- Module index: `.stokd/meta/SC_MODULES.md`
- Per-package module + test docs: `.stokd/meta/packages/<pkg>/SC_MODULE.md` and `.stokd/meta/packages/<pkg>/SC_TEST.md` *(new in 0.4.0)*
- Test plan (aggregate detail): `.stokd/meta/SC_TEST.md`
- Views and screens: `.stokd/meta/SC_VIEWS.md`
- User flows: `.stokd/meta/SC_FLOWS.md`
- Guardrails: `.stokd/meta/SC_CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`
