# SC_TEST — Testing Strategy & Implementation Plan

**Package:** `@stoked-ui/sui` (Monorepo Root)
**Priority:** Critical
**Stack:** pnpm 10.5.1 / TypeScript 5.4 / React 18 / NestJS 10 / Turbo / Mocha + Jest + Playwright
**Date:** 2026-03-03

---

## 1. Current State Assessment

### 1.1 Test Infrastructure Overview

The monorepo uses a **multi-framework** testing stack evolved from MUI origins:

| Runner | Scope | Config Location |
|--------|-------|-----------------|
| **Mocha 10.3 + Chai 4.4** | Root-level unit, integration, regressions | `.mocharc.js`, `test/karma.conf.js` |
| **Jest 29.7 + ts-jest 29.1** | Per-package unit/service tests | `packages/sui-media/jest.config.js`, `packages/sui-common/jest.config.js`, `packages/sui-media-api/package.json` (inline) |
| **Playwright 1.42** | E2E website testing | `test/e2e-website/playwright.config.ts` |
| **Karma 6.4** | Cross-browser tests (Chrome/Firefox headless, BrowserStack) | `test/karma.conf.js` |
| **nyc 15.1 + Istanbul** | Code coverage for Mocha tests | Root `package.json` `nyc` config |

### 1.2 Test File Inventory

| Package | Test Files | Framework | Coverage Status |
|---------|-----------|-----------|-----------------|
| `sui-media-api` | 10 spec files | Jest (NestJS) | **80% threshold enforced in CI** |
| `sui-media` | ~10 test files + 5 abstraction tests | Jest (ts-jest/jsdom) | **80% threshold enforced in CI** |
| `sui-file-explorer` | 19 files | Mocha/Chai | Partial — components + plugins |
| `sui-file-explorer-v2` | **0 files** | — | **No tests — CRITICAL GAP** |
| `sui-editor` | 4 unit + 8 integration + 36 TS specs | Mocha/Chai | Minimal unit coverage |
| `sui-common` | 3 files | Jest | SocialLinks only |
| `sui-timeline` | 1 file | Mocha | Theme augmentation only |
| `sui-github` | 8 integration + 36 TS specs | Mocha/Chai | No unit tests |
| `sui-common-api` | **0 files** | — | **No tests** |
| `sui-docs` | **0 files** | — | **No tests** |

### 1.3 Existing Test Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| `@stoked-ui/internal-test-utils` | `packages-internal/test-utils/` | Custom rendering, conformance testing, chai matchers, jsdom/Babel setup |
| Test helpers | `test/utils/` | `describeConformance.ts`, `helperFn.ts`, `mochaHooks.js` |
| sui-media test utils | `packages/sui-media/src/__tests__/utils/test-utils.tsx` | Custom render with QueryClient, mock file factories (`createMockFile`, `createMockVideoFile`) |
| sui-media setup | `packages/sui-media/src/__tests__/setup.ts` | Mocks: `matchMedia`, `IntersectionObserver`, `ResizeObserver`, `HTMLMediaElement`, `fetch` |
| Abstraction mocks | `packages/sui-media/src/abstractions/` | `createMockAuth`, `createMockPayment`, `createInMemoryQueue`, `noOpRouter`, `createInMemoryKeyboardShortcuts` |

### 1.4 CI Pipeline

**`.github/workflows/test-coverage.yml`** — Current coverage pipeline:

```
push/PR → test-backend (sui-media-api: jest --ci --coverage)  → Codecov [backend]
        → test-frontend (sui-media: jest --ci --coverage)     → Codecov [frontend]
        → coverage-report (combined summary)
```

Both jobs enforce **80% line coverage** threshold with `jq` check against `coverage-summary.json`.

---

## 2. What Should Be Tested

### 2.1 Critical Paths (P0 — Must Have)

#### File Explorer V2 (`sui-file-explorer-v2`) — NEW, ZERO TESTS

| Critical Path | File | Risk if Untested |
|---------------|------|------------------|
| Tree operations (find, insert, remove) | `src/dnd/treeOps.ts` (8 pure functions) | Data corruption on drag-and-drop, items lost or duplicated |
| Adapter conversions (v1 ↔ v2) | `src/adapters.ts` (2 adapters + type mapper) | V1 data silently malformed, migration failures |
| DnD instruction dispatch | `src/dnd/DndProvider.tsx` → `applyInstruction()` | Wrong drop placement, circular references, permission bypass |
| DnD permission checks | `src/dnd/DndProvider.tsx` → `defaultCanMoveItem()` | Items dropped into non-container nodes |
| Component rendering | `src/FileExplorerV2.tsx` | Tree not rendered, DnD toggle broken |
| Instruction-to-action mapping | `src/dnd/useTreeItemDnd.ts` → `instructionToAction()` | Wrong visual indicator during drag |
| Custom tree item | `src/CustomTreeItem.tsx` | Icon resolution broken, ref forwarding broken |

#### Backend API (`sui-media-api`)

| Critical Path | Service / Method | Risk if Untested |
|---------------|-----------------|------------------|
| Upload lifecycle | `UploadsService.initiateUpload()` → `getMorePresignedUrls()` → `markPartCompleted()` → `completeUpload()` / `abortUpload()` | Data loss, S3 orphan objects, cost leak |
| Authentication flow | `AuthService.register()` → `login()` → `validateToken()` → `getUserById()` | Security breach, unauthorized access |
| Media CRUD | `MediaService.create()` → `findAll()` → `findOne()` → `update()` → `remove()` → `restore()` | Core functionality broken |
| S3 operations | `S3Service.createMultipartUpload()`, `getPresignedUploadUrls()`, `completeMultipartUpload()`, `deleteMediaAndThumbnails()` | Upload/download broken, file leaks |
| Thumbnail generation | `ThumbnailGenerationService.generateThumbnail()`, `generateSpriteSheet()`, `getVideoMetadata()` | No previews, broken media display |
| Metadata extraction | `MetadataExtractionService` (in `src/media/metadata/`) | Wrong file metadata in DB |

**Existing spec files** (already have tests — need expansion):
- `packages/sui-media-api/src/uploads/uploads.service.spec.ts`
- `packages/sui-media-api/src/auth/auth.service.spec.ts`
- `packages/sui-media-api/src/media/media.service.spec.ts`
- `packages/sui-media-api/src/s3/s3.service.spec.ts`
- `packages/sui-media-api/src/media/thumbnail-generation.service.spec.ts`
- `packages/sui-media-api/src/media/metadata/metadata-extraction.service.spec.ts`
- `packages/sui-media-api/src/uploads/uploads.controller.spec.ts`
- `packages/sui-media-api/src/blog/blog.service.spec.ts`
- `packages/sui-media-api/src/nostr/nostr.service.spec.ts`
- `packages/sui-media-api/src/health/health.controller.spec.ts`

#### Frontend Core (`sui-media`)

| Critical Path | File / Hook | Risk if Untested |
|---------------|------------|------------------|
| MediaFile construction & serialization | `src/MediaFile/MediaFile.ts` (1004 lines), `src/MediaFile/IMediaFile.ts` | Data corruption across all components |
| MediaFile static factories | `MediaFile.fromUrl()`, `fromBlob()`, `fromFile()`, `fromDataTransfer()` | File input broken for every entry point |
| Video/audio metadata extraction | `MediaFile.extractVideoMetadata()`, `extractAudioMetadata()` | Wrong duration/dimensions in timeline |
| API client request/response | `src/api/media-api-client.ts`, `src/api/upload-client.ts` | All API calls fail silently |
| Upload state machine | `src/hooks/useMediaUpload.ts`, `src/hooks/useResumeUpload.ts` | Upload UX broken, lost files |
| Media list/item hooks | `src/hooks/useMediaList.ts`, `src/hooks/useMediaItem.ts` | Can't browse media |
| Media delete with optimistic update | `src/hooks/useMediaDelete.ts` | Phantom items, stale UI |
| Framework abstractions | `src/abstractions/Auth.ts`, `Queue.ts`, `Payment.ts`, `Router.ts`, `KeyboardShortcuts.ts` | Integration failures with host apps |

#### Docs API Routes (License & Auth — Revenue-Critical)

| Critical Path | File | Risk if Untested |
|---------------|------|------------------|
| License activation | `docs/src/modules/license/licenseStore.ts` → `activateLicense()`, `validateLicense()`, `deactivateLicense()` | Revenue loss, invalid activations |
| License products | `licenseStore.ts` → `listLicenseProducts()`, `findLicenseProduct()` | Can't purchase licenses |
| Stripe checkout | `docs/src/modules/license/stripeClient.ts` → `createCheckoutSession()`, `constructStripeWebhookEvent()` | Payment broken |
| User auth | `docs/src/modules/auth/authStore.ts` → `register()`, `login()`, `verifyToken()`, `loginWithGooglePayload()` | Can't access app |
| Role determination | `authStore.ts` → `determineRole()` | Privilege escalation |

#### File Explorer (`sui-file-explorer`)

| Critical Path | Plugin Directory | Risk if Untested |
|---------------|-----------------|------------------|
| Drag-and-drop reordering | `src/internals/plugins/useFileExplorerDnd/` | File organization broken |
| File selection (single/multi) | `src/internals/plugins/useFileExplorerSelection/` | Can't select files |
| Keyboard navigation | `src/internals/plugins/useFileExplorerKeyboardNavigation/` | Accessibility violation |
| Folder expansion | `src/internals/plugins/useFileExplorerExpansion/` | Can't navigate folders |
| File management (add/remove) | `src/internals/plugins/useFileExplorerFiles/` | Core file ops broken |

#### Timeline (`sui-timeline`)

| Critical Path | File | Risk if Untested |
|---------------|------|------------------|
| Playback state machine | `src/Controller/Controllers.ts`, `src/Controller/Controller.ts` | Playback broken |
| Audio controller | `src/Controller/AudioController.ts` | Audio desync |
| Engine sequencer | `src/Engine/Engine.ts` | Animation timing broken |
| Event emitter | `src/Engine/emitter.ts`, `src/Engine/events.ts` | Silent failures |
| Timeline state | `src/Timeline/TimelineState.ts` | UI desync |

#### Editor (`sui-editor`)

| Critical Path | File | Risk if Untested |
|---------------|------|------------------|
| VideoController lifecycle | `src/Controllers/VideoController.ts` (`preload()`, `enter()`, `start()`, `update()`, `leave()`) | Video playback broken |
| VideoController draw logic | `VideoController.getDrawData()` (aspect ratio: fill/contain/cover/none) | Wrong video rendering |
| Editor engine | `src/EditorEngine/` | Editor crashes |
| Editor file handling | `src/EditorFile/` | Can't open/save files |
| Controller dispatch | `src/Controllers/` (`VideoController`, `AudioController`, `AnimationController`, `ImageController`) | Wrong controller for media type |

### 2.2 Edge Cases (P1 — Should Have)

| Category | Specific Cases |
|----------|---------------|
| **File types** | Zero-byte files, >4GB files, unsupported MIME types, corrupted headers |
| **Upload** | Network interruption mid-upload, duplicate file by hash (`UploadsService.findExistingByHash()`), concurrent uploads, resume after abort |
| **Timeline** | Empty timeline, 100+ tracks, overlapping actions, sub-frame precision, rapid seek |
| **Auth** | Expired JWT, revoked tokens, concurrent sessions, role escalation via direct API call |
| **License** | Expired license with grace period, duplicate activation on same hardware, license for nonexistent product |
| **DnD (v2)** | Drop on self, drop parent into child (circular), drop at tree root, drop into non-container, rapid drag sequences, empty tree |
| **Adapters (v2)** | Unknown mediaType mapping, deeply nested children, items with no children property vs empty array |
| **Browser APIs** | IndexedDB quota exceeded, File System Access API unavailable, Web Worker errors |
| **Stripe** | Invalid webhook signature, duplicate events, checkout session timeout |

### 2.3 Integration Points (P1 — Should Have)

| Integration | Packages Involved | Test Type |
|-------------|-------------------|-----------|
| Editor ↔ Timeline playback sync | `sui-editor` + `sui-timeline` | Integration |
| Editor ↔ FileExplorer asset panel | `sui-editor` + `sui-file-explorer` | Integration |
| FileExplorerV2 ↔ v1 data adapters | `sui-file-explorer-v2` adapters + v1 types | Unit |
| MediaCard ↔ MediaViewer open | `sui-media` components | Component integration |
| Frontend ↔ Backend upload flow | `sui-media` hooks + `sui-media-api` | E2E |
| License checkout → activation | `stripeClient.ts` + `licenseStore.ts` | Integration |
| Auth login → API route protection | `authStore.ts` + API route handlers | Integration |
| Common types across packages | `sui-common` + `sui-common-api` + all consumers | Type tests |

---

## 3. Recommended Test Framework & Tooling

### 3.1 Framework Strategy

**Standardize new tests on Jest + @testing-library/react.** Do not migrate existing Mocha tests — they coexist.

| Layer | Framework | Rationale |
|-------|-----------|-----------|
| **Unit (pure logic)** | Jest + ts-jest | Fast, built-in mocking, coverage thresholds |
| **Unit (React components)** | Jest + @testing-library/react | DOM testing without implementation details |
| **Unit (NestJS services)** | Jest + @nestjs/testing | Native DI-based test modules (already established) |
| **Integration (multi-component)** | Jest + @testing-library/react | Same env, no extra tooling |
| **API route handlers** | Jest + supertest | HTTP-level testing with real handlers |
| **E2E (website)** | Playwright | Already configured, cross-browser |
| **Conformance** | Mocha + `describeConformance` | Keep existing MUI-style pattern |
| **Type correctness** | TypeScript compiler (`tsc --noEmit`) | Existing `.spec.ts` pattern for type tests |

### 3.2 Dependencies to Add (Per Package)

For packages missing Jest (`sui-file-explorer-v2`, `sui-timeline`, `sui-editor`, `sui-common-api`, `sui-github`):

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

For docs API route testing:

```jsonc
{
  "devDependencies": {
    "mongodb-memory-server": "^9.0.0",
    "stripe-event-types": "^3.0.0"
  }
}
```

---

## 4. Test File Organization & Naming

### 4.1 Directory Structure Convention

```
packages/sui-{name}/
├── src/
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.types.ts
│   │   └── __tests__/
│   │       ├── ComponentName.test.tsx       # Unit/render tests
│   │       └── ComponentName.utils.test.ts  # Pure logic tests
│   ├── internals/plugins/
│   │   └── usePluginName/
│   │       ├── usePluginName.ts
│   │       └── usePluginName.test.tsx
│   ├── hooks/
│   │   ├── useHookName.ts
│   │   └── __tests__/
│   │       └── useHookName.test.tsx
│   └── __tests__/
│       ├── setup.ts                         # Jest setupFilesAfterEnv
│       └── utils/
│           └── test-utils.tsx               # Custom render, mock factories
├── test/
│   ├── integration/                         # Cross-module integration
│   └── typescript/                          # Type-level spec files (.spec.ts)
├── jest.config.js
└── package.json
```

For NestJS (`sui-media-api`):

```
packages/sui-media-api/
├── src/
│   ├── {module}/
│   │   ├── {module}.service.ts
│   │   ├── {module}.controller.ts
│   │   ├── {module}.service.spec.ts         # Unit test (co-located)
│   │   └── {module}.controller.spec.ts      # Unit test (co-located)
│   └── ...
├── test/
│   ├── jest-e2e.json                        # E2E config (existing)
│   └── *.e2e-spec.ts                        # E2E tests
└── package.json                             # Jest config (inline)
```

### 4.2 Naming Conventions

| Test Type | Pattern | Example |
|-----------|---------|---------|
| Unit (component) | `ComponentName.test.tsx` | `MediaViewer.test.tsx` |
| Unit (logic/service) | `moduleName.test.ts` | `treeOps.test.ts` |
| Unit (React hook) | `useHookName.test.tsx` | `useMediaUpload.test.tsx` |
| NestJS service | `service-name.service.spec.ts` | `uploads.service.spec.ts` |
| NestJS controller | `controller-name.controller.spec.ts` | `health.controller.spec.ts` |
| Integration | `integration-{feature}.test.ts` | `integration-editor-timeline.test.ts` |
| E2E (NestJS) | `*.e2e-spec.ts` | `media.e2e-spec.ts` |
| E2E (website) | `*.spec.ts` | `editor-workflow.spec.ts` |
| Type correctness | `*.spec.ts` (no runtime, just `tsc`) | `themeAugmentation.spec.ts` |

### 4.3 Test Description Convention

```typescript
describe('treeOps', () => {
  describe('findItem', () => {
    it('should find item at root level', () => { ... });
    it('should find deeply nested item', () => { ... });
    it('should return undefined for nonexistent id', () => { ... });
  });

  describe('removeItem', () => {
    it('should remove root-level item', () => { ... });
    it('should remove nested item without affecting siblings', () => { ... });
  });
});
```

---

## 5. Mock & Stub Strategy

### 5.1 Backend Mocking (NestJS — `sui-media-api`)

Use the established `Test.createTestingModule` pattern from existing specs:

```typescript
// Standard NestJS DI-based mocking
const module: TestingModule = await Test.createTestingModule({
  providers: [
    ServiceUnderTest,
    { provide: S3Service, useValue: mockS3Service },
    { provide: ConfigService, useValue: mockConfigService },
    { provide: getModelToken('Media'), useValue: mockMediaModel },
  ],
}).compile();
```

| Dependency | Mock Strategy | Rationale |
|------------|---------------|-----------|
| **S3 (`@aws-sdk/client-s3`)** | Mock `S3Service` at DI boundary | Never hit real AWS in tests |
| **MongoDB/Mongoose** | Mock model via `getModelToken()` for unit tests; `mongodb-memory-server` for integration | Unit tests stay fast; integration tests verify queries |
| **Stripe SDK** | Mock at service boundary | Never hit real Stripe |
| **FFmpeg (`fluent-ffmpeg`)** | Mock at `ThumbnailGenerationService` boundary | FFmpeg binary not available in CI |
| **Sharp** | Mock for unit tests; real for integration | Sharp has native deps |
| **ConfigService** | Provide static test values | Deterministic config |

### 5.2 Frontend Mocking (React — `sui-media`, `sui-common`, etc.)

#### Browser APIs (jsdom setup — `src/__tests__/setup.ts`)

Already established in `packages/sui-media/src/__tests__/setup.ts`:

```typescript
// Existing mocks — reuse across packages
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn(),
}));
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn(),
}));
Object.defineProperty(HTMLMediaElement.prototype, 'play', { value: jest.fn() });
Object.defineProperty(HTMLMediaElement.prototype, 'pause', { value: jest.fn() });
```

#### Framework Abstractions (Use Built-In Mock Factories)

`sui-media` ships production-ready mocks — always use these:

```typescript
import { createMockAuth } from '@stoked-ui/media/abstractions/Auth';
import { createInMemoryQueue } from '@stoked-ui/media/abstractions/Queue';
import { createInMemoryKeyboardShortcuts } from '@stoked-ui/media/abstractions/KeyboardShortcuts';
import { noOpRouter } from '@stoked-ui/media/abstractions/Router';
import { createMockPayment } from '@stoked-ui/media/abstractions/Payment';
```

#### IndexedDB (`LocalDb`)

```typescript
import 'fake-indexeddb/auto';  // Full IDB polyfill for jsdom
```

#### File System Access API

```typescript
const mockFileHandle = {
  getFile: jest.fn().mockResolvedValue(new File(['content'], 'test.mp4', { type: 'video/mp4' })),
  createWritable: jest.fn().mockResolvedValue({ write: jest.fn(), close: jest.fn() }),
};
window.showOpenFilePicker = jest.fn().mockResolvedValue([mockFileHandle]);
```

#### Test Data Factories (Use Existing — `sui-media/src/__tests__/utils/test-utils.tsx`)

```typescript
import {
  createMockFile,
  createMockVideoFile,
  createMockImageFile,
  renderWithProviders,  // Custom render with QueryClient
} from '../utils/test-utils';
```

### 5.3 File Explorer V2 Mocking

For `sui-file-explorer-v2` tests, mock the Atlaskit Pragmatic DnD library:

```typescript
// Mock @atlaskit/pragmatic-drag-and-drop for unit tests
jest.mock('@atlaskit/pragmatic-drag-and-drop/combine', () => ({
  combine: (...fns: Array<() => void>) => () => fns.forEach((fn) => fn()),
}));
jest.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable: jest.fn(() => jest.fn()),
  dropTargetForElements: jest.fn(() => jest.fn()),
}));
jest.mock('@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item', () => ({
  attachInstruction: jest.fn((data) => data),
  extractInstruction: jest.fn(() => null),
}));
```

For `treeOps.ts` — **no mocks needed**. These are pure functions; test directly with fixture data.

### 5.4 Inter-Package Mocking

When testing one package that depends on another:

```typescript
// Testing sui-editor — mock sui-timeline
jest.mock('@stoked-ui/timeline', () => ({
  Timeline: ({ children }: any) => <div data-testid="timeline">{children}</div>,
  useTimeline: () => ({ state: 'idle', currentTime: 0 }),
}));

// Testing sui-editor — mock sui-file-explorer
jest.mock('@stoked-ui/file-explorer', () => ({
  FileExplorer: ({ children }: any) => <div data-testid="file-explorer">{children}</div>,
}));
```

### 5.5 Docs API Route Mocking

```typescript
// Mock MongoDB connection for API route tests
jest.mock('../modules/db/mongodb', () => ({
  getDb: jest.fn().mockResolvedValue(mockDb),
  ensureDbInitialized: jest.fn(),
}));

// Mock Stripe client
jest.mock('../modules/license/stripeClient', () => ({
  createCheckoutSession: jest.fn(),
  constructStripeWebhookEvent: jest.fn(),
}));
```

### 5.6 CSS/Asset Mocking

Already configured via `identity-obj-proxy` in Jest configs:

```javascript
moduleNameMapper: {
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
}
```

---

## 6. Coverage Targets

### 6.1 Per-Package Targets

| Package | Lines | Branches | Functions | Status | Rationale |
|---------|-------|----------|-----------|--------|-----------|
| `sui-media-api` | **80%** | **80%** | **80%** | CI-enforced | Security/revenue critical, NestJS services are highly testable |
| `sui-media` | **80%** | **80%** | **80%** | CI-enforced | Core data layer, all components depend on it |
| `sui-file-explorer-v2` | **90%** | **85%** | **90%** | Target | New package, pure functions dominate, easy to cover fully |
| `sui-common` | **75%** | **70%** | **75%** | Target | Foundation utilities, high blast radius |
| `sui-common-api` | **85%** | **80%** | **85%** | Target | Pure models/DTOs — easy to test fully |
| `sui-file-explorer` | **70%** | **65%** | **70%** | Target | Complex plugin system, many DnD edge cases |
| `sui-timeline` | **65%** | **60%** | **65%** | Target | Heavy DOM interaction, harder to unit test |
| `sui-editor` | **60%** | **55%** | **60%** | Target | Orchestrator — integration tests more valuable than unit |
| `sui-github` | **50%** | **45%** | **50%** | Target | Display-only, low business risk |
| `sui-docs` | **40%** | **35%** | **40%** | Target | Documentation components, lowest risk |
| Docs API routes | **75%** | **70%** | **75%** | Target | Revenue-critical license/auth routes |

### 6.2 Jest Coverage Config Template

Use `packages/sui-media/jest.config.js` as the canonical template for new packages:

```javascript
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
};
```

### 6.3 CI Pipeline Expansion

Current pipeline covers `sui-media-api` and `sui-media` only. Target state:

```
push/PR → test-backend         (sui-media-api)         → Codecov [backend]
        → test-frontend        (sui-media)              → Codecov [frontend]
        → test-file-explorer-v2 (sui-file-explorer-v2)  → Codecov [file-explorer-v2]
        → test-common          (sui-common)              → Codecov [common]
        → test-common-api      (sui-common-api)          → Codecov [common-api]
        → test-file-explorer   (Mocha existing)          → Codecov [file-explorer]
        → test-timeline        (sui-timeline)            → Codecov [timeline]
        → test-editor          (sui-editor)              → Codecov [editor]
        → test-docs-api        (docs API routes)         → Codecov [docs-api]
        → coverage-report      (combined)                → PR comment with delta
        → test-e2e             (Playwright)              → On merge to main only
```

---

## 7. Specific Test Cases to Implement First

### 7.1 Priority 1 — File Explorer V2 Tree Operations (Pure Functions, Highest ROI)

These 8 functions in `packages/sui-file-explorer-v2/src/dnd/treeOps.ts` are pure, recursive tree manipulations. They are trivial to test and extremely dangerous if buggy.

#### `packages/sui-file-explorer-v2/src/dnd/__tests__/treeOps.test.ts` — NEW

```typescript
import { findItem, removeItem, insertBefore, insertAfter, insertChild,
         isDescendant, buildDepthMap, findParentId } from '../treeOps';
import type { FileItem } from '../../types';

const tree: FileItem[] = [
  { id: 'root-folder', label: 'Documents', fileType: 'folder', children: [
    { id: 'doc-1', label: 'Resume.pdf', fileType: 'pdf' },
    { id: 'sub-folder', label: 'Photos', fileType: 'folder', children: [
      { id: 'img-1', label: 'vacation.jpg', fileType: 'image' },
      { id: 'img-2', label: 'portrait.jpg', fileType: 'image' },
    ]},
    { id: 'doc-2', label: 'Notes.txt', fileType: 'doc' },
  ]},
  { id: 'trash', label: 'Trash', fileType: 'trash', children: [] },
  { id: 'video-1', label: 'demo.mp4', fileType: 'video' },
];

describe('treeOps', () => {
  describe('findItem', () => {
    it('should find root-level item by id');
    it('should find deeply nested item (img-1 inside sub-folder)');
    it('should return undefined for nonexistent id');
    it('should handle empty items array');
    it('should find item at any nesting depth');
  });

  describe('removeItem', () => {
    it('should remove root-level item');
    it('should remove nested item without affecting siblings');
    it('should remove item with children (entire subtree)');
    it('should return unchanged array for nonexistent id');
    it('should not mutate original array');
  });

  describe('insertBefore', () => {
    it('should insert before root-level item');
    it('should insert before nested item at correct position');
    it('should not insert if target id not found (item still pushed when parent has children)');
    it('should not mutate original array');
  });

  describe('insertAfter', () => {
    it('should insert after root-level item');
    it('should insert after last item in children');
    it('should insert after nested item');
    it('should not mutate original array');
  });

  describe('insertChild', () => {
    it('should insert as first child of folder');
    it('should create children array if target had no children');
    it('should prepend to existing children');
    it('should insert into deeply nested target');
    it('should not mutate original array');
  });

  describe('isDescendant', () => {
    it('should return true for direct child');
    it('should return true for deeply nested descendant');
    it('should return false for unrelated items');
    it('should return false when parent has no children');
    it('should return false for parent checking against itself');
  });

  describe('buildDepthMap', () => {
    it('should assign depth 0 to root items');
    it('should assign depth 1 to first-level children');
    it('should assign correct depths for deeply nested items');
    it('should include all items in the map');
    it('should handle empty array');
  });

  describe('findParentId', () => {
    it('should return null for root-level items');
    it('should return parent id for direct children');
    it('should return correct parent for deeply nested items');
    it('should return undefined for nonexistent item');
  });
});
```

#### `packages/sui-file-explorer-v2/src/__tests__/adapters.test.ts` — NEW

```typescript
import { fileBaseToFileItem, fileItemToFileBase } from '../adapters';
import type { FileBaseCompat } from '../adapters';
import type { FileItem } from '../types';

describe('adapters', () => {
  describe('fileBaseToFileItem', () => {
    it('should map name to label');
    it('should map image mediaType to image fileType');
    it('should map video mediaType to video fileType');
    it('should map application/pdf to pdf fileType');
    it('should map project/directory mediaType to folder fileType');
    it('should default unknown mediaType to doc');
    it('should map image/ prefix (e.g. image/png) to image');
    it('should map video/ prefix (e.g. video/mp4) to video');
    it('should recursively convert children');
    it('should omit children property when source has no children');
  });

  describe('fileItemToFileBase', () => {
    it('should map label to name');
    it('should map image fileType to image mediaType');
    it('should map video fileType to video mediaType');
    it('should map pdf fileType to application/pdf');
    it('should map folder fileType to project');
    it('should map pinned fileType to project');
    it('should map trash fileType to project');
    it('should map doc fileType to text/plain');
    it('should recursively convert children');
  });

  describe('round-trip', () => {
    it('should preserve data through fileBaseToFileItem then fileItemToFileBase');
    it('should preserve nested tree structure through round-trip');
  });
});
```

### 7.2 Priority 2 — File Explorer V2 DnD Provider Logic

#### `packages/sui-file-explorer-v2/src/dnd/__tests__/DndProvider.test.tsx` — NEW

```typescript
import { renderHook, act } from '@testing-library/react';
import { DndProvider } from '../DndProvider';
import type { FileItem } from '../../types';

describe('DndProvider', () => {
  describe('defaultCanMoveItem', () => {
    it('should allow moving to root (targetParentId === null)');
    it('should allow moving into folder');
    it('should allow moving into trash');
    it('should reject moving into non-container (image, doc, video, pdf)');
    it('should reject moving into nonexistent parent');
  });

  describe('applyInstruction', () => {
    it('should reorder item above target (reorder-above)');
    it('should reorder item below target (reorder-below)');
    it('should make item a child of target (make-child)');
    it('should reparent item after target (reparent)');
    it('should block circular reference (drop parent into own descendant)');
    it('should respect custom canMoveItem callback');
    it('should call onItemsChange with updated tree');
    it('should no-op for nonexistent source');
    it('should no-op for unknown instruction type');
  });
});
```

#### `packages/sui-file-explorer-v2/src/dnd/__tests__/useTreeItemDnd.test.ts` — NEW

```typescript
describe('useTreeItemDnd', () => {
  describe('instructionToAction', () => {
    it('should map reorder-above to reorder-above');
    it('should map reorder-below to reorder-below');
    it('should map make-child to make-child');
    it('should map reparent to move-to-parent');
    it('should return undefined for unknown instruction');
    it('should return undefined for undefined input');
  });

  describe('getItemMode', () => {
    it('should return expanded when hasChildren and isExpanded');
    it('should return standard when not expanded');
    it('should return standard when no children');
  });

  describe('CONTAINER_TYPES', () => {
    it('should include folder and trash');
    it('should not include image, pdf, doc, video');
  });
});
```

### 7.3 Priority 3 — File Explorer V2 Component Rendering

#### `packages/sui-file-explorer-v2/src/__tests__/FileExplorerV2.test.tsx` — NEW

```typescript
import { render, screen } from '@testing-library/react';
import { FileExplorerV2 } from '../FileExplorerV2';
import type { FileItem } from '../types';

const items: FileItem[] = [
  { id: '1', label: 'Documents', fileType: 'folder', children: [
    { id: '2', label: 'File.pdf', fileType: 'pdf' },
  ]},
  { id: '3', label: 'Image.jpg', fileType: 'image' },
];

describe('FileExplorerV2', () => {
  it('should render tree items with correct labels');
  it('should render without DnD by default (enableDnd=false)');
  it('should wrap tree in DndProvider when enableDnd=true');
  it('should sync items state when itemsProp changes');
  it('should call onItemsChange when items update internally');
  it('should apply default itemChildrenIndentation of 24');
  it('should pass custom sx to RichTreeView');
  it('should forward defaultExpandedItems to RichTreeView');
  it('should forward defaultSelectedItems to RichTreeView');
});
```

### 7.4 Priority 4 — License & Auth (Revenue-Critical)

#### `docs/src/modules/license/__tests__/licenseStore.test.ts` — NEW

```typescript
describe('licenseStore', () => {
  describe('activateLicense', () => {
    it('should activate a valid license key on a new hardware ID');
    it('should reject activation for an already-active license on different hardware');
    it('should reject activation for expired license');
    it('should reject activation for revoked license');
    it('should reject activation for nonexistent license key');
  });

  describe('validateLicense', () => {
    it('should return valid for active license within expiration');
    it('should return expired for license past expiration date');
    it('should return valid during grace period after expiration');
    it('should return invalid for deactivated license');
  });

  describe('deactivateLicense', () => {
    it('should deactivate an active license');
    it('should no-op for already deactivated license');
  });

  describe('createLicense', () => {
    it('should generate unique license key');
    it('should set initial status to pending');
    it('should associate license with correct product');
  });

  describe('listLicenseProducts', () => {
    it('should return all available products');
    it('should normalize product data via normalizeLicenseProduct()');
  });

  describe('renewLicenseBySubscriptionId', () => {
    it('should extend expiration for active subscription');
    it('should reactivate expired license on renewal');
  });
});
```

#### `docs/src/modules/license/__tests__/stripeClient.test.ts` — NEW

```typescript
describe('stripeClient', () => {
  describe('createCheckoutSession', () => {
    it('should create session with correct price and metadata');
    it('should include license product ID in metadata');
    it('should set subscription mode for recurring products');
    it('should set payment mode for one-time products');
  });

  describe('constructStripeWebhookEvent', () => {
    it('should verify valid webhook signature');
    it('should reject invalid webhook signature');
    it('should reject expired webhook timestamp');
  });
});
```

#### `docs/src/modules/auth/__tests__/authStore.test.ts` — NEW

```typescript
describe('authStore', () => {
  describe('register', () => {
    it('should hash password with bcrypt');
    it('should reject duplicate email registration');
    it('should assign admin role for @stoked-ui.com emails');
    it('should assign client role for other domains');
    it('should generate Gravatar URL from email');
  });

  describe('login', () => {
    it('should return JWT and user data for valid credentials');
    it('should reject login with wrong password');
    it('should reject login for nonexistent email');
  });

  describe('verifyToken', () => {
    it('should decode valid JWT and return user');
    it('should reject expired JWT');
    it('should reject malformed JWT');
  });

  describe('determineRole', () => {
    it('should return admin for @stoked-ui.com');
    it('should return client for other domains');
  });
});
```

### 7.5 Priority 5 — MediaFile (Core Data Model)

#### `packages/sui-media/src/MediaFile/__tests__/MediaFile.test.ts` — NEW

```typescript
describe('MediaFile', () => {
  describe('constructor', () => {
    it('should construct from fileBits with correct metadata');
    it('should generate a unique id on creation');
    it('should detect mediaType from MIME type');
    it('should set created timestamp to Date.now() by default');
    it('should accept custom created timestamp');
  });

  describe('fromUrl', () => {
    it('should fetch file from URL and create MediaFile');
    it('should apply exponential backoff on transient failures');
    it('should throw after max retries');
    it('should extract filename from URL');
    it('should use cache when file already fetched');
  });

  describe('fromBlob', () => {
    it('should create MediaFile from Blob with correct properties');
  });

  describe('fromFile', () => {
    it('should wrap native File as MediaFile');
    it('should preserve original File metadata');
  });

  describe('fromDataTransfer', () => {
    it('should extract files from DataTransfer event');
    it('should filter out files in FILES_TO_IGNORE list');
    it('should handle empty DataTransfer');
  });

  describe('extractVideoMetadata', () => {
    it('should extract duration, width, height from video element');
    it('should detect audio tracks via hasAudio()');
  });

  describe('extractAudioMetadata', () => {
    it('should extract duration and format from audio element');
  });

  describe('cache', () => {
    it('should store files in static cache by id');
    it('should return cached file on duplicate access');
  });
});
```

### 7.6 Priority 6 — Backend API Expansion

#### Expand `packages/sui-media-api/src/uploads/uploads.service.spec.ts`

```typescript
describe('UploadsService', () => {
  describe('initiateUpload', () => {
    it('should create session with correct part count for file size');
    it('should generate S3 key with correct prefix and extension');
    it('should return presigned URLs for first batch of parts');
    it('should detect duplicate via findExistingByHash()');
  });

  describe('getMorePresignedUrls', () => {
    it('should return URLs for remaining parts');
    it('should reject request for completed session');
  });

  describe('markPartCompleted', () => {
    it('should mark part and update session progress');
    it('should reject completion for nonexistent part');
  });

  describe('completeUpload', () => {
    it('should finalize S3 multipart upload');
    it('should fail if parts are incomplete');
    it('should update session status to completed');
  });

  describe('abortUpload', () => {
    it('should abort S3 multipart upload');
    it('should clean up session state');
  });

  describe('syncWithS3', () => {
    it('should reconcile local state with S3 parts');
  });
});
```

### 7.7 Priority 7 — Common Utilities

#### `packages/sui-common/src/FetchBackoff/__tests__/FetchBackoff.test.ts` — NEW

```typescript
describe('FetchBackoff', () => {
  it('should succeed on first attempt when fetch resolves');
  it('should retry on transient failure and succeed on second attempt');
  it('should apply exponential backoff between retries');
  it('should respect maximum retry count');
  it('should throw after exhausting all retries');
  it('should not retry on 4xx client errors');
  it('should retry on 5xx server errors');
});
```

### 7.8 Priority 8 — VideoController (Modified File)

#### `packages/sui-editor/src/Controllers/__tests__/VideoController.test.ts` — NEW

```typescript
describe('VideoController', () => {
  describe('getDrawData', () => {
    it('should calculate correct draw dimensions for fill mode');
    it('should calculate correct draw dimensions for contain mode');
    it('should calculate correct draw dimensions for cover mode');
    it('should calculate correct draw dimensions for none mode');
    it('should handle aspect ratio mismatch');
  });

  describe('preload', () => {
    it('should load video element and extract metadata');
    it('should populate ScreenshotStore from video');
    it('should set backgroundImage on preloaded track');
  });

  describe('static hasAudio', () => {
    it('should return true for video with audio tracks');
    it('should return false for video without audio tracks');
  });

  describe('state machine', () => {
    it('should transition through enter then start then update then leave');
    it('should sync video currentTime on update');
    it('should handle video.play() promise rejection');
  });
});
```

### 7.9 Priority 9 — Timeline & Engine

#### `packages/sui-timeline/src/Controller/__tests__/Controllers.test.ts` — NEW

```typescript
describe('Controllers', () => {
  it('should initialize in idle state');
  it('should transition to playing on play()');
  it('should transition to paused on pause()');
  it('should seek to specified time');
  it('should loop when reaching end with loop enabled');
  it('should emit state change events');
});
```

#### `packages/sui-timeline/src/Engine/__tests__/Engine.test.ts` — NEW

```typescript
describe('Engine', () => {
  it('should sequence actions in correct order');
  it('should handle overlapping actions');
  it('should fire events at correct timestamps');
  it('should stop cleanly when timeline ends');
  it('should support dynamic track add/remove');
});
```

---

## 8. Implementation Phases

### Phase 1 — Foundation + File Explorer V2 (Week 1-2)

Highest ROI: brand-new package with zero tests and pure-function-heavy code.

| Task | Target | Deliverable |
|------|--------|-------------|
| Add `jest.config.js` to `sui-file-explorer-v2` | `packages/sui-file-explorer-v2/` | Config, setup, test scripts |
| Write `treeOps.test.ts` | `src/dnd/__tests__/` | ~30 test cases for 8 functions |
| Write `adapters.test.ts` | `src/__tests__/` | ~20 test cases for adapters + round-trip |
| Write `DndProvider.test.tsx` | `src/dnd/__tests__/` | ~12 test cases for instruction dispatch |
| Write `FileExplorerV2.test.tsx` | `src/__tests__/` | ~9 test cases for component rendering |
| Write `useTreeItemDnd.test.ts` | `src/dnd/__tests__/` | ~8 test cases for helper functions |
| Add Jest to remaining packages | `sui-timeline`, `sui-editor`, `sui-common-api`, `sui-github` | Config files |
| Write license store tests | `docs/src/modules/license/` | `licenseStore.test.ts`, `stripeClient.test.ts` |
| Write auth store tests | `docs/src/modules/auth/` | `authStore.test.ts` |

### Phase 2 — Critical Path Coverage (Week 2-4)

Cover all P0 paths from Section 2.1.

| Task | Target |
|------|--------|
| Write MediaFile tests | `packages/sui-media/src/MediaFile/__tests__/MediaFile.test.ts` |
| Write API client, upload hook tests | `sui-media` hooks and API layer |
| Expand existing backend spec files | All 10 files in `sui-media-api/src/` |
| Write FetchBackoff, LocalDb, MimeType tests | `sui-common` |
| Write DTO/model validation tests | `sui-common-api` |

### Phase 3 — Component & Plugin Tests (Week 4-6)

Cover interactive UI and plugin systems.

| Task | Target |
|------|--------|
| Write VideoController tests | `sui-editor/src/Controllers/__tests__/` |
| Write Controller and Engine tests | `sui-timeline` |
| Write DnD plugin tests | `sui-file-explorer` |
| Write selection and keyboard nav plugin tests | `sui-file-explorer` |

### Phase 4 — Integration & E2E (Week 6-8)

Cross-package integration and end-to-end flows.

| Task | Target |
|------|--------|
| Editor ↔ Timeline integration tests | `test/integration/` |
| Frontend ↔ Backend upload E2E | Playwright or Jest integration |
| License checkout → activation E2E | Playwright |
| Expand CI pipeline to all packages | `.github/workflows/test-coverage.yml` |

---

## 9. Turbo Pipeline Configuration

Update `turbo.json` to support per-package Jest runs:

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

### Existing (Working)

```bash
# Root-level Mocha/Karma
pnpm test                          # ESLint + TypeScript + unit tests
pnpm test:unit                     # Mocha unit tests across packages
pnpm test:coverage                 # Mocha + nyc coverage
pnpm test:karma                    # Browser tests
pnpm test:e2e-website              # Playwright website E2E
pnpm tc <pattern>                  # Interactive test runner

# Per-package Jest (where configured)
cd packages/sui-media && pnpm test           # Jest
cd packages/sui-media && pnpm test:ci        # Jest CI (--ci --coverage --maxWorkers=2)
cd packages/sui-media-api && pnpm test       # Jest
cd packages/sui-media-api && pnpm test:e2e   # Jest E2E
cd packages/sui-common && pnpm test          # Jest
```

### Proposed Additions

```bash
# Root-level Turbo orchestration
"test:jest": "turbo run test:jest --continue --ui tui"
"test:jest:ci": "turbo run test:jest:ci --continue --ui tui"

# Per-package (add to packages missing test scripts)
"test:jest": "jest"
"test:jest:watch": "jest --watch"
"test:jest:coverage": "jest --coverage"
"test:jest:ci": "jest --ci --coverage --maxWorkers=2"
```

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dual framework (Mocha + Jest) confusion | Developer friction | Document which packages use which runner; never migrate existing Mocha tests |
| jsdom limitations for DnD/gesture tests | False passes in CI | Use Playwright for gesture-heavy integration tests; test DnD logic (treeOps, applyInstruction) via pure function tests |
| Flaky tests from async timing | CI trust erosion | Use `waitFor` / `findBy*` queries; mock timers for animations |
| MongoDB memory server startup time | Slow CI | Share connection across suites via `globalSetup`; use model mocking for unit tests |
| Inter-package mock drift | Tests pass but prod breaks | Add lightweight smoke tests importing real packages; type tests catch signature changes |
| Coverage gaming (testing trivial code) | False confidence | Review test quality in PRs, not just numbers; focus tests on Section 2.1 critical paths |
| Missing Husky pre-commit hooks | Tests not run before push | Add `lint-staged` + Husky hooks; or rely on CI as gatekeeper |
| Stripe/AWS mocks diverging from real APIs | Integration failures in prod | Pin SDK versions; add a small set of contract tests that hit sandbox APIs |
| Atlaskit Pragmatic DnD mock fidelity | DnD tests pass but real DnD broken | Keep treeOps tests pure (no mocks); test useTreeItemDnd integration via Playwright |

---

## 12. Quick-Start: First 5 Files to Write

Ranked by risk-reduction per effort:

| # | File | Why First |
|---|------|-----------|
| 1 | `packages/sui-file-explorer-v2/src/dnd/__tests__/treeOps.test.ts` | 8 pure recursive functions with zero tests — highest bug risk, easiest to test, no mocks needed |
| 2 | `packages/sui-file-explorer-v2/src/__tests__/adapters.test.ts` | Pure data conversion functions used by all v1 to v2 migrations, easy to test |
| 3 | `docs/src/modules/license/__tests__/licenseStore.test.ts` | Revenue-critical license lifecycle, pure functions, easy to test |
| 4 | `docs/src/modules/auth/__tests__/authStore.test.ts` | Security-critical auth flows, pure functions |
| 5 | `packages/sui-media/src/MediaFile/__tests__/MediaFile.test.ts` | Core data model used by every frontend component, 1004 lines untested |
