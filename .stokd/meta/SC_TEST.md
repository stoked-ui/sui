# SC_TEST — Testing Strategy & Implementation Plan

**Package:** `@stoked-ui/sui` (Monorepo Root — workspace-wide)
**Priority:** Critical
**Stack:** pnpm 10.5.1 / TypeScript 5.4 / React 18.3 / NestJS 10 / Turbo 2.7 / Mocha + Chai + Jest + Playwright + Karma + cargo
**Date:** 2026-06-06 (re-verified live; **material change since 2026-05-28:** the `docs/` business layer is now actively tested — 13 Mocha/Chai suites in `docs/src/modules/**`, three added 2026-06-06 around the audit bot. Framework guidance for docs corrected accordingly. CI test-execution gap unchanged.)

---

## 1. Current State Assessment

### 1.1 Test Infrastructure Overview

The monorepo runs a **multi-framework** stack inherited from MUI origins, with newer browser/server packages standardised on Jest and the `docs/` app standardised on the root Mocha + Chai harness:

| Runner | Scope | Config Location |
|--------|-------|-----------------|
| **Mocha 10.3 + Chai 4.4** | Root-level unit/integration/regressions, `docs/src/modules/**` business logic, `sui-editor` & `sui-file-explorer` & `sui-github` | Root `.mocharc.js`, `package.json` scripts, `test/utils/mochaHooks.js` |
| **Jest 29.7 + ts-jest 29.1** | Per-package unit/service tests | `packages/sui-media/jest.config.js`, `packages/sui-common/jest.config.js`, `packages/sui-media-api/package.json` (inline `jest` field) |
| **Playwright 1.42** | Public docs site E2E | `test/e2e-website/playwright.config.ts` |
| **Karma 6.4** | Cross-browser headless tests (Chrome/Firefox) | `test/karma.conf.js`, `test/karma.conf.profile.js` |
| **nyc 15.1 + Istanbul** | Coverage for Mocha-based tests | Root `package.json` `nyc` config (`include: packages/sui*/src/**`) |
| **cargo test** | `packages/sui-video-renderer` (Rust) | `Cargo.toml` workspace — via `pnpm video-renderer:test` |

The root `.mocharc.js` auto-loads `@stoked-ui/internal-test-utils/setupBabel` + `setupJSDOM` and globs `extension: ['js','mjs','ts','tsx']` recursively, which is why `docs/**/*.test.ts` runs under Mocha with zero per-file config.

### 1.2 Test File Inventory (counted live 2026-06-06, not estimated)

Counts across `packages/` and `docs/` (excluding `node_modules`, `dist`, `build`, `.next`). A naive `find` for `*.spec.*` also matches `test/typescript/**` compile-only suites; the runtime-spec column below intentionally excludes those.

| Package / Area | `*.test.*` | `*.spec.*` (runtime) | Framework | Notes |
|----------------|-----------:|---------------------:|-----------|-------|
| `sui-media-api` | 0 | 9 (`src/`) + 1 e2e (`test/uploads-e2e.spec.ts`) | Jest + `@nestjs/testing` | auth, s3, health, uploads (controller+service), media, thumbnail-generation, metadata-extraction; `testRegex: .*\.spec\.ts$`, `testEnvironment: node` |
| `sui-media` | 11 | 0 | Jest + ts-jest + jsdom | `MediaCard`, `MediaViewer`, `WebUserDirectChat`, abstractions (Auth/Router/Queue/KeyboardShortcuts/Payment) |
| `sui-file-explorer` | 19 | 1 (type) | Mocha/Chai + `describeConformance` | Components, plugins, dropzone |
| `sui-editor` | 12 (8 MUI-fork integration in `test/integration/*.test.js` + 4 product) | 1 (type) | Mocha/Chai | `EditorFile`, `useEditor`, `useEditorMetadata`, `useEditorKeyboard`, plus inherited MUI menu/dialog/select harness |
| `sui-common` | 3 (SocialLinks suite) | 0 | Jest | `platformRegistry`, `SocialLinks`, `SocialLinkField` |
| `sui-github` | 8 (`test/integration/*.test.js`) | 0 | Mocha/Chai | Forked MUI menu/dialog/select harness — minimal product coverage |
| `sui-timeline` | 0 | 1 (themeAugmentation type spec) | Mocha (compile-only) | No runtime tests |
| `sui-common-api` | 0 | 0 | — | **Gap** — DTOs/models/Mongoose schemas untested |
| `sui-docs` | 0 | 0 | — | **Gap** — doc-tooling untested |
| `sui-cdn` | 0 | 0 | — | **Gap** — only `src/` + `sst-env.d.ts` |
| `sui-video-renderer` | Rust unit + integration | — | `cargo test` | Native side; WASM bridge not exercised in JS |
| **`docs/` (app)** | **13** | 0 | **Mocha/Chai** | **NEW since last snapshot** — see §1.3 |

**Workspace runtime totals (2026-06-06):** `packages/` ≈ **65** runtime JS/TS suites (53 `*.test.*` + 12 `*.spec.*`, excluding `test/typescript/**`), plus **13** in `docs/`, for **≈ 78** runtime suites. The bulk of `sui-editor` and `sui-github` test files remain forked MUI integration harnesses, not product-level coverage.

### 1.3 `docs/` Business-Logic Suite (the material change)

The repo guardrail (`.stokd/meta/SC_AXIOMS.md` → `AX-REPO-MEDIA-API-BOUNDARY`) puts all non-media business logic under `docs/pages/api/**` and `docs/src/modules/**`. That layer is now being tested with Mocha + Chai (run via root `.mocharc.js`, glob `docs/**/*.test.*`):

| Suite | `describe`/`it` | Subject under test |
|-------|----------------:|--------------------|
| `docs/src/modules/auditBot/tools.test.ts` | 2 / 10 | **NEW 2026-06-06** — `executeTool('fetch_company_site')` SSRF guard: rejects loopback/link-local (`169.254.169.254`), private ranges, non-public hosts before any network call |
| `docs/src/modules/auditBot/urlSafety.test.ts` | 4 / 12 | **NEW 2026-06-06** — URL allow/deny classification powering the SSRF guard |
| `docs/src/modules/auditBot/auditMailer.test.ts` | 1 / 6 | **NEW 2026-06-06** — audit-result email composition/dispatch |
| `docs/src/modules/clients/contactUser.test.ts` | 1 / 4 | client contact record handling |
| `docs/src/modules/invoices/invoiceNormalization.test.ts` | 1 / 3 | invoice normalisation |
| `docs/src/modules/utils/legalLocalization.test.ts` | 1 / 3 | legal-copy localisation |
| `docs/src/modules/deliverables/localFiles.test.ts` | 1 / 1 | local deliverable file resolution |
| `docs/src/modules/deliverables/cdnStorage.test.ts` | 1 / 2 | deliverable → CDN storage path |
| `docs/src/modules/deliverables/allowedOrigins.test.ts` | 1 / 6 | CDN/deliverable origin allow-list |
| `docs/src/modules/deliverables/htmlSnapshot.test.ts` | 1 / 6 | HTML snapshot generation |
| `docs/src/modules/cdn/cdnContents.test.ts` | 1 / 5 | CDN content listing |
| `docs/src/modules/joy/generateThemeAugmentation.test.ts` | 1 / 3 | Joy theme-augmentation codegen |
| `docs/src/modules/joy/literalToObject.test.ts` | 1 / 1 | literal→object AST transform |

**All 13 import `{ expect } from 'chai'`; zero use Jest.** This corrects the prior plan, which recommended Jest + `node-mocks-http` for the docs layer. The established, working pattern for docs **pure-logic** modules is Mocha/Chai — extend it, do not introduce a second runner for the same files.

**Still a gap in `docs/`:** `docs/src/modules/license/*` (revenue) and `docs/src/modules/auth/*` (security) remain untested. These are the highest-value targets (see §7).

### 1.4 Existing Test Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| `@stoked-ui/internal-test-utils` | `packages-internal/test-utils/` | Custom rendering, conformance, chai matchers, jsdom + Babel setup (re-exported by `test/utils/init.ts`, auto-required by `.mocharc.js`) |
| Root test harness | `test/utils/` | `describeConformance.ts`, `describeSlotsConformance.tsx`, `helperFn.ts`, `mochaHooks.js`, `setupJSDOM.js`, `setupBabel.js` |
| sui-media test utils | `packages/sui-media/src/__tests__/utils/test-utils.tsx` | Custom render w/ QueryClient, mock factories (`createMockFile`, `createMockVideoFile`, `createMockImageFile`) |
| sui-media setup | `packages/sui-media/src/__tests__/setup.ts` | Mocks: `matchMedia`, `IntersectionObserver`, `ResizeObserver`, `HTMLMediaElement`, `fetch` |
| Production-grade abstraction mocks | `packages/sui-media/src/abstractions/` | `createMockAuth`, `createMockPayment`, `createInMemoryQueue`, `noOpRouter`, `createInMemoryKeyboardShortcuts` (shipped — reuse in tests) |

### 1.5 CI Pipeline (current, verified 2026-06-06)

GitHub Actions in `.github/workflows/`: `ci.yml`, `ci-check.yml`, `claude-code-review.yml`, `claude.yml`, `codeql.yml`, `deploy-site.yml`, `publish-packages.yml`, `scorecards.yml`, `vale-action.yml`. **No `test-coverage.yml` or equivalent test job — Phase 0 below remains open.**

`ci.yml` runs a single matrix job named **`test-dev`** (macOS/Windows/Ubuntu) whose steps are:

```
pnpm install
pnpm build:ci
pnpm --filter @stoked-ui/media-api openapi:validate
pnpm release:changelog
pnpm validate-declarations
pnpm release:tag --dryRun
```

**It does NOT run Jest, Mocha, Playwright, Karma, or cargo tests.** `ci-check.yml` is a no-op required-check workaround for docs-only PRs.

`codecov.yml` exists but is minimal:

```yaml
coverage:
  status:
    project: { default: { target: auto, threshold: 1% } }
    patch: off
comment: false
```

> **Critical gap (unchanged):** no test job uploads coverage, `patch: off` and `comment: false` mean Codecov is effectively passive, and the `coverageThreshold: 80%` declared inside `packages/sui-media/jest.config.js` and `packages/sui-media-api`'s inline jest config is **not enforced anywhere**. Tests run only locally / in review. Closing this is Phase 0.

---

## 2. What Should Be Tested

### 2.1 Critical Paths (P0 — Must Have)

#### Backend API (`sui-media-api`)

| Critical Path | Service / Method | Risk if Untested |
|---------------|------------------|------------------|
| Upload lifecycle | `UploadsService.initiateUpload()` → `getMorePresignedUrls()` → `markPartCompleted()` → `completeUpload()` / `abortUpload()` (`src/uploads/uploads.service.ts`) | Data loss, S3 orphans, billing leak |
| Authentication flow | `AuthService.register()` → `login()` → `validateToken()` → `getUserById()` (`src/auth/auth.service.ts`) | Security breach |
| Media CRUD | `MediaService.create()` / `findAll()` / `findOne()` / `update()` / `remove()` / `restore()` (`src/media/media.service.ts`) | Core feature broken |
| S3 operations | `S3Service.createMultipartUpload()`, `getPresignedUploadUrls()`, `completeMultipartUpload()`, `deleteMediaAndThumbnails()` (`src/s3/s3.service.ts`) | Upload/download broken |
| Thumbnail generation | `ThumbnailGenerationService.generateThumbnail()`, `generateSpriteSheet()`, `getVideoMetadata()` (`src/media/thumbnail-generation.service.ts`) | No previews |
| Metadata extraction | `MetadataExtractionService` (`src/media/metadata/metadata-extraction.service.ts`) | Wrong metadata in DB |
| Health endpoint | `HealthController` (`src/health/health.controller.ts`) | Bad probes → cascading restarts |

Existing spec files (expand, do not duplicate):

```
packages/sui-media-api/src/auth/auth.service.spec.ts
packages/sui-media-api/src/health/health.controller.spec.ts
packages/sui-media-api/src/media/media.service.spec.ts
packages/sui-media-api/src/media/metadata/metadata-extraction.service.spec.ts
packages/sui-media-api/src/media/thumbnail-generation.service.spec.ts
packages/sui-media-api/src/s3/s3.service.spec.ts
packages/sui-media-api/src/uploads/uploads.controller.spec.ts
packages/sui-media-api/src/uploads/uploads.service.spec.ts
packages/sui-media-api/test/uploads-e2e.spec.ts
```

Modules with **zero coverage** in `sui-media-api/src/`: `blog/`, `clients/`, `database/`, `performance/`, `users/`, `app.module.ts`, `lambda.bootstrap.ts`, `openapi.module.ts`, `swagger.config.ts`. (Note: per `AX-REPO-MEDIA-API-BOUNDARY`, any non-media domain that has crept into `sui-media-api` should be reviewed for relocation to `docs/pages/api/**` rather than newly tested in place.)

#### Frontend Core (`sui-media`)

| Critical Path | File / Hook | Risk if Untested |
|---------------|-------------|------------------|
| MediaFile construction & serialization | `src/MediaFile/MediaFile.ts` (~1000 LOC), `src/MediaFile/IMediaFile.ts` | Data corruption across all consumers |
| MediaFile static factories | `MediaFile.fromUrl()`, `fromBlob()`, `fromFile()`, `fromDataTransfer()` | File ingest broken |
| Video/audio metadata extraction | `MediaFile.extractVideoMetadata()`, `extractAudioMetadata()` | Wrong duration/dimensions in timeline (known live bug — see project memory) |
| API client request/response | `src/api/media-api-client.ts`, `src/api/upload-client.ts` | Silent API failures |
| Upload state machine | `src/hooks/useMediaUpload.ts`, `src/hooks/useResumeUpload.ts` | Lost uploads |
| Media list/item hooks | `src/hooks/useMediaList.ts`, `src/hooks/useMediaItem.ts` | Browse broken |
| Optimistic delete | `src/hooks/useMediaDelete.ts` | Phantom items, stale UI |
| Framework abstractions | `src/abstractions/{Auth,Queue,Payment,Router,KeyboardShortcuts}.ts` | Host-app integration breaks (covered — keep current pass rate) |
| MediaCard video poster / first-frame | `src/components/MediaCard/MediaCard.tsx` (recently churned — see git log: poster/first-frame extraction) | Broken thumbnails, CORS frame-grab failures |

#### Docs Business Logic & Stores (Revenue + Auth-Critical) — `AX-REPO-MEDIA-API-BOUNDARY`

| Critical Path | File | Status | Risk |
|---------------|------|--------|------|
| License activation/validation/deactivation | `docs/src/modules/license/licenseStore.ts` | **Untested** | Revenue loss |
| License product catalogue | `licenseStore.ts → listLicenseProducts()/findLicenseProduct()` | **Untested** | Can't purchase |
| Stripe checkout & webhook | `docs/src/modules/license/stripeClient.ts`, `docs/pages/api/webhooks/stripe.ts` | **Untested** | Payment breakage (`AX-REPO-STRIPE-LICENSE-COMMERCE`) |
| User register/login/JWT | `docs/src/modules/auth/authStore.ts` | **Untested** | Account lockout / breach |
| Role determination | `authStore.ts → determineRole()` | **Untested** | Privilege escalation |
| Audit-bot SSRF guard | `docs/src/modules/auditBot/tools.ts` | **Covered** (`tools.test.ts`, `urlSafety.test.ts`) | Server-side request forgery — keep green, extend to new tools |
| Audit-bot email | `docs/src/modules/auditBot/auditMailer.ts` | **Covered** (`auditMailer.test.ts`) | Lead leakage / mis-delivery |
| Deliverables / CDN origin gating | `docs/src/modules/deliverables/*`, `docs/src/modules/cdn/*` | **Partially covered** | Content exposure |
| API route handlers | `docs/pages/api/**/*.ts` | **Untested at HTTP layer** | Public endpoint misbehaviour |

#### Editor (`sui-editor`)

| Critical Path | File |
|---------------|------|
| `VideoController` lifecycle (`preload`/`enter`/`start`/`update`/`leave`) | `src/Controllers/VideoController.ts` |
| `VideoController.getDrawData()` aspect handling (fill/contain/cover/none) | `src/Controllers/VideoController.ts` |
| Editor engine (dynamic WASM bundler vs web import — `AX-REPO-WASM-RENDERER-DEP`) | `src/EditorEngine/` |
| EditorFile open/save | `src/EditorFile/` |
| Controller dispatch (Video/Audio/Animation/Image) | `src/Controllers/` |

#### Timeline (`sui-timeline`)

| Critical Path | File |
|---------------|------|
| Playback state machine | `src/Controller/Controller.ts`, `Controllers.ts` |
| Audio controller / mix routing | `src/Controller/AudioController.ts` (single AudioContext destination — see project memory) |
| Sequencer / Engine | `src/Engine/Engine.ts` |
| Event emitter | `src/Engine/emitter.ts`, `events.ts` |
| Timeline state | `src/Timeline/TimelineState.ts` |
| Pixel/time math (single source of truth) | `src/utils/deal_data.ts` (`startLeft`, `scaleWidth`, `parserTimeToPixel`) |

#### File Explorer (`sui-file-explorer`)

| Critical Path | File |
|---------------|------|
| DnD reordering | `src/internals/plugins/useFileExplorerDnd/` |
| Selection (single/multi) | `src/internals/plugins/useFileExplorerSelection/` |
| Keyboard navigation | `src/internals/plugins/useFileExplorerKeyboardNavigation/` |
| Folder expansion | `src/internals/plugins/useFileExplorerExpansion/` |
| File CRUD | `src/internals/plugins/useFileExplorerFiles/` |

### 2.2 Edge Cases (P1 — Should Have)

| Category | Cases |
|----------|-------|
| **File types** | Zero-byte, >4 GB, unsupported MIME, corrupted headers |
| **Upload** | Network drop mid-upload, duplicate-by-hash (`UploadsService.findExistingByHash()`), concurrent uploads, resume after abort |
| **Timeline** | Empty timeline, 100+ tracks, overlapping actions, sub-frame precision, rapid seek, canvas first-frame rendering at t=0 (known unresolved bug — see project memory) |
| **Auth** | Expired JWT, revoked tokens, concurrent sessions, role escalation via direct API call |
| **License** | Expiry with grace period, duplicate activation on same hardware, license for nonexistent product |
| **SSRF / URL safety** | Loopback, link-local `169.254.169.254`, private CIDR, DNS-rebind, redirect-to-private, IPv6 mapped (extend `auditBot/urlSafety.test.ts` as new fetch tools land) |
| **Browser APIs** | IndexedDB quota exceeded, File System Access API unavailable, Web Worker errors |
| **Stripe** | Invalid webhook signature, duplicate events, checkout session timeout |
| **Media metadata** | `createSettings` Proxy not propagating through React state (known issue — guard via DOM video element fallback in tests) |

### 2.3 Integration Points (P1 — Should Have)

| Integration | Packages | Test Type |
|-------------|----------|-----------|
| Editor ↔ Timeline playback sync | `sui-editor` + `sui-timeline` | Integration (jsdom) |
| Editor ↔ FileExplorer asset panel | `sui-editor` + `sui-file-explorer` | Integration |
| WASM video renderer ↔ EditorEngine dynamic import | `sui-video-renderer` ↔ `sui-editor` | Smoke test in jsdom; full path via Playwright at port 5199 |
| MediaCard ↔ MediaViewer open | `sui-media` components | Component integration |
| Frontend ↔ Backend upload | `sui-media` hooks + `sui-media-api` | E2E (Playwright + ephemeral API) |
| License checkout → activation | `stripeClient` + `licenseStore` + `pages/api/license/*` + `pages/api/webhooks/stripe.ts` | Integration |
| Auth login → API route protection | `authStore` + `pages/api/**` | Integration |
| Common types across packages | `sui-common` + `sui-common-api` + consumers (`IMediaFile`, `MediaType` — `AX-REPO-MEDIA-TYPE-COORDINATION`) | Type-level (`tsc --noEmit`) |
| `swapId` wire format (`_id`→`id`, strip `__v`) | `sui-common-api` models → all API consumers (`AX-REPO-SWAP-ID-WIRE-FORMAT`) | Integration / contract |

---

## 3. Recommended Test Framework & Tooling

### 3.1 Framework Strategy

Two runners coexist by design. **Do not migrate existing suites and do not introduce a third runner.** Pick by location:

- **`docs/**` → Mocha + Chai.** The root `.mocharc.js` already discovers `docs/**/*.test.ts`, sets up Babel + jsdom, and 13 suites pass under it today. New docs pure-logic tests follow this pattern.
- **`packages/sui-media`, `sui-common`, `sui-media-api` → Jest.** These have Jest configs and coverage thresholds already.
- **New `packages/*` runtime tests → Jest** unless the package already uses the Mocha `describeConformance` harness (`sui-editor`, `sui-file-explorer`, `sui-github`), in which case stay on Mocha for consistency with the fork harness.

| Layer | Framework | Rationale |
|-------|-----------|-----------|
| Docs pure-logic modules (`docs/src/modules/**`) | **Mocha + Chai** | Established, zero-config under root `.mocharc.js` — matches the 13 existing suites |
| Docs API route handlers (`docs/pages/api/**`, HTTP-level) | Mocha + Chai + `node-mocks-http` | Test handlers without booting Next; same runner as the rest of docs |
| Unit (pure logic, packages) | Jest + ts-jest | Fast, built-in mocking, coverage thresholds |
| Unit (React components, packages) | Jest + `@testing-library/react` | Behaviour-first, no impl details |
| Unit (NestJS services) | Jest + `@nestjs/testing` | DI test modules — established in `sui-media-api` |
| Integration (multi-component) | Jest + `@testing-library/react` | Same env, no extra tooling |
| Conformance | Mocha + `describeConformance` | Keep MUI-style harness in `sui-file-explorer`, `sui-editor`, `sui-github` |
| E2E (website) | Playwright | Configured at `test/e2e-website/`; base URL `http://localhost:5199` |
| Type correctness | `tsc --noEmit` over `*.spec.ts` | Existing pattern across timeline/editor |
| Native crate | `cargo test --workspace` | Wired via `pnpm video-renderer:test` |

### 3.2 Dependencies to Add

Per package that lacks Jest but needs runtime React/logic tests (`sui-timeline`, `sui-common-api`, `sui-cdn`):

```jsonc
{
  "devDependencies": {
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/user-event": "^14.5.0",
    "identity-obj-proxy": "^3.0.0",
    "@types/jest": "^29.5.0"
  }
}
```

Docs API-route + store testing (`docs/`, Mocha/Chai-compatible only — **no Jest deps**):

```jsonc
{
  "devDependencies": {
    "mongodb-memory-server": "^9.0.0",  // integration against real Mongo (AX-REPO-MONGODB-BUSINESS-DATA)
    "node-mocks-http": "^1.14.0",       // HTTP-level handler tests, runner-agnostic
    "sinon": "^17.0.0"                   // stubbing Stripe/Mongo at the module boundary in Mocha
  }
}
```

> Account note: per project memory, this account has **Claude Max, not the Anthropic API**, and favours integration tests against real databases over mocks. Prefer `mongodb-memory-server` (or a Docker Mongo, as `sui-media-api` already does) over hand-mocked Mongoose models where practical.

---

## 4. Test File Organization & Naming

### 4.1 Frontend Packages (Jest)

```
packages/sui-{name}/
├── src/
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   └── __tests__/
│   │       ├── ComponentName.test.tsx        # Render/behaviour
│   │       └── ComponentName.utils.test.ts   # Pure logic
│   ├── internals/plugins/usePluginName/
│   │   └── usePluginName.test.tsx
│   ├── hooks/__tests__/useHookName.test.tsx
│   └── __tests__/
│       ├── setup.ts                          # Jest setupFilesAfterEnv
│       └── utils/test-utils.tsx              # Custom render + factories
├── test/{integration,typescript}/
├── jest.config.js
└── package.json
```

### 4.2 NestJS (`sui-media-api`, Jest, co-located)

```
packages/sui-media-api/
├── src/{module}/
│   ├── {module}.service.ts
│   ├── {module}.service.spec.ts              # co-located unit (testRegex: .*\.spec\.ts$)
│   └── {module}.controller.spec.ts
├── test/
│   ├── jest-e2e.json
│   └── *-e2e.spec.ts                         # uploads-e2e.spec.ts
└── package.json                              # inline jest field
```

### 4.3 Docs (`docs/`, Mocha/Chai, co-located)

```
docs/src/modules/{domain}/
├── {thing}.ts
└── {thing}.test.ts                           # co-located, import { expect } from 'chai'
docs/pages/api/{domain}/
└── (handler tests live beside modules or under docs/test/api/)
```

### 4.4 Naming

| Test Type | Pattern | Example |
|-----------|---------|---------|
| Component unit (Jest) | `ComponentName.test.tsx` | `MediaViewer.test.tsx` |
| Pure logic (Jest) | `module.test.ts` | `MediaCard.utils.test.ts` |
| Docs pure logic (Mocha) | `module.test.ts` | `licenseStore.test.ts` |
| React hook | `useHookName.test.tsx` | `useMediaUpload.test.tsx` |
| NestJS service/controller | `name.service.spec.ts` / `name.controller.spec.ts` | `uploads.service.spec.ts` |
| NestJS E2E | `*-e2e.spec.ts` | `uploads-e2e.spec.ts` |
| Playwright E2E | `*.spec.ts` | `editor-workflow.spec.ts` |
| Type-level | `*.spec.ts` (compile-only) | `themeAugmentation.spec.ts` |

### 4.5 Description Convention

```ts
describe('UploadsService', () => {
  describe('initiateUpload', () => {
    it('creates a session with the correct part count for a file size', () => { /* ... */ });
    it('returns presigned URLs for the first batch of parts', () => { /* ... */ });
    it('detects a duplicate via findExistingByHash', () => { /* ... */ });
  });
});
```

---

## 5. Mock & Stub Strategy

### 5.1 Backend (NestJS — `sui-media-api`)

Use the established `Test.createTestingModule` pattern (see `auth.service.spec.ts`, `s3.service.spec.ts`):

```ts
const moduleRef = await Test.createTestingModule({
  providers: [
    ServiceUnderTest,
    { provide: S3Service, useValue: mockS3Service },
    { provide: ConfigService, useValue: mockConfigService },
    { provide: getModelToken('Media'), useValue: mockMediaModel },
  ],
}).compile();
```

| Dependency | Strategy | Reason |
|------------|----------|--------|
| `@aws-sdk/client-s3` | Mock `S3Service` at the DI boundary | Never hit real AWS (`AX-REPO-AWS-PROFILE-STOKED`) |
| MongoDB / Mongoose | `getModelToken()` mock for unit; `mongodb-memory-server` / Docker Mongo for integration | Fast units; faithful queries in integration |
| Stripe SDK | Mock at service boundary | Never hit real Stripe |
| `fluent-ffmpeg` | Mock at `ThumbnailGenerationService` boundary | Binary not present in CI |
| `sharp` | Mock for unit; real for integration | Native deps |
| `ConfigService` | Static test values | Determinism |

### 5.2 Docs (Mocha/Chai — `docs/src/modules/**`)

Stub external boundaries with `sinon` (or hand-rolled fakes, as existing suites do):

```ts
import sinon from 'sinon';
// Mongo: stub the getDb/collection accessor, not the driver
const dbStub = { collection: sinon.stub().returns({ findOne: sinon.stub().resolves(null) }) };
// Stripe: stub stripeClient at the module boundary
sinon.stub(stripeClient, 'constructStripeWebhookEvent').returns(fakeEvent);
```

For SSRF/URL tests (`auditBot`), assert the guard rejects **before** any network call — never let the test depend on a real socket (see `tools.test.ts`'s `expectBlocked` helper, which matches on `/not allowed|blocked|unsafe|not.*public|private/i`).

### 5.3 Frontend (React — `sui-media` and downstream, Jest)

Browser APIs — reuse `packages/sui-media/src/__tests__/setup.ts`:

```ts
global.ResizeObserver = jest.fn().mockImplementation(() => ({ observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() }));
global.IntersectionObserver = jest.fn().mockImplementation(() => ({ observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() }));
Object.defineProperty(HTMLMediaElement.prototype, 'play',  { value: jest.fn() });
Object.defineProperty(HTMLMediaElement.prototype, 'pause', { value: jest.fn() });
```

Framework abstractions — use the production mocks shipped by `sui-media`:

```ts
import { createMockAuth }                  from '@stoked-ui/media/abstractions/Auth';
import { createInMemoryQueue }             from '@stoked-ui/media/abstractions/Queue';
import { createInMemoryKeyboardShortcuts } from '@stoked-ui/media/abstractions/KeyboardShortcuts';
import { noOpRouter }                      from '@stoked-ui/media/abstractions/Router';
import { createMockPayment }               from '@stoked-ui/media/abstractions/Payment';
```

IndexedDB (`LocalDb` in `sui-common`): `import 'fake-indexeddb/auto';`

File System Access API:

```ts
window.showOpenFilePicker = jest.fn().mockResolvedValue([{
  getFile: jest.fn().mockResolvedValue(new File(['x'], 'test.mp4', { type: 'video/mp4' })),
  createWritable: jest.fn().mockResolvedValue({ write: jest.fn(), close: jest.fn() }),
}]);
```

WASM (`@stoked-ui/video-renderer-wasm`) — mock the dynamic import at the consumer boundary:

```ts
jest.mock('@stoked-ui/video-renderer-wasm', () => ({
  init: jest.fn().mockResolvedValue(undefined),
  Renderer: class { render = jest.fn(); free = jest.fn(); },
}));
```

Test data factories — `packages/sui-media/src/__tests__/utils/test-utils.tsx`:

```ts
import { createMockFile, createMockVideoFile, createMockImageFile, renderWithProviders } from '../utils/test-utils';
```

### 5.4 Inter-Package Mocking (Jest)

```ts
jest.mock('@stoked-ui/timeline', () => ({
  Timeline: ({ children }: any) => <div data-testid="timeline">{children}</div>,
  useTimeline: () => ({ state: 'idle', currentTime: 0 }),
}));
jest.mock('@stoked-ui/file-explorer', () => ({
  FileExplorer: ({ children }: any) => <div data-testid="file-explorer">{children}</div>,
}));
```

### 5.5 CSS / Asset Mocking

Already wired via `identity-obj-proxy` (`sui-media`, `sui-common`):

```js
moduleNameMapper: { '\\.(css|less|scss|sass)$': 'identity-obj-proxy' }
```

---

## 6. Coverage Targets

### 6.1 Per-Package Targets

| Package / Area | Lines | Branches | Functions | Status | Rationale |
|----------------|------:|---------:|----------:|--------|-----------|
| `sui-media-api` | **80%** | **80%** | **80%** | Declared in inline jest config — **not CI-enforced** | Security/revenue critical |
| `sui-media` | **80%** | **80%** | **80%** | Declared in `jest.config.js` — **not CI-enforced** | Core data layer |
| Docs business logic (`docs/src/modules/**`) | **75%** | **70%** | **75%** | Partially met (auditBot/deliverables/cdn/invoices/clients); license+auth at 0% | Revenue + security |
| `sui-common` | **75%** | **70%** | **75%** | Target | Foundation utilities |
| `sui-common-api` | **85%** | **80%** | **85%** | Target | Pure DTOs/models |
| `sui-file-explorer` | **70%** | **65%** | **70%** | Target | Plugin system, DnD edge cases |
| `sui-timeline` | **65%** | **60%** | **65%** | Target | Heavy DOM interaction |
| `sui-editor` | **60%** | **55%** | **60%** | Target | Orchestrator — integration-first |
| `sui-github` | **50%** | **45%** | **50%** | Target | Display-only |
| `sui-docs` / `sui-cdn` | **40%** | **35%** | **40%** | Target | Doc tooling, low risk |

### 6.2 Canonical Jest Config Template

Mirror `packages/sui-media/jest.config.js`:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react', esModuleInterop: true, module: 'commonjs', moduleResolution: 'node' } }],
  },
  moduleNameMapper: { '\\.(css|less|scss|sass)$': 'identity-obj-proxy' },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.stories.tsx',
    '!src/**/index.ts', '!src/**/*.types.ts', '!src/**/themeAugmentation/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: { global: { branches: 70, functions: 70, lines: 70, statements: 70 } },
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/'],
};
```

### 6.3 CI Pipeline — Target State

Today only `ci.yml` (`test-dev` job) and `ci-check.yml` run; neither executes the test suites.

Proposed `.github/workflows/test-coverage.yml` (new):

```
push/PR  → test-backend       (sui-media-api: pnpm --filter @stoked-ui/media-api test:ci)   → Codecov [backend]
         → test-frontend      (sui-media:    pnpm --filter @stoked-ui/media test:ci)        → Codecov [frontend]
         → test-common        (sui-common:   pnpm --filter @stoked-ui/common test)          → Codecov [common]
         → test-docs          (Mocha: pnpm test:unit, docs/src/modules/** + packages Mocha) → nyc lcov → Codecov [docs]
         → test-mocha-pkgs    (sui-file-explorer / sui-editor / sui-github conformance)     → Codecov [components]
         → coverage-report    (combined; flip codecov.yml comment:true, patch: target)
         → test-e2e           (Playwright @ 5199)                                            → on merge to main
         → test-rust          (cargo test --workspace)                                       → cargo-llvm-cov
```

Also flip `codecov.yml` from `comment: false` / `patch: off` to a patch target once a baseline lands.

---

## 7. Specific Test Cases to Implement First

### 7.1 Priority 1 — License & Auth Stores (Revenue + Security Critical, still 0% in `docs/`)

These are **Mocha/Chai** (co-located, `import { expect } from 'chai'`) to match the existing docs suites.

#### `docs/src/modules/license/licenseStore.test.ts` — NEW

```ts
describe('licenseStore', () => {
  describe('activateLicense', () => {
    it('activates a valid license key on a new hardware ID');
    it('rejects activation for an already-active license on different hardware');
    it('rejects activation for an expired license');
    it('rejects activation for a revoked license');
    it('rejects activation for a nonexistent license key');
  });
  describe('validateLicense', () => {
    it('returns valid for an active license within expiration');
    it('returns expired past expiration date');
    it('returns valid during grace period after expiration');
    it('returns invalid for a deactivated license');
  });
  describe('deactivateLicense', () => {
    it('deactivates an active license');
    it('no-ops for an already deactivated license');
  });
  describe('createLicense / listLicenseProducts', () => {
    it('generates a unique license key');
    it('sets initial status to pending');
    it('returns all products and normalises via normalizeLicenseProduct()');
  });
  describe('renewLicenseBySubscriptionId', () => {
    it('extends expiration for an active subscription');
    it('reactivates an expired license on renewal');
  });
});
```

#### `docs/src/modules/license/stripeClient.test.ts` — NEW

```ts
describe('stripeClient', () => {
  describe('createCheckoutSession', () => {
    it('creates a session with the correct price and metadata');
    it('includes the license product ID in metadata');
    it('uses subscription mode for recurring products');
    it('uses payment mode for one-time products');
  });
  describe('constructStripeWebhookEvent', () => {
    it('verifies a valid webhook signature');
    it('rejects an invalid signature');           // AX-REPO-STRIPE-LICENSE-COMMERCE
    it('rejects an expired timestamp');
  });
});
```

#### `docs/src/modules/auth/authStore.test.ts` — NEW

```ts
describe('authStore', () => {
  describe('register', () => {
    it('hashes password with bcrypt');
    it('rejects duplicate email');
    it('assigns admin role for @sui.stokd.cloud emails');
    it('assigns client role for other domains');
    it('generates Gravatar URL from email');
  });
  describe('login', () => {
    it('returns JWT and user for valid credentials');
    it('rejects login with wrong password');
    it('rejects login for nonexistent email');
  });
  describe('verifyToken', () => {
    it('decodes valid JWT and returns user');
    it('rejects expired JWT');
    it('rejects malformed JWT');
  });
  describe('determineRole', () => {
    it('returns admin for @sui.stokd.cloud');
    it('returns client for other domains');
  });
});
```

### 7.2 Priority 2 — MediaFile (Core Data Model)

#### `packages/sui-media/src/MediaFile/__tests__/MediaFile.test.ts` — NEW (Jest)

```ts
describe('MediaFile', () => {
  describe('constructor', () => {
    it('constructs from fileBits with correct metadata');
    it('generates a unique id on creation');
    it('detects mediaType from MIME type');
    it('sets created timestamp to Date.now() by default');
  });
  describe('fromUrl', () => {
    it('fetches file from URL and creates MediaFile');
    it('applies exponential backoff on transient failures');
    it('throws after max retries');
    it('uses cache when file already fetched');
  });
  describe('fromBlob / fromFile / fromDataTransfer', () => {
    it('creates MediaFile from Blob with correct properties');
    it('wraps a native File preserving its metadata');
    it('extracts files from a DataTransfer event');
    it('filters out files in FILES_TO_IGNORE');
  });
  describe('extractVideoMetadata / extractAudioMetadata', () => {
    it('extracts duration, width, height from video element');
    it('detects audio tracks via hasAudio()');
    it('handles createSettings Proxy not propagating (DOM fallback path)'); // known issue
  });
  describe('cache', () => {
    it('stores files in static cache by id');
    it('returns cached file on duplicate access');
  });
});
```

### 7.3 Priority 3 — Backend API Expansion (Jest)

Expand `packages/sui-media-api/src/uploads/uploads.service.spec.ts` to cover `initiateUpload` part-count math, `getMorePresignedUrls`, `markPartCompleted`, `completeUpload` (incl. incomplete-parts failure), `abortUpload`, `syncWithS3`, and `findExistingByHash` dedup. Add specs for any media-domain modules still at zero coverage; relocate non-media modules per `AX-REPO-MEDIA-API-BOUNDARY` before testing in place.

### 7.4 Priority 4 — VideoController (modified file, live bugs) — Jest

```ts
describe('VideoController', () => {
  describe('getDrawData', () => {
    it('calculates correct draw dimensions for fill/contain/cover/none mode');
    it('handles aspect-ratio mismatch');
  });
  describe('preload', () => {
    it('loads video element and extracts metadata');
    it('does NOT block when ScreenshotStore is empty (count > 0 guard)'); // regression
  });
  describe('state machine', () => {
    it('transitions through enter → start → update → leave');
    it('renders all tracks at t=0 (canvas first-frame regression)'); // known unresolved
  });
});
```

### 7.5 Priority 5 — Common Utilities (Jest)

`FetchBackoff` (success first try, retry-then-succeed, exponential backoff, max-retry, no-retry-on-4xx, retry-on-5xx), plus `LocalDb`, `Mime`, `Colors`.

### 7.6 Priority 6 — Timeline Engine (add Jest to `sui-timeline`)

`Controllers` (idle→playing→paused, seek, loop, state-change events, single-AudioContext routing) and `Engine` (sequencing order, overlapping actions, event timestamps, clean stop, dynamic track add/remove).

### 7.7 Priority 7 — Common-API DTOs / Models (add Jest)

Mongoose schema validation (required/defaults/enums), `class-transformer`/`class-validator` DTO behaviour, custom decorators, and the `swapId` JSON serialization contract (`_id`→`id`, no `__v` — `AX-REPO-SWAP-ID-WIRE-FORMAT`).

### 7.8 Priority 8 — File Explorer Plugins (Mocha, existing house style)

DnD reorder, selection, keyboard navigation, expansion in `packages/sui-file-explorer/src/internals/plugins/`.

---

## 8. Implementation Phases

### Phase 0 — Wire Tests Into CI (Days 1-3) — **PREREQUISITE**

| Task | Deliverable |
|------|-------------|
| Add `.github/workflows/test-coverage.yml` running Jest (`sui-media-api`, `sui-media`, `sui-common`) **and** Mocha (`pnpm test:unit` for docs + component packages) | New workflow file |
| Enable Codecov upload + flip `codecov.yml` (`comment: true`, set `patch` target) | `codecov.yml` edit + upload step |
| Add `pnpm test:jest` root script driving Turbo + a `test:jest`/`test:jest:ci` task in `turbo.json` | `turbo.json` + root `package.json` |
| Fail PR on coverage delta drop / threshold breach | Codecov comment + threshold check |

### Phase 1 — License + Auth + MediaFile (Week 1-2)

Highest risk reduction per effort: revenue/security critical, 0% today. `licenseStore.test.ts`, `stripeClient.test.ts`, `authStore.test.ts` (Mocha/Chai in `docs/`), `MediaFile.test.ts` (Jest). Add Jest to `sui-timeline`, `sui-common-api`, `sui-cdn`.

### Phase 2 — Critical-Path Coverage (Week 2-4)

Expand the 9 `sui-media-api` specs to the 80% threshold; API client + upload hook tests (`sui-media`); `FetchBackoff`/`LocalDb`/`Mime` (`sui-common`); DTO/schema + `swapId` (`sui-common-api`); extend `auditBot`/`deliverables` docs suites to new tools.

### Phase 3 — Components, Plugins, Editors (Week 4-6)

`VideoController.test.ts`; timeline `Controllers`/`Engine`; file-explorer plugin tests.

### Phase 4 — Integration & E2E (Week 6-8)

Editor ↔ Timeline integration; frontend ↔ backend upload E2E; license checkout → activation E2E at `localhost:5199`; cross-package type tests.

---

## 9. Turbo Pipeline Configuration

Current `turbo.json` has only a `test` task (`dependsOn: ["build", "^build"]`). Add Jest orchestration:

```jsonc
{
  "tasks": {
    "test:jest":    { "cache": true,  "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "test:jest:ci": { "cache": false, "dependsOn": ["^build"], "outputs": ["coverage/**"] }
  }
}
```

---

## 10. Test Commands Reference

### Working Today

```bash
pnpm test                          # node scripts/test.mjs
pnpm test:unit                     # Mocha across packages + docs (incl. docs/src/modules/**)
pnpm test:unit:no-docs             # Mocha across packages only
pnpm test:coverage                 # Mocha + nyc (Istanbul)
pnpm test:karma                    # Browser tests (Chrome/Firefox headless)
pnpm test:e2e                      # webpack build + Mocha + serve
pnpm test:e2e-website              # Playwright @ port 5199 (build target)
pnpm test:e2e-website:dev          # Playwright against local dev server
pnpm test:regressions              # Visual regressions
pnpm tc <pattern>                  # Interactive mocha runner (test/cli.js)

pnpm --filter @stoked-ui/media test                  # Jest
pnpm --filter @stoked-ui/media test:ci               # Jest --ci --coverage --maxWorkers=2
pnpm --filter @stoked-ui/media-api test              # Jest (testRegex .*\.spec\.ts$)
pnpm --filter @stoked-ui/media-api test:cov          # Jest --coverage
pnpm --filter @stoked-ui/media-api test:e2e          # Jest @ test/jest-e2e.json
pnpm --filter @stoked-ui/common test                 # Jest

pnpm video-renderer:test                             # cargo test --workspace
```

Run a single docs suite during development:

```bash
pnpm mocha docs/src/modules/auditBot/tools.test.ts   # via root .mocharc.js (Babel + jsdom auto-loaded)
```

### Add After Phase 0

```bash
"test:jest":     "turbo run test:jest --continue --ui tui"
"test:jest:ci":  "turbo run test:jest:ci --continue --ui tui"
# per-package, where missing: "test": "jest", "test:ci": "jest --ci --coverage --maxWorkers=2"
```

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **No test job in CI** | Coverage thresholds toothless; the 13 new docs suites and all Jest suites never run on PRs | Phase 0 — add `test-coverage.yml` before further test work |
| `codecov.yml` passive (`comment:false`, `patch:off`) | Coverage deltas invisible in review | Flip in Phase 0 once a baseline lands |
| Dual framework (Mocha for docs/components, Jest for packages) | Onboarding friction | Pick runner by location (§3.1); never add a third |
| jsdom limits for DnD/gesture | False CI passes | Pure-logic units + Playwright for gesture flows |
| SSRF tests relying on real sockets | Flaky / unsafe | Assert guard rejects before network (`expectBlocked` in `tools.test.ts`) |
| Flaky async timing | CI trust erosion | `waitFor`/`findBy*`; mock timers for animations |
| `mongodb-memory-server` startup time | Slow CI | Share connection via global setup; mock model token for pure units |
| Inter-package mock drift | Tests pass, prod breaks | Smoke tests importing real packages; type tests catch signature drift (`AX-REPO-MEDIA-TYPE-COORDINATION`) |
| Stripe/AWS/FFmpeg mocks diverging from real APIs | Prod incidents | Pin SDK versions; contract tests against sandbox |
| WASM dynamic-import path differs (bundler vs web) | Editor breaks at runtime, not in tests | Smoke tests for both targets (`AX-REPO-WASM-RENDERER-DEP`) |
| `createSettings` Proxy not propagating through React state | Detail views show stale metadata | Test both Proxy path and DOM-element fallback |

---

## 12. Quick-Start: First 5 Files to Write

Ranked by risk-reduction per effort:

| # | File | Why First |
|---|------|-----------|
| 1 | `.github/workflows/test-coverage.yml` | Without CI enforcement every test (incl. the 13 new docs suites) is a nice-to-have. Phase 0 unblocks everything. |
| 2 | `docs/src/modules/license/licenseStore.test.ts` | Revenue-critical, 0% coverage, pure functions, Mocha/Chai like its neighbours, no infra |
| 3 | `docs/src/modules/auth/authStore.test.ts` | Security-critical, 0% coverage, pure functions |
| 4 | `packages/sui-media/src/MediaFile/__tests__/MediaFile.test.ts` | Core data model used by every consumer; ~1000 LOC untested |
| 5 | `packages/sui-editor/src/Controllers/__tests__/VideoController.test.ts` | Recently churned file with two known live bugs (canvas first-frame at t=0; ScreenshotStore guard) — pin behaviour |
