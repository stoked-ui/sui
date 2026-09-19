# SC_TEST — Testing Strategy & Implementation Plan

**Package:** `@stoked-ui/sui` (Monorepo Root — workspace-wide)
**Priority:** Critical
**Stack:** pnpm 10.5.1 / TypeScript 5.4 / React 18.3.1 / MUI 5.17.1 / NestJS 10 / Turbo 2.x / Mongoose 8 / Rust (cargo)
**Test tooling in the tree today:** Mocha 10 + Chai + `nyc` · Jest + `ts-jest` · Karma 6 (+ Playwright browsers) · Playwright 1.42 · webpack e2e/regression harness · cargo
**Date:** 2026-07-02 (re-verified live against the working tree)

> This document is the canonical testing contract for the monorepo. Per-module
> detail lives in each package's `.axioms.md` / `.stokd/meta/packages/**`. The
> behavioral acceptance surface these tests defend is enumerated in
> `.stokd/meta/SC_FLOWS.md`; the repo invariants they protect are in
> `.stokd/meta/SC_AXIOMS.md`.

---

## 1. Current State Assessment

### 1.1 The core problem, stated plainly

The repo has **four different, non-unified test harnesses** (a legacy
Material‑UI Mocha/Karma stack, per‑package Jest, docs‑app Mocha/Chai, and a Rust
cargo workspace) **and none of them run in CI on push/PR.** The `test-dev` job in
both `.github/workflows/ci.yml` and `.github/workflows/ci-check.yml` runs only:

```
pnpm install → pnpm build:ci → media-api openapi:validate
→ release:changelog → validate-declarations → release:tag --dryRun
```

No `jest`, no `mocha`, no `karma`, no `playwright`, no `cargo test` executes on
CI. Every test file below is **written but unguarded** — a regression that breaks
any of them merges green. **Closing this gap is Phase 0 and blocks everything
else** (see §8). Coverage numbers are meaningless while the suites don't gate merges.

### 1.2 Test infrastructure overview (verified 2026-07-02)

| Harness | Where | Config | Runner |
|---|---|---|---|
| **Legacy MUI unit** (jsdom) | `packages/sui-{editor,file-explorer,timeline}`, `docs/**`, `packages/**` glob | root `.mocharc.js` → `@stoked-ui/internal-test-utils/setupBabel` + `setupJSDOM` | `pnpm test:unit` (Mocha) |
| **Karma browser** | same specs, real browsers | `test/karma.conf.js` (Playwright-provided Chromium/Firefox, optional BrowserStack) | `pnpm test:karma` |
| **Per-package Jest** | `sui-common`, `sui-media`, `sui-stokd`, `sui-media-api` | each package's `jest.config.js` / `package.json#jest` | `pnpm --filter <pkg> test` |
| **Docs business logic** (Mocha/Chai) | `docs/src/modules/**` | root `.mocharc.js` | part of `pnpm test:unit` |
| **E2E rendering** | `test/e2e/**` | `test/e2e/.mocharc.js` + webpack + `serve` | `pnpm test:e2e` |
| **Visual regression** | `test/regressions/**` | `test/regressions/.mocharc.js` + webpack | `pnpm test:regressions` |
| **Website E2E** | `test/e2e-website/*.spec.ts` | `test/e2e-website/playwright.config.ts` | `pnpm test:e2e-website` |
| **Rust renderer** | `packages/sui-video-renderer/**/tests` | cargo workspace | `pnpm video-renderer:test` |

Shared render helpers: `@stoked-ui/internal-test-utils` (`packages-internal/test-utils`)
exports `createRenderer`, `createMount`, `describeConformance`, `describeConformanceUnstyled`,
and `KarmaReporterReactProfiler`. Conformance specs pull `describeConformance`
from `test/utils/describeConformance`.

### 1.3 Test file inventory (counted live 2026-07-02, not estimated)

| Package / area | Framework | Runtime suites | Notes |
|---|---|---:|---|
| `packages/sui-file-explorer` | Mocha/Karma (`createRenderer` + `describeConformance`) | **20** | best-covered UI package; conformance + hooks (`useFile`, `FileDropzone`) |
| `packages/sui-media` | Jest (`ts-jest` + jsdom) | **11** | has `test:ci` w/ coverage; `MediaFile` core model |
| `packages/sui-stokd` | Jest (`ts-jest` + jsdom) | **10** | NEW package; 2 pure-logic `.test.ts` + 8 component `.test.tsx`; **no `coverageThreshold`** |
| `packages/sui-media-api` | Jest (NestJS, `ts-jest`, node env) | **8** `*.spec.ts` + 1 e2e | `package.json#jest`, `testRegex: .*\.spec\.ts$` |
| `packages/sui-editor` | Mocha/Karma (`createRenderer`) | **5** | `EditorFile`, `useEditor`, plugin hooks (`useEditorMetadata`, `useEditorKeyboard`) |
| `packages/sui-common` | Jest (`ts-jest` + jsdom) | **4** | `src/__tests__/setup.ts`; incl. `CalendarBooking` timezone slot mapping |
| `packages/sui-timeline` | type-level spec only | **1** | `themeAugmentation.spec.ts` — **no runtime tests for the engine** |
| `docs/` (`stokedui-com`) | Mocha/Chai | **29** | business logic — see §1.4 |
| `packages/sui-video-renderer` | cargo | 4 compositor + 1 cli e2e + 1 wasm-preview | `blend_accuracy`, `transform_correctness`, `effects_{validation,integration}`, `cli/e2e`, `wasm-preview/browser_integration` |
| `packages-internal/sui-video-validator` | Mocha | 1 | `tests/validator.test.ts` |
| `packages/sui-common-api` | — | **0** | Mongoose models / DTOs untested (`swapId` wire contract at risk) |
| `packages/sui-github` | — | **0** | |
| `packages/sui-cdn` | — | **0** | `CdnApi` client — a 4-surface contract (`AX-REPO-CDN-API-CONTRACT`) |
| `packages/sui-docs` | — | **0** | `test` script = `exit 0` |

### 1.4 The `docs/` business-logic suite (highest-value surface)

`docs/` (the single canonical web app on **port 5199**) holds the revenue- and
security-critical logic and is the most valuable place to add coverage. Verified
suites include:

- **Audit bot (6 suites)** — `docs/src/modules/auditBot/`: `urlSafety.test.ts`,
  `tools.test.ts`, `reportValidation.test.ts`, `auditMailer.test.ts`,
  `leadFields.test.ts`, `llmClient.test.ts`. These defend `AX-AUDIT-BOT-URL-SAFETY`
  (SSRF/DNS-rebinding guards) and `AX-REPO-AUDIT-BOT-BEST-EFFORT`.
- **Commerce / clients** — `invoices/invoiceNormalization.test.ts`,
  `clients/contactUser.test.ts`, `products/StokdCloudPitch.test.tsx`.
- **Utils** — `getProductInfoFromUrl`, `replaceMarkdownLinks`, `helpers`,
  `siteRouteAudit`, `extractTemplates`, `componentDocs`, `findActivePage`.

**Still 0% covered in `docs/pages/api/**`:** the Stripe license webhook
(`webhooks/stripe.ts`, authoritative per `AX-REPO-STRIPE-LICENSE-COMMERCE`),
license activate/validate/deactivate, and non-media business routes. These are
the top priority (§7.1).

---

## 2. What Should Be Tested

### 2.1 Critical paths (P0 — must have)

1. **Stripe license commerce** (`docs/pages/api/webhooks/stripe.ts` + checkout/
   activate/validate/deactivate). Signature verification MUST NOT be bypassable;
   license state transitions must reconcile only through the webhook. Revenue +
   security critical. `AX-REPO-STRIPE-LICENSE-COMMERCE`.
2. **Audit-bot SSRF surface** (`auditBot/urlSafety.ts` + `tools.ts`). Keep the
   `isPrivateOrReservedIp` + undici `lookup`-hook DNS-rebinding closure and
   hop-by-hop redirect re-validation under test. `AX-AUDIT-BOT-URL-SAFETY`.
3. **`swapId` wire format** (`packages/sui-common-api/src/models/**`). Every
   Mongoose model must serialize `_id → id` and strip `__v`. Cross-package
   consumers depend on it. Currently **0 tests**. `AX-REPO-SWAP-ID-WIRE-FORMAT`.
4. **Media API dual-runtime parity** (`sui-media-api` Express `main.ts` vs.
   Lambda `lambda.ts`). Routes/DTO validation/auth must not diverge.
   `AX-REPO-MEDIA-API-DUAL-BUNDLE`.
5. **Media type contract** (`@stoked-ui/media`: `IMediaFile`, `MediaType`,
   `MediaFile`, `Command`). Shape changes ripple to editor/file-explorer/
   timeline/cdn/media-api. `AX-REPO-MEDIA-TYPE-COORDINATION`.
6. **CDN REST contract** (`/api/cdn/*` ↔ `@stoked-ui/cdn` `createCdnApi` ↔
   `packages-internal/cdn`). 4-surface coupling, **0 tests**. `AX-REPO-CDN-API-CONTRACT`.
7. **Timeline pixel/time math** (`packages/sui-timeline/src/utils/deal_data.ts`:
   `parserTimeToPixel`, `parserPixelToTime`, `startLeft`, `scaleWidth`). The
   engine has **no runtime tests** despite being the core interaction model.
8. **WASM layer contract** (`sui-editor/src/WasmPreview/actionMapper.ts` ↔
   `sui-video-renderer/wasm-preview/src/lib.rs`). Runtime-only boundary, drifts
   silently. `AX-REPO-WASMLAYER-CONTRACT`.

### 2.2 Edge cases (P1)

- License promo codes, already-consumed activations, expired/refunded seats.
- Audit-bot: credentialed URLs, `.local`/`.internal`/metadata hosts, redirect to
  private IP, oversized/streamed responses, request timeout.
- `MediaFile`: missing mime, zero-duration media, unknown `MediaType`, blob vs. URL.
- Timeline: zero/negative scale, sub-frame times, action drag past bounds.
- CDN: multipart upload resume, move into descendant, permission denial, path
  traversal in public-path resolver.

### 2.3 Integration points (P1)

- Mongoose `ref` ↔ registration matching (latent `UserRef`/`User` mismatch in
  `sui-common-api`, candidate axiom `AX-CANDIDATE-REPO-MONGOOSE-REF-REGISTRATION`).
- `.sue` project round-trip: editor export → `video-render` CLI (`cli/src/project.rs`).
- Media API client (`@stoked-ui/media` server subpath) ↔ `sui-media-api` routes.
- Browser barrels must not import server-only modules (`AX-REPO-BROWSER-NO-SERVER-DEPS`)
  — assert via build + a lint/grep test.

---

## 3. Recommended Framework & Tooling

### 3.1 Strategy — do NOT unify harnesses; unify the *entry point*

Rewriting 60+ legacy MUI conformance specs off Mocha/Karma is not worth it. The
pragmatic target:

- **New backend / Node / pure-logic code → Jest.** It's already the house style
  for `sui-common`, `sui-media`, `sui-media-api`, `sui-stokd`. Fast, isolated,
  `ts-jest`, good watch/coverage ergonomics.
- **New `docs/` business logic → Mocha/Chai**, co-located, matching the existing
  29 suites (they already run under root `.mocharc.js`).
- **UI conformance in `sui-editor`/`sui-file-explorer`/`sui-timeline` → keep
  Mocha + `createRenderer` + `describeConformance`.** Don't port; extend.
- **Rust renderer → cargo**, unchanged.
- **Website flows → Playwright** (`test/e2e-website`).

Unify only the **CI invocation**: one `turbo run test` that fans out to each
package's `test` script, plus explicit root steps for the Mocha globs, Playwright,
and cargo. `turbo.json`'s `test` task already exists (`dependsOn: ["build","^build"]`).

### 3.2 Dependencies already present (no adds needed for the core plan)

`mocha@^10.3`, `chai`, `nyc@^15.1`, `karma@^6.4`, `@playwright/test@1.42.1`,
`@types/mocha`, `eslint-plugin-mocha`, `ts-jest`/`jest` (per Jest package),
`identity-obj-proxy` (CSS mock), `@testing-library/jest-dom` (sui-stokd).

**Gaps to add only where a package gains its first Jest suite:** `jest`,
`ts-jest`, `@types/jest`, `jest-environment-jsdom` (frontend) or node env
(backend). Add `mongodb-memory-server` **only if** `sui-common-api` model tests
can't use the existing Dockerized Mongo path that `sui-media-api` already relies on.

---

## 4. Test File Organization & Naming

### 4.1 Frontend Jest packages (`sui-common`, `sui-media`, `sui-stokd`)

- Co-locate as `Foo.test.ts(x)` next to `Foo.ts(x)`, or under `src/__tests__/`.
- `testEnvironment: 'jsdom'`, `preset: 'ts-jest'`, `roots: ['<rootDir>/src']`.
- Setup file `src/__tests__/setup.ts` (matches `sui-common`); CSS via
  `identity-obj-proxy` in `moduleNameMapper`.

### 4.2 NestJS (`sui-media-api`, Jest, node env)

- Co-located `*.spec.ts` (config uses `testRegex: .*\.spec\.ts$`, `rootDir: src`).
- E2E under `test/*.e2e-spec.ts` via `test/jest-e2e.json` (`pnpm --filter @stoked-ui/media-api test:e2e`).

### 4.3 Docs (`docs/`, Mocha/Chai, co-located)

- `Foo.test.ts` / `Foo.test.tsx` beside the module. Runs under root `.mocharc.js`;
  `NODE_ENV=test`. Server-only tests use node globals, component tests get jsdom
  from `setupJSDOM`.

### 4.4 Legacy MUI UI packages (`sui-editor`, `sui-file-explorer`, `sui-timeline`)

- `Component.test.tsx` beside the component. `import { createRenderer } from '@stoked-ui/internal-test-utils'`
  and `describeConformance` from `test/utils/describeConformance`.

### 4.5 Naming & description convention

- File: `<Subject>.test.{ts,tsx}` (Jest/Mocha), `<Subject>.spec.ts` (NestJS),
  `<subject>.spec.ts` (Playwright website), `<subject>.rs` (cargo).
- `describe('<ComponentName />', …)` for components, `describe('functionName', …)`
  for utilities, `it('does X when Y', …)` — behavior-first, not implementation.

---

## 5. Mock & Stub Strategy

### 5.1 Backend (NestJS — `sui-media-api`)

- **Prefer real Mongo** (this account's standing preference — integration over
  mocks): the package already runs Mongo via Docker for integration specs. Reuse
  that path for `sui-common-api` model tests rather than mocking Mongoose.
- Mock only true externals: AWS SDK (S3/SES/SNS/Cognito) and Stripe. Use
  `@nestjs/testing` `Test.createTestingModule` with provider overrides.
- Never point tests at a real AWS account — enforce `AWS_PROFILE=stokd-cloud`
  discipline (`AX-REPO-AWS-PROFILE-STOKED`) and mock the SDK clients instead.

### 5.2 Docs (Mocha/Chai — `docs/src/modules/**` & `docs/pages/api/**`)

- Stripe: inject a fake `stripe` SDK; **assert signature verification runs** (no
  `--ignore-signature` bypass). Test the webhook against captured event fixtures.
- Audit bot: mock the LLM client and the undici agent's `lookup` to simulate
  DNS-rebinding; keep `validateReportShape` on real (untrusted) fixtures.
- SES/Telegram/Mongo side effects: assert best-effort (throw is caught + logged,
  turn still succeeds) — that IS the behavior under test (`AX-REPO-AUDIT-BOT-BEST-EFFORT`).

### 5.3 Frontend (React — Jest & Mocha)

- `createRenderer()` for MUI conformance (handles act/cleanup).
- Jest packages: `@testing-library/react` + `@testing-library/jest-dom`
  (already in `sui-stokd`). CSS/asset imports → `identity-obj-proxy`.
- Inter-package: mock sibling `@stoked-ui/*` barrels via `moduleNameMapper` or
  `jest.mock` only when the real barrel pulls heavy/native deps; otherwise import real.

### 5.4 Rust

- cargo tests use golden-image / numeric-tolerance fixtures
  (`compositor/tests/blend_accuracy.rs`); keep them hermetic (no network, fixtures
  under `cli/tests/fixtures`).

---

## 6. Coverage Targets

Coverage is only meaningful **after Phase 0** (tests gate merges). Targets by
priority and blast radius:

| Area | Statements | Rationale |
|---|---:|---|
| `docs/pages/api/webhooks/stripe.ts` + license flows | **90%** | revenue + security |
| `docs/src/modules/auditBot/{urlSafety,tools,reportValidation}` | **90%** | SSRF / untrusted input |
| `sui-common-api` models (`swapId`) | **85%** | cross-package wire contract |
| `sui-media` (`MediaFile`, types) | **80%** | core data model (has `test:ci`) |
| `sui-media-api` controllers/services | **80%** | dual-runtime API |
| `sui-timeline` `deal_data.ts` | **80%** | core math, currently 0% |
| `sui-cdn` `CdnApi` | **75%** | 4-surface contract |
| `sui-editor` / `sui-file-explorer` UI | **60%** | conformance-driven |
| `sui-stokd` | **70%** | add missing `coverageThreshold` |
| Repo aggregate (enforced) | **65%** | ratchet upward each phase |

Enforce via `coverageThreshold` in each Jest config and `nyc` `check-coverage`
for the Mocha globs. **`sui-stokd` currently declares no threshold — add one.**

---

## 7. Specific Test Cases to Implement First

### 7.1 Priority 1 — Stripe license + audit-bot SSRF (revenue + security, `docs/`)

- `webhooks/stripe.test.ts`: valid signed event mutates license; **tampered
  signature is rejected (401/400) and mutates nothing**; duplicate event is
  idempotent; refund → seat deactivated.
- `auditBot/urlSafety.test.ts` (extend): reject `http://user:pass@host`,
  `localhost`, `*.internal`, `169.254.169.254`; accept a public host. Already
  green today (`NODE_ENV=test npx mocha docs/src/modules/auditBot/urlSafety.test.ts`).
- `auditBot/tools.test.ts` (extend): the undici `lookup` hook classifies a
  rebinding answer as private and aborts the connect.

### 7.2 Priority 2 — `swapId` wire format (`sui-common-api`, new Jest suite)

- For each model under `src/models/**`: `model.toJSON()` returns `id`, no `_id`,
  no `__v`. Red first (no suite exists), then green after wiring Jest.

### 7.3 Priority 3 — Timeline math (`sui-timeline`, new Jest suite)

- `deal_data.test.ts`: `parserTimeToPixel(parserPixelToTime(x)) === x` round-trip;
  `startLeft`/`scaleWidth`/`scale` boundaries; zero/negative scale guarded.

### 7.4 Priority 4 — MediaFile core model (`sui-media`, extend Jest)

- Construct from URL and from blob; unknown `MediaType` handling; serialize →
  parse round-trip preserves `Command`/metadata.

### 7.5 Priority 5 — CDN contract (`sui-cdn`, new Jest suite)

- `createCdnApi` builds correct method → `/api/cdn/*` path/verb map; public-path
  resolver rejects traversal. Pair with a `docs/pages/api/cdn` handler test.

### 7.6 Priority 6 — Media API controllers (`sui-media-api`, extend `*.spec.ts`)

- Upload/metadata/thumbnail happy path + DTO validation rejection; `GET /v1/media/:id`
  returns `id` not `_id` (dual-runtime parity, `AX-REPO-MEDIA-API-DUAL-BUNDLE`).

### 7.7 Priority 7 — Editor / file-explorer conformance (Mocha, house style)

- Fill conformance gaps for churned components; `sui-timeline` gets its first
  `createRenderer` component test.

---

## 8. Implementation Phases (TDD: red → green per behavioral criterion)

### Phase 0 — Wire tests into CI (Days 1–3) — **PREREQUISITE, blocks all else**

Add a real test step to `.github/workflows/ci.yml` / `ci-check.yml`:

```yaml
- run: pnpm turbo run test --filter=!stokedui-com --continue
- run: pnpm test:unit:no-docs        # root Mocha globs (packages/**)
- run: pnpm --filter @stoked-ui/media-api test:ci
# add docs Mocha + cargo + playwright as separate gated jobs
```

Give every publishable package a `test` script (`"test": "jest"` where Jest,
`"test": "exit 0"` only where genuinely none yet), and add `test` to `turbo.json`
outputs/cache. Until this lands, all coverage targets are aspirational.

### Phase 1 — Revenue + security (Week 1–2)

Stripe webhook, audit-bot SSRF extensions, `swapId` model suite. §7.1–7.2.

### Phase 2 — Core-path coverage (Week 2–4)

Timeline math, MediaFile, CDN contract, media-api controllers. §7.3–7.6.

### Phase 3 — Components & plugins (Week 4–6)

Editor/file-explorer conformance gaps, timeline component test, sui-stokd
`coverageThreshold`. §7.7.

### Phase 4 — Integration & E2E (Week 6–8)

`.sue` editor→CLI round-trip, WASM layer contract, Playwright website flows,
Mongoose ref/registration audit.

---

## 9. Turbo & Command Reference

**Working today:**

```
pnpm test:unit                      # Mocha: packages/**/*.test + docs/**/*.test
pnpm test:unit:no-docs              # Mocha: packages only
pnpm test:coverage                  # nyc + Mocha (text)
pnpm test:coverage:ci               # nyc + Mocha (lcov)
pnpm test:karma                     # Karma browser (Playwright browsers)
pnpm test:e2e / test:regressions    # webpack + serve + Mocha
pnpm test:e2e-website               # Playwright (test/e2e-website)
pnpm --filter @stoked-ui/media test:ci     # Jest + coverage
pnpm --filter @stoked-ui/media-api test:ci # Jest + coverage (NestJS)
pnpm --filter @stoked-ui/common test        # Jest
pnpm --filter @stoked-ui/stokd test         # Jest
pnpm video-renderer:test            # cargo test --workspace
```

**Add after Phase 0** (each new-Jest package):
`"test": "jest"`, `"test:ci": "jest --ci --coverage --maxWorkers=2"`.

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **CI runs zero tests** — the #1 risk; regressions merge green | Phase 0, non-negotiable |
| Four harnesses confuse contributors | Decision tree in §3.1; document in each package README |
| Tests hit real AWS/prod | Mock SDK; enforce `AWS_PROFILE=stokd-cloud`; never live creds |
| Mongo integration tests flaky/slow | Reuse `sui-media-api` Dockerized Mongo; `--maxWorkers=2` |
| `sui-stokd` has no coverage floor | Add `coverageThreshold` in Phase 3 |
| Silent runtime contracts (WASM, media types, CDN, `.sue`) drift with no compile error | Explicit contract tests (§2.3, Phase 4) |
| Karma/BrowserStack cost & flakiness | Keep Karma opt-in locally; gate real UI on jsdom Mocha in CI |

---

## 11. Quick-Start: First 5 Files To Write

1. `docs/pages/api/webhooks/stripe.test.ts` — signed vs. tampered event (§7.1).
2. `packages/sui-common-api/jest.config.js` + first `src/models/**/*.test.ts`
   asserting `swapId` (`id`, no `_id`/`__v`) (§7.2).
3. `packages/sui-timeline/src/utils/deal_data.test.ts` — pixel/time round-trip (§7.3).
4. `packages/sui-cdn/src/CdnApi/CdnApi.test.ts` — method→route map (§7.5).
5. `.github/workflows/ci.yml` — add the `turbo run test` + Mocha steps (Phase 0).

Each must be observed **red before implementation, green after** (`AX §5`), and
every acceptance-test outcome (`red,red,green,…`) recorded per the axioms.
