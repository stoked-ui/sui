# SC_TEST — Testing Strategy & Implementation Plan

**Package:** `@stoked-ui/sui` (Monorepo Root — workspace-wide)
**Priority:** Critical
**Stack:** pnpm 10.5.1 / TypeScript 5.4 / React 18 / NestJS 10 / Turbo / Mocha + Jest + Playwright
**Date:** 2026-05-28 (re-verified; inventory, framework assignments, tool versions, and CI gap unchanged since 2026-05-21)

---

## 1. Current State Assessment

### 1.1 Test Infrastructure Overview

The monorepo runs a **multi-framework** stack inherited from MUI origins, with newer packages standardised on Jest:

| Runner | Scope | Config Location |
|--------|-------|-----------------|
| **Mocha 10.3 + Chai 4.4** | Root-level unit/integration/regressions, `sui-editor` & `sui-file-explorer` & `sui-github` | Root `package.json` scripts, `test/karma.conf.js`, `test/utils/mochaHooks.js` |
| **Jest 29.7 + ts-jest 29.1** | Per-package unit/service tests | `packages/sui-media/jest.config.js`, `packages/sui-common/jest.config.js`, `packages/sui-media-api/package.json` (inline `jest` field) |
| **Playwright 1.42** | Public docs site E2E | `test/e2e-website/playwright.config.ts` |
| **Karma 6.4** | Cross-browser headless tests (Chrome/Firefox) | `test/karma.conf.js`, `test/karma.conf.profile.js` |
| **nyc 15.1 + Istanbul** | Coverage for Mocha-based tests | Root `package.json` `nyc` config |

Cargo (`cargo test --workspace`) covers `packages/sui-video-renderer` (Rust) — invoked via root script `pnpm video-renderer:test`.

### 1.2 Test File Inventory (counted live, not estimated)

Counts re-verified 2026-05-28 across `packages/` (excluding `node_modules`, `dist`, `build`). A naive `find` for `*.spec.*` also matches `test/typescript/**` compile-only suites (27 each in `sui-editor` / `sui-github`); the runtime-spec column below intentionally excludes those.

| Package | `*.test.*` | `*.spec.*` (runtime) | Framework | Notes |
|---------|-----------:|---------------------:|-----------|-------|
| `sui-media-api` | 0 | 9 (`src/`) + 1 e2e (`test/uploads-e2e.spec.ts`) | Jest + `@nestjs/testing` | auth, s3, health, uploads (controller+service), media, thumbnail-generation, metadata-extraction |
| `sui-media` | 11 | 0 | Jest + ts-jest + jsdom | `MediaCard`, `MediaViewer`, `WebUserDirectChat`, abstractions (Auth/Router/Queue/KeyboardShortcuts/Payment) |
| `sui-file-explorer` | 19 | 1 (type) | Mocha/Chai + `describeConformance` | Components, plugins, dropzone |
| `sui-editor` | 12 (8 MUI-fork integration in `test/integration/*.test.js` + 4 product) | 1 (type) | Mocha/Chai | `EditorFile`, `useEditor`, `useEditorMetadata`, `useEditorKeyboard`, plus inherited MUI menu/dialog/select harness |
| `sui-common` | 3 (SocialLinks suite) | 0 | Jest | `platformRegistry`, `SocialLinks`, `SocialLinkField` |
| `sui-github` | 8 (`test/integration/*.test.js`) | 0 | Mocha/Chai | Forked MUI menu/dialog/select harness — minimal product coverage |
| `sui-timeline` | 0 | 1 (themeAugmentation type spec) | Mocha (compile-only) | No runtime tests |
| `sui-common-api` | 0 | 0 | — | **Gap** — DTOs/models/Mongoose schemas untested |
| `sui-docs` | 0 | 0 | — | **Gap** — doc-tooling untested |
| `sui-cdn` | 0 | 0 | — | **Gap** — empty test surface, only `src/` + `sst-env.d.ts` |
| `sui-video-renderer` | Rust unit + integration | — | `cargo test` | Native side; WASM bridge not exercised in JS |

Workspace total: **~65 runtime JS/TS test files** across `packages/` (53 `*.test.*` + 12 `*.spec.*` excluding `test/typescript/**` compile-only suites). The bulk of `sui-editor` and `sui-github` test files are forked MUI integration harnesses, not product-level coverage.

### 1.3 Existing Test Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| `@stoked-ui/internal-test-utils` | `packages-internal/test-utils/` | Custom rendering, conformance, chai matchers, jsdom + Babel setup (re-exported by `test/utils/init.ts`) |
| Root test harness | `test/utils/` | `describeConformance.ts`, `describeSlotsConformance.tsx`, `helperFn.ts`, `mochaHooks.js`, `setupJSDOM.js`, `setupBabel.js` |
| sui-media test utils | `packages/sui-media/src/__tests__/utils/test-utils.tsx` | Custom render w/ QueryClient, mock factories (`createMockFile`, `createMockVideoFile`, `createMockImageFile`) |
| sui-media setup | `packages/sui-media/src/__tests__/setup.ts` | Mocks: `matchMedia`, `IntersectionObserver`, `ResizeObserver`, `HTMLMediaElement`, `fetch` |
| Production-grade abstraction mocks | `packages/sui-media/src/abstractions/` | `createMockAuth`, `createMockPayment`, `createInMemoryQueue`, `noOpRouter`, `createInMemoryKeyboardShortcuts` (already shipped — reuse in tests) |

### 1.4 CI Pipeline (current, verified)

GitHub Actions in `.github/workflows/` (live as of 2026-05-28): `ci.yml`, `ci-check.yml`, `claude-code-review.yml`, `claude.yml`, `codeql.yml`, `deploy-site.yml`, `publish-packages.yml`, `scorecards.yml`, `vale-action.yml`. **No `test-coverage.yml` or equivalent — Phase 0 below remains open.**

`ci.yml` runs on push/PR (skipping `docs/**`/`examples/**`), executes `pnpm install` + `pnpm build:ci` + `pnpm --filter @stoked-ui/media-api openapi:validate` + `pnpm release:changelog` across macOS/Windows/Ubuntu — **but does NOT currently run unit, Jest, Mocha, or Playwright suites in CI.** `ci-check.yml` is a no-op required-check workaround for docs-only PRs.

> **Critical gap:** there is **no Codecov integration, no coverage threshold gate, and no test job in CI** despite `coverageThreshold: 80%` being declared inside `packages/sui-media/jest.config.js` and `packages/sui-media-api/package.json`. Tests today rely on local execution and pre-merge review. Closing this gap is Phase 0 below.

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

Missing modules with **zero coverage** in `sui-media-api/src/`: `blog/`, `clients/`, `database/`, `performance/`, `users/`, `app.module.ts`, `lambda.bootstrap.ts`, `openapi.module.ts`, `swagger.config.ts`.

#### Frontend Core (`sui-media`)

| Critical Path | File / Hook | Risk if Untested |
|---------------|-------------|------------------|
| MediaFile construction & serialization | `src/MediaFile/MediaFile.ts` (~1000 LOC), `src/MediaFile/IMediaFile.ts` | Data corruption across all consumers |
| MediaFile static factories | `MediaFile.fromUrl()`, `fromBlob()`, `fromFile()`, `fromDataTransfer()` | File ingest broken |
| Video/audio metadata extraction | `MediaFile.extractVideoMetadata()`, `extractAudioMetadata()` | Wrong duration/dimensions in timeline (a known live bug — see project memory) |
| API client request/response | `src/api/media-api-client.ts`, `src/api/upload-client.ts` | Silent API failures |
| Upload state machine | `src/hooks/useMediaUpload.ts`, `src/hooks/useResumeUpload.ts` | Lost uploads |
| Media list/item hooks | `src/hooks/useMediaList.ts`, `src/hooks/useMediaItem.ts` | Browse broken |
| Optimistic delete | `src/hooks/useMediaDelete.ts` | Phantom items, stale UI |
| Framework abstractions | `src/abstractions/{Auth,Queue,Payment,Router,KeyboardShortcuts}.ts` | Host-app integration breaks (already covered — keep current pass rate) |

#### Docs API & Stores (Revenue + Auth-Critical)

Per repo guardrail (`AGENTS.md`, `CLAUDE.md`): non-media business logic lives in `docs/pages/api/*` + `docs/src/modules/*` — not in `sui-media-api`. Tests must follow.

| Critical Path | File | Risk |
|---------------|------|------|
| License activation/validation/deactivation | `docs/src/modules/license/licenseStore.ts` | Revenue loss |
| License product catalogue | `licenseStore.ts → listLicenseProducts() / findLicenseProduct()` | Can't purchase |
| Stripe checkout & webhook | `docs/src/modules/license/stripeClient.ts` | Payment breakage |
| User register/login/JWT | `docs/src/modules/auth/authStore.ts` | Account lockout / breach |
| Role determination | `authStore.ts → determineRole()` | Privilege escalation |
| API route handlers | `docs/pages/api/**/*.ts` | Public endpoint misbehaviour |

#### Editor (`sui-editor`)

| Critical Path | File |
|---------------|------|
| `VideoController` lifecycle (`preload` / `enter` / `start` / `update` / `leave`) | `src/Controllers/VideoController.ts` |
| `VideoController.getDrawData()` aspect handling (fill/contain/cover/none) | `src/Controllers/VideoController.ts` |
| Editor engine | `src/EditorEngine/` (dynamic WASM bundler vs web import) |
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
| **Browser APIs** | IndexedDB quota exceeded, File System Access API unavailable, Web Worker errors |
| **Stripe** | Invalid webhook signature, duplicate events, checkout session timeout |
| **Media metadata** | `createSettings` Proxy not propagating through React state (known issue — guard via DOM video element fallback in tests) |

### 2.3 Integration Points (P1 — Should Have)

| Integration | Packages | Test Type |
|-------------|----------|-----------|
| Editor ↔ Timeline playback sync | `sui-editor` + `sui-timeline` | Integration (Jest + jsdom) |
| Editor ↔ FileExplorer asset panel | `sui-editor` + `sui-file-explorer` | Integration |
| WASM video renderer ↔ EditorEngine dynamic import | `sui-video-renderer` ↔ `sui-editor` | Smoke test in jsdom; full path via Playwright at port 5199 |
| MediaCard ↔ MediaViewer open | `sui-media` components | Component integration |
| Frontend ↔ Backend upload | `sui-media` hooks + `sui-media-api` | E2E (Playwright + ephemeral API) |
| License checkout → activation | `stripeClient` + `licenseStore` + `pages/api/license/*` | Integration |
| Auth login → API route protection | `authStore` + `pages/api/**` | Integration |
| Common types across packages | `sui-common` + `sui-common-api` + consumers | Type-level (`tsc --noEmit`) |

---

## 3. Recommended Test Framework & Tooling

### 3.1 Framework Strategy

**Standardise new tests on Jest + @testing-library/react.** Do **not** migrate the existing Mocha suites — they coexist without friction.

| Layer | Framework | Rationale |
|-------|-----------|-----------|
| Unit (pure logic) | Jest + ts-jest | Fast, built-in mocking, coverage thresholds |
| Unit (React components) | Jest + `@testing-library/react` | Behaviour-first, no impl details |
| Unit (NestJS services) | Jest + `@nestjs/testing` | DI test modules — already established in `sui-media-api` |
| API route handlers (Next.js) | Jest + `node-mocks-http` (or `next-test-api-route-handler`) | HTTP-level testing without booting Next |
| Integration (multi-component) | Jest + `@testing-library/react` | Same env, no extra tooling |
| E2E (website) | Playwright | Already configured at `test/e2e-website/`; base URL `http://localhost:5199` |
| Conformance | Mocha + `describeConformance` | Keep existing MUI-style harness in `sui-file-explorer`, `sui-editor`, `sui-github` |
| Type correctness | `tsc --noEmit` over `*.spec.ts` | Existing pattern across timeline/editor |
| Native crate | `cargo test --workspace` (`packages/sui-video-renderer`) | Already wired via `pnpm video-renderer:test` |

### 3.2 Dependencies to Add (Per Package That Lacks Jest)

`sui-timeline`, `sui-editor`, `sui-common-api`, `sui-github`, `sui-docs`, `sui-cdn`:

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

Docs API route testing (`docs/`):

```jsonc
{
  "devDependencies": {
    "mongodb-memory-server": "^9.0.0",
    "stripe-event-types": "^3.0.0",
    "next-test-api-route-handler": "^4.0.0"
  }
}
```

---

## 4. Test File Organization & Naming

### 4.1 Directory Convention (Frontend Packages)

```
packages/sui-{name}/
├── src/
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.types.ts
│   │   └── __tests__/
│   │       ├── ComponentName.test.tsx        # Render/behaviour
│   │       └── ComponentName.utils.test.ts   # Pure logic
│   ├── internals/plugins/usePluginName/
│   │   ├── usePluginName.ts
│   │   └── usePluginName.test.tsx
│   ├── hooks/
│   │   ├── useHookName.ts
│   │   └── __tests__/useHookName.test.tsx
│   └── __tests__/
│       ├── setup.ts                          # Jest setupFilesAfterEnv
│       └── utils/test-utils.tsx              # Custom render + factories
├── test/
│   ├── integration/                          # Cross-module
│   └── typescript/                           # Type-level (.spec.ts)
├── jest.config.js
└── package.json
```

### 4.2 Directory Convention (NestJS — `sui-media-api`)

```
packages/sui-media-api/
├── src/{module}/
│   ├── {module}.service.ts
│   ├── {module}.controller.ts
│   ├── {module}.service.spec.ts              # co-located unit
│   └── {module}.controller.spec.ts           # co-located unit
├── test/
│   ├── jest-e2e.json                         # E2E config (existing)
│   └── *.e2e-spec.ts                         # E2E (existing: uploads-e2e.spec.ts)
└── package.json                              # Jest config inline
```

### 4.3 Naming

| Test Type | Pattern | Example |
|-----------|---------|---------|
| Component unit | `ComponentName.test.tsx` | `MediaViewer.test.tsx` |
| Pure logic / service | `module.test.ts` | `MediaCard.utils.test.ts` |
| React hook | `useHookName.test.tsx` | `useMediaUpload.test.tsx` |
| NestJS service | `name.service.spec.ts` | `uploads.service.spec.ts` |
| NestJS controller | `name.controller.spec.ts` | `health.controller.spec.ts` |
| Integration | `integration-{feature}.test.ts` | `integration-editor-timeline.test.ts` |
| NestJS E2E | `*.e2e-spec.ts` | `uploads-e2e.spec.ts` |
| Playwright E2E | `*.spec.ts` | `editor-workflow.spec.ts` |
| Type-level | `*.spec.ts` (compile-only) | `themeAugmentation.spec.ts` |

### 4.4 Description Convention

```ts
describe('UploadsService', () => {
  describe('initiateUpload', () => {
    it('creates a session with the correct part count for a file size', () => { ... });
    it('returns presigned URLs for the first batch of parts', () => { ... });
    it('detects a duplicate via findExistingByHash', () => { ... });
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
| `@aws-sdk/client-s3` | Mock `S3Service` at the DI boundary | Never hit real AWS |
| MongoDB / Mongoose | `getModelToken()` mock for unit; `mongodb-memory-server` for integration | Fast units; faithful queries in integration |
| Stripe SDK | Mock at service boundary | Never hit real Stripe |
| `fluent-ffmpeg` | Mock at `ThumbnailGenerationService` boundary | Binary not present in CI |
| `sharp` | Mock for unit; real for integration | Native deps |
| `ConfigService` | Static test values | Determinism |

### 5.2 Frontend (React — `sui-media` and downstream)

#### Browser APIs (`packages/sui-media/src/__tests__/setup.ts`) — reuse pattern across packages:

```ts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn(),
}));
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn(),
}));
Object.defineProperty(HTMLMediaElement.prototype, 'play',  { value: jest.fn() });
Object.defineProperty(HTMLMediaElement.prototype, 'pause', { value: jest.fn() });
```

#### Framework abstractions — use the production-grade mocks shipped by `sui-media`:

```ts
import { createMockAuth }                 from '@stoked-ui/media/abstractions/Auth';
import { createInMemoryQueue }            from '@stoked-ui/media/abstractions/Queue';
import { createInMemoryKeyboardShortcuts }from '@stoked-ui/media/abstractions/KeyboardShortcuts';
import { noOpRouter }                     from '@stoked-ui/media/abstractions/Router';
import { createMockPayment }              from '@stoked-ui/media/abstractions/Payment';
```

#### IndexedDB (`LocalDb` in `sui-common`)

```ts
import 'fake-indexeddb/auto';
```

#### File System Access API

```ts
const mockFileHandle = {
  getFile: jest.fn().mockResolvedValue(new File(['x'], 'test.mp4', { type: 'video/mp4' })),
  createWritable: jest.fn().mockResolvedValue({ write: jest.fn(), close: jest.fn() }),
};
window.showOpenFilePicker = jest.fn().mockResolvedValue([mockFileHandle]);
```

#### WASM (`@stoked-ui/video-renderer-wasm`)

The webpack alias resolves to `packages/sui-video-renderer/wasm-preview/pkg`. In jsdom, mock the dynamic import at the consumer boundary:

```ts
jest.mock('@stoked-ui/video-renderer-wasm', () => ({
  init: jest.fn().mockResolvedValue(undefined),
  Renderer: class { render = jest.fn(); free = jest.fn(); },
}));
```

#### Test data factories — already in `packages/sui-media/src/__tests__/utils/test-utils.tsx`:

```ts
import { createMockFile, createMockVideoFile, createMockImageFile, renderWithProviders }
  from '../utils/test-utils';
```

### 5.3 Inter-Package Mocking

```ts
// Testing sui-editor → mock sui-timeline at module boundary
jest.mock('@stoked-ui/timeline', () => ({
  Timeline: ({ children }: any) => <div data-testid="timeline">{children}</div>,
  useTimeline: () => ({ state: 'idle', currentTime: 0 }),
}));

jest.mock('@stoked-ui/file-explorer', () => ({
  FileExplorer: ({ children }: any) => <div data-testid="file-explorer">{children}</div>,
}));
```

### 5.4 Docs API Route Mocking

```ts
jest.mock('../modules/db/mongodb', () => ({
  getDb: jest.fn().mockResolvedValue(mockDb),
  ensureDbInitialized: jest.fn(),
}));

jest.mock('../modules/license/stripeClient', () => ({
  createCheckoutSession: jest.fn(),
  constructStripeWebhookEvent: jest.fn(),
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

| Package | Lines | Branches | Functions | Status | Rationale |
|---------|------:|---------:|----------:|--------|-----------|
| `sui-media-api` | **80%** | **80%** | **80%** | Threshold declared in inline Jest config — **not yet enforced in CI** | Security/revenue critical |
| `sui-media` | **80%** | **80%** | **80%** | Threshold declared in `jest.config.js` — **not yet enforced in CI** | Core data layer |
| `sui-common` | **75%** | **70%** | **75%** | Target | Foundation utilities |
| `sui-common-api` | **85%** | **80%** | **85%** | Target | Pure DTOs/models |
| `sui-file-explorer` | **70%** | **65%** | **70%** | Target | Plugin system, DnD edge cases |
| `sui-timeline` | **65%** | **60%** | **65%** | Target | Heavy DOM interaction |
| `sui-editor` | **60%** | **55%** | **60%** | Target | Orchestrator — integration-first |
| `sui-github` | **50%** | **45%** | **50%** | Target | Display-only |
| `sui-docs` / `sui-cdn` | **40%** | **35%** | **40%** | Target | Doc tooling, low risk |
| Docs API routes | **75%** | **70%** | **75%** | Target | Revenue-critical license/auth |

### 6.2 Canonical Jest Config Template

Mirror `packages/sui-media/jest.config.js`:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: { jsx: 'react', esModuleInterop: true, module: 'commonjs', moduleResolution: 'node' },
    }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts',
    '!src/**/*.types.ts',
    '!src/**/themeAugmentation/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/'],
};
```

### 6.3 CI Pipeline — Target State

Today: only `ci.yml` and `ci-check.yml`; neither runs the test suites.

Proposed `.github/workflows/test-coverage.yml` (new):

```
push/PR  → test-backend          (sui-media-api: jest --ci --coverage)        → Codecov [backend]
         → test-frontend         (sui-media:    jest --ci --coverage)         → Codecov [frontend]
         → test-common           (sui-common:   jest --ci --coverage)         → Codecov [common]
         → test-common-api       (sui-common-api new suite)                   → Codecov [common-api]
         → test-file-explorer    (Mocha — pnpm --filter @stoked-ui/file-explorer test)
         → test-editor           (Mocha)                                      → Codecov [editor]
         → test-timeline         (Jest after Phase 1)                         → Codecov [timeline]
         → test-docs-api         (Jest, docs/pages/api)                       → Codecov [docs-api]
         → coverage-report       (combined summary, PR comment with delta)
         → test-e2e              (Playwright)                                 → on merge to main
         → test-rust             (cargo test --workspace)                     → cargo-llvm-cov
```

---

## 7. Specific Test Cases to Implement First

### 7.1 Priority 1 — License & Auth Stores (Revenue + Security Critical)

#### `docs/src/modules/license/__tests__/licenseStore.test.ts` — NEW

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

#### `docs/src/modules/license/__tests__/stripeClient.test.ts` — NEW

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
    it('rejects an invalid signature');
    it('rejects an expired timestamp');
  });
});
```

#### `docs/src/modules/auth/__tests__/authStore.test.ts` — NEW

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

#### `packages/sui-media/src/MediaFile/__tests__/MediaFile.test.ts` — NEW

```ts
describe('MediaFile', () => {
  describe('constructor', () => {
    it('constructs from fileBits with correct metadata');
    it('generates a unique id on creation');
    it('detects mediaType from MIME type');
    it('sets created timestamp to Date.now() by default');
    it('accepts a custom created timestamp');
  });

  describe('fromUrl', () => {
    it('fetches file from URL and creates MediaFile');
    it('applies exponential backoff on transient failures');
    it('throws after max retries');
    it('extracts filename from URL');
    it('uses cache when file already fetched');
  });

  describe('fromBlob / fromFile / fromDataTransfer', () => {
    it('creates MediaFile from Blob with correct properties');
    it('wraps a native File preserving its metadata');
    it('extracts files from a DataTransfer event');
    it('filters out files in FILES_TO_IGNORE');
    it('handles an empty DataTransfer');
  });

  describe('extractVideoMetadata / extractAudioMetadata', () => {
    it('extracts duration, width, height from video element');
    it('detects audio tracks via hasAudio()');
    it('handles createSettings Proxy not propagating (DOM fallback path)'); // known issue
    it('extracts duration and format from audio element');
  });

  describe('cache', () => {
    it('stores files in static cache by id');
    it('returns cached file on duplicate access');
  });
});
```

### 7.3 Priority 3 — Backend API Expansion

#### Expand `packages/sui-media-api/src/uploads/uploads.service.spec.ts`

```ts
describe('UploadsService', () => {
  describe('initiateUpload', () => {
    it('creates a session with the correct part count for the file size');
    it('generates an S3 key with the correct prefix and extension');
    it('returns presigned URLs for the first batch of parts');
    it('detects a duplicate via findExistingByHash()');
  });

  describe('getMorePresignedUrls', () => {
    it('returns URLs for the remaining parts');
    it('rejects requests for a completed session');
  });

  describe('markPartCompleted', () => {
    it('marks a part and updates session progress');
    it('rejects completion for a nonexistent part');
  });

  describe('completeUpload', () => {
    it('finalises the S3 multipart upload');
    it('fails when parts are incomplete');
    it('updates session status to completed');
  });

  describe('abortUpload', () => {
    it('aborts the S3 multipart upload');
    it('cleans up session state');
  });

  describe('syncWithS3', () => {
    it('reconciles local state with S3 parts');
  });
});
```

New spec files to add (modules currently at zero coverage in `sui-media-api/`):

```
src/users/users.service.spec.ts
src/users/users.controller.spec.ts
src/clients/clients.service.spec.ts
src/blog/blog.service.spec.ts
src/database/database.service.spec.ts
src/performance/performance.service.spec.ts
```

### 7.4 Priority 4 — VideoController (Modified File, Live Bugs)

#### `packages/sui-editor/src/Controllers/__tests__/VideoController.test.ts` — NEW

```ts
describe('VideoController', () => {
  describe('getDrawData', () => {
    it('calculates correct draw dimensions for fill mode');
    it('calculates correct draw dimensions for contain mode');
    it('calculates correct draw dimensions for cover mode');
    it('calculates correct draw dimensions for none mode');
    it('handles aspect-ratio mismatch');
  });

  describe('preload', () => {
    it('loads video element and extracts metadata');
    it('populates ScreenshotStore from the video');
    it('does NOT block when ScreenshotStore is empty (count > 0 guard)'); // regression
    it('sets backgroundImage on the preloaded track');
  });

  describe('static hasAudio', () => {
    it('returns true for video with audio tracks');
    it('returns false for video without audio tracks');
  });

  describe('state machine', () => {
    it('transitions through enter → start → update → leave');
    it('syncs video.currentTime on update');
    it('handles video.play() promise rejection');
    it('renders all tracks at t=0 (canvas first-frame regression)'); // known unresolved
  });
});
```

### 7.5 Priority 5 — Common Utilities

#### `packages/sui-common/src/FetchBackoff/__tests__/FetchBackoff.test.ts` — NEW

```ts
describe('FetchBackoff', () => {
  it('succeeds on first attempt when fetch resolves');
  it('retries on transient failure and succeeds on second attempt');
  it('applies exponential backoff between retries');
  it('respects maximum retry count');
  it('throws after exhausting all retries');
  it('does not retry on 4xx client errors');
  it('retries on 5xx server errors');
});
```

Companion targets in `sui-common`: `LocalDb`, `Mime`, `Colors`, plus exported hooks.

### 7.6 Priority 6 — Timeline Engine

#### `packages/sui-timeline/src/Controller/__tests__/Controllers.test.ts` — NEW

```ts
describe('Controllers', () => {
  it('initializes in idle state');
  it('transitions to playing on play()');
  it('transitions to paused on pause()');
  it('seeks to a specified time');
  it('loops when reaching end with loop enabled');
  it('emits state-change events');
  it('routes all audio sources through a single AudioContext destination'); // regression guard
});
```

#### `packages/sui-timeline/src/Engine/__tests__/Engine.test.ts` — NEW

```ts
describe('Engine', () => {
  it('sequences actions in correct order');
  it('handles overlapping actions');
  it('fires events at correct timestamps');
  it('stops cleanly when timeline ends');
  it('supports dynamic track add/remove');
});
```

### 7.7 Priority 7 — Common-API DTOs / Models

`sui-common-api` is currently untested. Cover:

- Mongoose schema validation (required fields, defaults, enum constraints)
- DTO transformation via `class-transformer` decorators
- DTO validation via `class-validator`
- Custom NestJS decorators

### 7.8 Priority 8 — File Explorer Plugins

DnD reorder, selection, and keyboard navigation plugins in `packages/sui-file-explorer/src/internals/plugins/` — write Mocha tests in the existing house style or adopt Jest for new plugins.

---

## 8. Implementation Phases

### Phase 0 — Wire Tests Into CI (Days 1-3) — **PREREQUISITE**

Without this, every other phase produces work that nothing enforces.

| Task | Deliverable |
|------|-------------|
| Add `.github/workflows/test-coverage.yml` running Jest for `sui-media-api`, `sui-media`, `sui-common` | New workflow file |
| Wire Codecov upload | `codecov.yml` already present — verify token + flags |
| Add `pnpm test:jest` root script driving Turbo | `turbo.json` `test:jest` task; root `package.json` script |
| Fail PR on coverage delta drop or threshold breach | Codecov comment + threshold check |

### Phase 1 — License + Auth + MediaFile (Week 1-2)

Highest risk reduction per effort: revenue/security critical, untested today.

| Task | Target |
|------|--------|
| `licenseStore.test.ts` | `docs/src/modules/license/__tests__/` |
| `stripeClient.test.ts` | `docs/src/modules/license/__tests__/` |
| `authStore.test.ts` | `docs/src/modules/auth/__tests__/` |
| `MediaFile.test.ts` | `packages/sui-media/src/MediaFile/__tests__/` |
| Add Jest to `sui-timeline`, `sui-editor`, `sui-common-api`, `sui-github`, `sui-docs`, `sui-cdn` | jest.config + setup |

### Phase 2 — Critical-Path Coverage (Week 2-4)

| Task | Target |
|------|--------|
| Expand 9 existing `sui-media-api` specs | branch + edge coverage to 80% threshold |
| Add specs for `users/`, `clients/`, `blog/`, `database/`, `performance/` modules | `sui-media-api/src/**` |
| API client + upload hook tests | `sui-media/src/api/`, `sui-media/src/hooks/` |
| `FetchBackoff.test.ts`, `LocalDb`, `Mime` | `sui-common` |
| DTO/schema validation | `sui-common-api` |

### Phase 3 — Components, Plugins, Editors (Week 4-6)

| Task | Target |
|------|--------|
| `VideoController.test.ts` | `sui-editor/src/Controllers/__tests__/` |
| Timeline `Controllers` & `Engine` tests | `sui-timeline` |
| File-explorer plugin tests (DnD, selection, keyboard, expansion, files) | `sui-file-explorer` |

### Phase 4 — Integration & E2E (Week 6-8)

| Task | Target |
|------|--------|
| Editor ↔ Timeline integration | `test/integration/` |
| Frontend ↔ Backend upload E2E | Playwright + ephemeral `sui-media-api` |
| License checkout → activation E2E | Playwright at `localhost:5199` |
| Cross-package type tests | `*.spec.ts` compile-only |

---

## 9. Turbo Pipeline Configuration

Add to `turbo.json`:

```jsonc
{
  "tasks": {
    "test": {
      "cache": true,
      "dependsOn": ["build"]
    },
    "test:jest": {
      "cache": true,
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:jest:ci": {
      "cache": false,
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

---

## 10. Test Commands Reference

### Working Today

```bash
# Root harness
pnpm test                          # node scripts/test.mjs
pnpm test:unit                     # Mocha across packages + docs
pnpm test:unit:no-docs             # Mocha across packages only
pnpm test:coverage                 # Mocha + nyc (Istanbul)
pnpm test:karma                    # Browser tests (Chrome/Firefox headless)
pnpm test:e2e                      # webpack build + Mocha + serve
pnpm test:e2e-website              # Playwright @ port 5199 (build target)
pnpm test:e2e-website:dev          # Playwright against local dev server
pnpm test:regressions              # Visual regressions
pnpm tc <pattern>                  # Interactive mocha test runner (test/cli.js)

# Per-package Jest (where configured)
pnpm --filter @stoked-ui/media test                  # Jest
pnpm --filter @stoked-ui/media test:ci               # Jest --ci --coverage --maxWorkers=2
pnpm --filter @stoked-ui/media-api test              # Jest
pnpm --filter @stoked-ui/media-api test:cov          # Jest --coverage
pnpm --filter @stoked-ui/media-api test:e2e          # Jest @ test/jest-e2e.json
pnpm --filter @stoked-ui/common test                 # Jest

# Native crate
pnpm video-renderer:test                              # cargo test --workspace
```

### Add After Phase 0

```bash
# Root-level Turbo orchestration
"test:jest":     "turbo run test:jest --continue --ui tui"
"test:jest:ci":  "turbo run test:jest:ci --continue --ui tui"

# Per-package (in packages without these scripts)
"test":          "jest"
"test:watch":    "jest --watch"
"test:coverage": "jest --coverage"
"test:ci":       "jest --ci --coverage --maxWorkers=2"
```

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **No test job in CI today** | Coverage thresholds toothless | Phase 0 above — add `test-coverage.yml` before any other test work |
| Dual framework (Mocha + Jest) | Onboarding friction | Document per-package runner; do not migrate existing Mocha suites |
| jsdom limitations for DnD/gesture | False CI passes | Test pure logic via unit tests; gesture flows via Playwright |
| Flaky async timing | CI trust erosion | Use `waitFor` / `findBy*`; mock timers for animations |
| `mongodb-memory-server` startup time | Slow CI | Share connection via `globalSetup`; mock Mongoose model token for unit tests |
| Inter-package mock drift | Tests pass, prod breaks | Add a small set of smoke tests importing real packages; type tests catch signatures |
| Coverage gaming (trivial tests) | False confidence | Review test quality in PRs; focus on Section 2.1 critical paths |
| Stripe / AWS / FFmpeg mocks diverging from real APIs | Prod incidents | Pin SDK versions; add a small set of contract tests against sandbox APIs |
| WASM dynamic-import path differs (bundler vs web) | Editor breaks at runtime, not in tests | Smoke tests for both targets; project memory documents the auto-detect in `EditorEngine.ts` |
| `createSettings` Proxy not propagating through React state | Detail views show stale metadata | Tests should exercise both Proxy path and DOM-element fallback |

---

## 12. Quick-Start: First 5 Files to Write

Ranked by risk-reduction per effort:

| # | File | Why First |
|---|------|-----------|
| 1 | `.github/workflows/test-coverage.yml` | Without CI enforcement, every other test is a nice-to-have. Phase 0 unblocks everything. |
| 2 | `docs/src/modules/license/__tests__/licenseStore.test.ts` | Revenue-critical; pure functions; no infra needed |
| 3 | `docs/src/modules/auth/__tests__/authStore.test.ts` | Security-critical; pure functions |
| 4 | `packages/sui-media/src/MediaFile/__tests__/MediaFile.test.ts` | Core data model used by every consumer; ~1000 LOC currently untested |
| 5 | `packages/sui-editor/src/Controllers/__tests__/VideoController.test.ts` | Modified file with two known live bugs (canvas first-frame at t=0; ScreenshotStore guard) — regression tests pin behaviour |
