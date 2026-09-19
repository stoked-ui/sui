# SC_TEST: sui-media (`@stoked-ui/media`)

## Package Overview

**Priority:** Medium
**Package path:** `packages/sui-media`
**Entry point:** `src/index.ts`
**Lines of code:** ~17,500
**Existing test files:** 10
**Current coverage threshold:** 80% (branches, functions, lines, statements)
**Last updated:** 2026-03-03

The package is a comprehensive media management library with six major domains:
1. **Core file handling** — `MediaFile`, `WebFile`, `WebFileFactory`, `AppFile`, `AppOutputFile`, `Stage`
2. **Framework-agnostic abstractions** — `Auth`, `Router`, `Payment`, `Queue`, `KeyboardShortcuts`
3. **API client layer** — `MediaApiClient`, `UploadClient`
4. **React hooks** — `useMediaList`, `useMediaUpload`, `useMediaItem`, `useMediaUpdate`, `useMediaDelete`, `useResumeUpload`, `useMediaMetadataCache`, `MediaApiProvider`
5. **React components** — `MediaViewer` (with `useMediaViewerState`, `useAdaptiveBitrate`, `useMediaClassPlayback`), `MediaCard` (with `useHybridMetadata`, `useServerThumbnail`)
6. **Utilities** — `MediaType`, `Zip`, `FileSystemApi`, `performance/benchmark`, `performance/metrics`

---

## 1. Current Test Inventory

| Test File | Location | Coverage Area | Quality |
|-----------|----------|---------------|---------|
| `integration-backward-compatibility.test.ts` | `src/__tests__/` | Export smoke tests | Low — only checks `toBeDefined()` |
| `MediaViewer.test.tsx` | `src/components/MediaViewer/__tests__/` | Component render/interaction | Low — 5 basic render tests |
| `hooks.test.ts` | `src/components/MediaViewer/__tests__/` | `useMediaViewerState`, `useMediaClassPlayback` | Good — state transitions, phase management |
| `MediaCard.test.tsx` | `src/components/MediaCard/__tests__/` | Component render/modes | Low — 7 smoke tests, stubs |
| `MediaCard.utils.test.ts` | `src/components/MediaCard/__tests__/` | Pure utility functions | Good — edge cases, all functions covered |
| `Auth.test.ts` | `src/abstractions/__tests__/` | Auth abstraction + mocks | Good — NoOp, mock, contract, ~60 tests |
| `Queue.test.ts` | `src/abstractions/__tests__/` | Queue abstraction | Excellent — CRUD, navigation, reorder, ~40 tests |
| `Router.test.ts` | `src/abstractions/__tests__/` | Router abstraction | Good — NoOp + contract, ~15 tests |
| `Payment.test.ts` | `src/abstractions/__tests__/` | Payment abstraction | Good — mock payment, callbacks, ~30 tests |
| `KeyboardShortcuts.test.ts` | `src/abstractions/__tests__/` | Keyboard shortcuts | Excellent — registration, overlay, normalize, ~45 tests |

**Total existing tests:** ~250 test cases
**Abstraction layer coverage:** Strong (5/5 modules tested thoroughly)
**Everything else:** Weak to nonexistent

### Zero-Coverage Modules (Must Address)

| Module | File | LOC | Risk |
|--------|------|-----|------|
| `MediaApiClient` | `src/api/media-api-client.ts` | ~200 | **Critical** — all server communication |
| `UploadClient` | `src/api/upload-client.ts` | ~200 | **Critical** — resumable uploads, chunking, retry |
| `MediaFile` | `src/MediaFile/MediaFile.ts` | ~1,000 | **Critical** — core class, metadata extraction |
| `MediaType` | `src/MediaType/MediaType.ts` | ~50 | **High** — MIME classification drives component selection |
| React hooks (6 files) | `src/hooks/` | ~400 | **High** — all data fetching and mutations |
| `useHybridMetadata` | `src/components/MediaCard/useHybridMetadata.ts` | ~100 | **High** — client/server metadata strategy |
| `useAdaptiveBitrate` | `src/components/MediaViewer/hooks/useAdaptiveBitrate.ts` | ~100 | **High** — bitrate switching, EWMA |
| `useServerThumbnail` | `src/components/MediaCard/useServerThumbnail.ts` | ~100 | **Medium** — thumbnail generation |
| `WebFile` | `src/WebFile/WebFile.ts` | ~305 | **Medium** — persistence, versioning, checksum |
| `Zip` | `src/zip/Zip.ts` | ~86 | **Medium** — file compression, metadata extraction |
| `FileSystemApi` | `src/FileSystemApi/FileSystemApi.ts` | ~60 | **Medium** — browser file picker API |
| `PerformanceCollector` | `src/performance/metrics.ts` | ~100 | **Low** — instrumentation |
| `BenchmarkSuite` | `src/performance/benchmark.ts` | ~100 | **Low** — performance budgets |

---

## 2. Test Framework and Tooling

### Established Stack (do not change)

| Tool | Version | Purpose |
|------|---------|---------|
| **Jest** | 29.7.0 | Test runner |
| **ts-jest** | latest | TypeScript transformation (`jsdom` preset) |
| **@testing-library/react** | latest | Component rendering and interaction |
| **@testing-library/user-event** | latest | User interaction simulation |
| **@testing-library/jest-dom** | latest | Extended DOM assertion matchers |
| **identity-obj-proxy** | latest | CSS module mocking |

### Configuration

- **Jest config:** `packages/sui-media/jest.config.js`
- **Setup file:** `src/__tests__/setup.ts`
- **Environment:** `jsdom`
- **Vitest shim:** `src/__tests__/vitest-shim.ts` — maps `import { vi } from 'vitest'` to Jest's `jest` global

### Existing Setup Mocks (`src/__tests__/setup.ts`)

- `window.matchMedia` — returns `{ matches: false }` for all queries
- `IntersectionObserver` — no-op class
- `ResizeObserver` — no-op class
- `HTMLMediaElement.prototype.{load, play, pause}` — `play` returns `Promise.resolve()`
- `HTMLVideoElement.prototype.requestFullscreen` — returns `Promise.resolve()`
- `console.{error, warn}` — silenced via `jest.fn()`
- `global.fetch` — bare `jest.fn()` (must configure per test)

### Additions Needed (add to `setup.ts` or per-test)

| API | Where Used | Mock Strategy |
|-----|-----------|---------------|
| `URL.createObjectURL` / `URL.revokeObjectURL` | `MediaFile.getUrl()` | Return deterministic `blob:` URLs |
| `AudioContext` / `OfflineAudioContext` | `MediaFile.generateWaveformImage()`, `decodeAudioData` | Mock `decodeAudioData` → return mock `AudioBuffer` |
| `crypto.subtle.digest` | `UploadClient.generateFileHash()`, `WebFile.checksum()` | Return deterministic hash `ArrayBuffer` |
| `navigator.connection` | `useAdaptiveBitrate` (Network Information API) | Mock `{ downlink, effectiveType }` |
| `document.fullscreenElement` / `document.exitFullscreen` | `useMediaViewerState` | Track fullscreen state in mock |
| `window.showOpenFilePicker` / `window.showSaveFilePicker` | `FileSystemApi.ts` | Return mock `FileSystemFileHandle` |
| `CanvasRenderingContext2D` | `MediaFile.generateWaveformImage()` | `jest-canvas-mock` or manual stub |

### Existing Test Utilities

| File | Purpose |
|------|---------|
| `src/__tests__/utils/test-utils.tsx` | `createTestQueryClient()`, `renderWithProviders()`, `flushPromises()`, `createMockFile()`, `createMockVideoFile()`, `createMockImageFile()`, `createMockMedia()`, `createMockUploadSession()`, `createMockUploadStatus()` |
| `src/__tests__/mocks/api-client.mock.ts` | `MockMediaApiClient` with `setMockResponse()`, `setMockError()`, `getCallsFor()`, `reset()` — supports upload, media CRUD, metadata, thumbnail methods |
| `src/__tests__/vitest-shim.ts` | Maps `vi` to `jest`, re-exports `describe`, `it`, `expect`, `test`, `beforeAll`, `afterAll`, `beforeEach`, `afterEach` |

---

## 3. Test File Organization and Naming Conventions

### Directory Structure

```
src/
├── __tests__/
│   ├── setup.ts                                    # Global Jest setup
│   ├── vitest-shim.ts                              # Vitest → Jest compatibility
│   ├── integration-backward-compatibility.test.ts  # EXISTS
│   ├── integration-upload-flow.test.ts             # NEW (P2)
│   ├── mocks/
│   │   ├── api-client.mock.ts                      # EXISTS
│   │   ├── fetch.ts                                # NEW: fetch mock helpers
│   │   └── file.ts                                 # NEW: File/Blob factories
│   └── utils/
│       └── test-utils.tsx                          # EXISTS
├── MediaType/
│   └── __tests__/
│       └── MediaType.test.ts                       # NEW
├── MediaFile/
│   └── __tests__/
│       └── MediaFile.test.ts                       # NEW
├── WebFile/
│   └── __tests__/
│       └── WebFile.test.ts                         # NEW
├── FileSystemApi/
│   └── __tests__/
│       └── FileSystemApi.test.ts                   # NEW
├── zip/
│   └── __tests__/
│       └── Zip.test.ts                             # NEW
├── api/
│   └── __tests__/
│       ├── media-api-client.test.ts                # NEW
│       └── upload-client.test.ts                   # NEW
├── hooks/
│   └── __tests__/
│       ├── MediaApiProvider.test.tsx                # NEW
│       ├── useMediaList.test.tsx                    # NEW
│       ├── useMediaUpload.test.tsx                  # NEW
│       ├── useMediaItem.test.tsx                    # NEW
│       ├── useMediaUpdate.test.tsx                  # NEW
│       ├── useMediaDelete.test.tsx                  # NEW
│       └── useResumeUpload.test.tsx                 # NEW
├── performance/
│   └── __tests__/
│       ├── metrics.test.ts                         # NEW
│       └── benchmark.test.ts                       # NEW
├── components/
│   ├── MediaViewer/__tests__/
│   │   ├── MediaViewer.test.tsx                    # EXISTS — expand
│   │   ├── hooks.test.ts                           # EXISTS — expand
│   │   └── useAdaptiveBitrate.test.ts              # NEW
│   └── MediaCard/__tests__/
│       ├── MediaCard.test.tsx                      # EXISTS — expand
│       ├── MediaCard.utils.test.ts                 # EXISTS (complete)
│       ├── useHybridMetadata.test.ts               # NEW
│       └── useServerThumbnail.test.ts              # NEW
└── abstractions/__tests__/
    ├── Auth.test.ts                                # EXISTS (complete)
    ├── Queue.test.ts                               # EXISTS (complete)
    ├── Router.test.ts                              # EXISTS (complete)
    ├── Payment.test.ts                             # EXISTS (complete)
    └── KeyboardShortcuts.test.ts                   # EXISTS (complete)
```

### Naming Conventions

- **Test files:** `{ModuleName}.test.ts` or `{ModuleName}.test.tsx` (use `.tsx` for React components/hooks)
- **Test directories:** `__tests__/` co-located with source module
- **Describe blocks:** Match the class, function, or component name exactly
- **Test names:** Start with a verb — "returns", "throws", "renders", "calls", "handles", "creates"
- **Import style:** Use `import { describe, it, expect, vi } from 'vitest'` (shimmed to Jest) for consistency with existing tests

---

## 4. Mock/Stub Strategy

### 4.1 Fetch Mocking (API Client Tests)

**New file:** `src/__tests__/mocks/fetch.ts`

```typescript
export function mockFetch(responses: Record<string, {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}>) {
  return jest.fn((url: string, init?: RequestInit) => {
    const key = Object.keys(responses).find(k => url.includes(k));
    const response = key ? responses[key] : { status: 404, body: { message: 'Not found' } };
    return Promise.resolve({
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(response.body),
      text: () => Promise.resolve(JSON.stringify(response.body)),
      headers: new Headers(response.headers || {}),
    });
  }) as jest.Mock;
}

export function mockFetchError(error: Error) {
  return jest.fn(() => Promise.reject(error)) as jest.Mock;
}
```

**Usage:** Replace `global.fetch` in `beforeEach` / restore in `afterEach`.

### 4.2 File/Blob Mock Factories

**New file:** `src/__tests__/mocks/file.ts`

```typescript
export function createMockFile(name = 'test.mp4', size = 1024 * 1024, type = 'video/mp4'): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

export function createMockBlob(size = 1024, type = 'video/mp4'): Blob {
  return new Blob([new ArrayBuffer(size)], { type });
}

export function createMockDataTransfer(files: File[]): DataTransfer {
  const dt = new DataTransfer();
  files.forEach(f => dt.items.add(f));
  return dt;
}
```

> Note: `test-utils.tsx` already has `createMockFile`, `createMockVideoFile`, `createMockImageFile`. The new `file.ts` should re-export or consolidate to avoid duplication.

### 4.3 Browser API Mocks (extend `setup.ts`)

```typescript
// URL object mock
URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
URL.revokeObjectURL = jest.fn();

// crypto.subtle mock
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
    getRandomValues: jest.fn((arr: Uint8Array) => arr),
  },
});

// AudioContext mock
(global as any).AudioContext = class MockAudioContext {
  createBufferSource() { return { connect: jest.fn(), start: jest.fn(), buffer: null }; }
  decodeAudioData(buffer: ArrayBuffer) {
    return Promise.resolve({
      duration: 120,
      numberOfChannels: 2,
      sampleRate: 44100,
      length: 44100 * 120,
      getChannelData: jest.fn(() => new Float32Array(1024)),
    });
  }
  close() { return Promise.resolve(); }
};

// navigator.connection mock
Object.defineProperty(navigator, 'connection', {
  value: { downlink: 10, effectiveType: '4g' },
  configurable: true,
});
```

### 4.4 Abstraction Mocks (Already Built — Use As-Is)

The package provides production mock factories. Use these in component and hook tests:

| Factory | Import From | Returns |
|---------|------------|---------|
| `createMockAuth(user, options)` | `src/abstractions/Auth.ts` | `IAuth` with configurable permissions |
| `createInMemoryQueue(items)` | `src/abstractions/Queue.ts` | `IQueue` with full CRUD |
| `createInMemoryKeyboardShortcuts()` | `src/abstractions/KeyboardShortcuts.ts` | `IKeyboardShortcuts` |
| `createMockPayment(options)` | `src/abstractions/Payment.ts` | `IPayment` with auto-verify option |
| `noOpRouter` / `noOpAuth` / etc. | `src/abstractions/` | No-op singletons |

### 4.5 Internal Module Mocking Rules

| Module | When to Mock | When to Use Real |
|--------|-------------|-----------------|
| `MediaFile` | In component/hook tests that don't test file logic | In `MediaFile` unit tests |
| `MediaApiClient` | In hook tests — use `MockMediaApiClient` | In API client unit tests |
| `getMediaType()` | Never — pure, fast, no side effects | Always real |
| `PerformanceCollector` | In non-perf tests to prevent metric pollution | In performance tests |
| `JSZip` | Mock via `jest.mock('jszip')` with `generateAsync` stub | Never use real in tests |
| Abstraction factories | N/A — these ARE the mocks | Use in all component tests |

---

## 5. Coverage Targets

### Package-Level Threshold (already configured in `jest.config.js`)

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

### Per-Module Targets

| Module | Lines Target | Rationale |
|--------|-------------|-----------|
| `src/abstractions/` | 95% | Already near this; pure logic |
| `src/api/media-api-client.ts` | 90% | Network boundary — every error path matters |
| `src/api/upload-client.ts` | 85% | Complex state machine, retry logic |
| `src/MediaType/MediaType.ts` | 100% | 49 lines, pure function, no excuse |
| `src/zip/Zip.ts` | 90% | 86 lines, pure functions |
| `src/hooks/` | 80% | React Query integration, mock-heavy |
| `src/components/MediaCard/` | 80% | UI + logic (utils, hooks) |
| `src/components/MediaViewer/` | 75% | Complex state machine; fullscreen hard in jsdom |
| `src/MediaFile/MediaFile.ts` | 70% | 1000 lines, heavy browser API; some paths untestable in jsdom |
| `src/WebFile/WebFile.ts` | 80% | Versioning, checksum logic |
| `src/performance/` | 75% | Utility tier; lower priority |

### Coverage Exclusions (already configured)

```javascript
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',           // Type declarations
  '!src/**/*.stories.tsx',     // Storybook stories
  '!src/**/index.ts',          // Re-export barrels
  '!src/**/*.types.ts',        // Type-only files
]
```

---

## 6. Critical Test Paths — Priority Order

### P0 — Must Test First (data integrity, API correctness, user-facing flows)

| # | Module | Why Critical |
|---|--------|-------------|
| 1 | `MediaApiClient` | All server communication; auth injection, error mapping, timeout/abort |
| 2 | `UploadClient` | Resumable uploads, chunking, retry, progress; data loss risk |
| 3 | `MediaFile` | Core class; every component depends on it for metadata, URLs, factories |
| 4 | `useMediaUpload` | Primary upload UX; progress tracking, cancellation |
| 5 | `MediaCard` (expand) | Main UI surface; current tests are stubs |
| 6 | `MediaViewer` (expand) | Full-screen playback; keyboard, modes, queue |

### P1 — High Value (data flow, React integration)

| # | Module | Why Important |
|---|--------|--------------|
| 7 | `getMediaType()` | MIME classification drives component selection; pure, 100% testable |
| 8 | `useMediaItem` / `useMediaList` | Data fetching with caching; wrong cache = stale UI |
| 9 | `useHybridMetadata` | Client/server fallback strategy; timeout handling |
| 10 | `useAdaptiveBitrate` | EWMA bandwidth estimation; hysteresis; quality switching |
| 11 | `useServerThumbnail` | Auto-generation, retry logic, timestamp selection |
| 12 | `WebFile` | Persistence; checksum, versioning, dirty detection |
| 13 | `MediaApiProvider` | Context creation, missing provider error |
| 14 | `Zip` utilities | File packaging; data integrity |

### P2 — Important (utilities, infrastructure, integration)

| # | Module | Why |
|---|--------|-----|
| 15 | `FileSystemApi` | Browser file picker; fallback detection |
| 16 | `useMediaUpdate` / `useMediaDelete` | Mutation hooks |
| 17 | `useResumeUpload` | Active upload recovery |
| 18 | `PerformanceCollector` | Instrumentation singleton |
| 19 | `BenchmarkSuite` | Performance budget validation |
| 20 | Integration test: upload flow | End-to-end lifecycle |

---

## 7. Specific Test Cases to Implement

### 7.1 `src/api/__tests__/media-api-client.test.ts` (NEW — P0)

```
describe('MediaApiClient')
  describe('constructor')
    ✎ strips trailing slash from baseUrl
    ✎ sets default timeout to 30000
    ✎ merges custom headers with defaults

  describe('setAuthToken / clearAuthToken')
    ✎ adds Bearer token to all subsequent requests
    ✎ removes auth header after clearAuthToken

  describe('request pipeline (tested via public methods)')
    ✎ includes auth header when token is set
    ✎ omits auth header when no token
    ✎ throws with statusCode on non-OK response
    ✎ parses error message from JSON response body
    ✎ returns undefined for 204 No Content responses
    ✎ aborts on internal timeout (AbortController)
    ✎ throws 'Request was cancelled' when external signal is aborted
    ✎ combines external signal with internal timeout signal

  describe('getMedia')
    ✎ sends GET /media/:id
    ✎ returns parsed MediaDocument
    ✎ passes external abort signal
    ✎ throws on 404 with error message

  describe('listMedia')
    ✎ sends GET /media with no params by default
    ✎ appends pagination params (page, limit)
    ✎ appends filter params (type, status, publicity)
    ✎ appends sort params (sortBy, sortOrder)
    ✎ omits undefined/null query params

  describe('updateMedia')
    ✎ sends PATCH /media/:id with JSON body
    ✎ returns updated MediaDocument

  describe('deleteMedia')
    ✎ sends DELETE /media/:id
    ✎ returns void on 204

  describe('searchMedia')
    ✎ passes search query to listMedia params

  describe('interaction endpoints')
    ✎ likeMedia — POST /media/:id/like
    ✎ unlikeMedia — POST /media/:id/unlike
    ✎ dislikeMedia — POST /media/:id/dislike
    ✎ viewMedia — POST /media/:id/view

  describe('getMediaStats')
    ✎ GET /media/:id/stats
    ✎ returns stats object with views, likes, dislikes

  describe('metadata endpoints')
    ✎ extractMetadata — POST /media/:id/extract-metadata
    ✎ generateThumbnail — POST /media/:id/thumbnail with options
    ✎ generateSpriteSheet — POST /media/:id/sprite-sheet
```

---

### 7.2 `src/api/__tests__/upload-client.test.ts` (NEW — P0)

```
describe('UploadClient')
  describe('calculateChunkSize')
    ✎ returns DEFAULT_CHUNK_SIZE (10MB) for files under 100MB
    ✎ scales up for files over 100MB
    ✎ clamps preferred size to MIN_CHUNK_SIZE (5MB)
    ✎ clamps preferred size to MAX_CHUNK_SIZE (100MB)

  describe('generateFileHash')
    ✎ produces SHA-256 hash of file content via crypto.subtle
    ✎ produces same hash for identical files (deterministic)
    ✎ produces different hash for different files

  describe('initiateUpload')
    ✎ POST /upload/initiate with file metadata (name, size, mimeType)
    ✎ includes file hash when generateHash option is true
    ✎ handles hash generation failure gracefully (proceeds without hash)
    ✎ returns sessionId and presigned upload URLs

  describe('upload — full lifecycle')
    ✎ initiates → uploads chunks → completes → returns MediaDocument
    ✎ calls onProgress callback with percentage and speed
    ✎ calls onChunkComplete with part number counts
    ✎ returns existing media when server detects duplicate (via hash)
    ✎ throws UploadError when cancelled before start

  describe('uploadChunk')
    ✎ PUT chunk to presigned URL
    ✎ retries on network error up to MAX_RETRIES (3)
    ✎ extracts ETag from response header
    ✎ throws when no ETag in response

  describe('resumeUpload')
    ✎ GET /upload/:sessionId/status to find completed parts
    ✎ uploads only remaining parts
    ✎ throws ALREADY_COMPLETED for completed sessions
    ✎ throws for aborted/expired sessions

  describe('abortUpload')
    ✎ POST /upload/:sessionId/abort

  describe('getActiveUploads')
    ✎ GET /upload/active
    ✎ returns array of active upload sessions

  describe('UploadError')
    ✎ has name 'UploadError'
    ✎ preserves error code and original cause
```

---

### 7.3 `src/MediaFile/__tests__/MediaFile.test.ts` (NEW — P0)

```
describe('MediaFile')
  describe('constructor')
    ✎ creates instance with file bits, name, and options
    ✎ sets mediaType from MIME type via getMediaType()
    ✎ generates stable id from file name
    ✎ preserves custom options: url, description, duration, width, height

  describe('static fromFile')
    ✎ wraps a native File as MediaFile preserving name, size, type
    ✎ handles File with empty name

  describe('static fromBlob')
    ✎ creates MediaFile from Blob with given fileName
    ✎ infers MIME type from Blob.type

  describe('static fromUrl')
    ✎ fetches file from URL and creates MediaFile
    ✎ throws on network failure (fetch rejects)
    ✎ handles 404 response
    ✎ sets url property from source URL
    ✎ infers filename from URL path

  describe('static fromUrls')
    ✎ creates array of MediaFile from URL array
    ✎ handles empty array

  describe('static fromDataTransfer')
    ✎ extracts files from DataTransfer.files
    ✎ handles empty DataTransfer
    ✎ handles DataTransferItemList with file entries
    ✎ handles DataTransferItemList with directory entries

  describe('static from — universal factory')
    ✎ accepts File input → delegates to fromFile
    ✎ accepts Blob input → delegates to fromBlob
    ✎ accepts URL string input → delegates to fromUrl
    ✎ returns null for unsupported input types

  describe('static extractVideoMetadata')
    ✎ extracts duration from video file (loadedmetadata event)
    ✎ extracts videoWidth and videoHeight
    ✎ handles video load error (error event)
    ✎ handles video with Infinity duration

  describe('static extractAudioMetadata')
    ✎ extracts duration from audio via AudioContext.decodeAudioData
    ✎ handles audio decode error

  describe('extractMetadata')
    ✎ delegates to extractVideoMetadata for video/* MIME types
    ✎ delegates to extractAudioMetadata for audio/* MIME types
    ✎ returns empty metadata for non-media types (application/pdf, etc.)

  describe('static stableIdFromUrl')
    ✎ generates deterministic ID for same URL (idempotent)
    ✎ generates different IDs for different URLs
    ✎ handles URLs with query parameters
    ✎ handles empty/null/undefined URL

  describe('getUrl')
    ✎ returns stored url property if already set
    ✎ creates object URL via URL.createObjectURL when no url property
    ✎ revokes previous object URL on re-call

  describe('save')
    ✎ triggers file download via File System Access API when available
    ✎ falls back to anchor element download when API unavailable

  describe('metadata accessors')
    ✎ metadataBlob returns JSON Blob of metadata fields
    ✎ mediaProps returns serializable properties object
    ✎ metadata getter returns full IMediaFile metadata

  describe('static generateWaveformImage')
    ✎ creates canvas-based waveform visualization from audio buffer
    ✎ respects width/height options
    ✎ handles empty/zero-length audio buffer

  describe('cache behavior')
    ✎ static cache map stores metadata by file identifier
    ✎ metadata is reused on subsequent access for same file
```

---

### 7.4 `src/MediaType/__tests__/MediaType.test.ts` (NEW — P1)

```
describe('getMediaType')
  ✎ returns 'video' for video/mp4, video/webm, video/quicktime, video/x-msvideo
  ✎ returns 'audio' for audio/mpeg, audio/wav, audio/ogg, audio/flac
  ✎ returns 'image' for image/png, image/jpeg, image/gif, image/webp, image/svg+xml
  ✎ returns 'pdf' for application/pdf
  ✎ returns 'doc' for application/msword
  ✎ returns 'doc' for application/vnd.openxmlformats-officedocument.wordprocessingml.document
  ✎ returns 'json' for application/json
  ✎ returns 'text' for text/plain, text/html, text/csv
  ✎ returns 'lottie' for application/vnd.lottie+json
  ✎ returns 'file' for undefined input
  ✎ returns 'file' for empty string
  ✎ returns 'file' for unknown MIME types (application/octet-stream)
  ✎ returns 'folder' for inode/directory (if mapped)

describe('MimeMediaWildcardMap')
  ✎ contains entries for all major MIME categories
  ✎ wildcard patterns (video/*, audio/*, image/*) resolve correctly
  ✎ has catch-all fallback to 'file'
```

---

### 7.5 `src/hooks/__tests__/useMediaUpload.test.tsx` (NEW — P0)

```
describe('useMediaUpload')
  ✎ exposes upload function, isUploading, progress, cancel, error
  ✎ isUploading is false initially
  ✎ sets isUploading to true during upload
  ✎ calls onProgress with { progress, sessionId, completedParts, totalParts, speed, eta }
  ✎ calls onSuccess callback with MediaDocument on completion
  ✎ calls onError callback on failure
  ✎ supports cancellation via cancel() — sets isUploading to false
  ✎ invalidates ['media', 'list'] queries on success
  ✎ resets progress on new upload
  ✎ cleans up on component unmount (no state updates after unmount)
```

---

### 7.6 `src/hooks/__tests__/useMediaItem.test.tsx` (NEW — P1)

```
describe('useMediaItem')
  ✎ fetches media by ID via client.getMedia()
  ✎ returns loading state while fetching
  ✎ returns data on successful fetch
  ✎ returns error state on failure
  ✎ uses query key ['media', mediaId]
  ✎ does not fetch when enabled is false
  ✎ does not fetch when mediaId is null or undefined
  ✎ refetches at specified refetchInterval
  ✎ calls onSuccess callback with data
  ✎ calls onError callback with error
```

---

### 7.7 `src/hooks/__tests__/useMediaList.test.tsx` (NEW — P1)

```
describe('useMediaList')
  ✎ calls client.listMedia with default params
  ✎ constructs query key from params: ['media', 'list', serializedParams]
  ✎ passes pagination params (page, limit) to client
  ✎ passes filter params (type, status) to client
  ✎ passes sort params (sortBy, sortOrder) to client
  ✎ keeps previous data during refetch (keepPreviousData)
  ✎ refetches when params change (different query key)
  ✎ calls onSuccess callback
  ✎ calls onError callback
  ✎ respects enabled=false — does not fetch
```

---

### 7.8 Expand `src/components/MediaCard/__tests__/MediaCard.test.tsx` (P0)

Add to existing 7 tests:

```
describe('MediaCard — rendering variations')
  ✎ renders image media type with image thumbnail
  ✎ renders audio media type with audio indicator
  ✎ renders with missing thumbnail — shows placeholder
  ✎ renders loading skeleton when loading prop is true
  ✎ renders truncated title for very long names

describe('MediaCard — interactions')
  ✎ calls onViewClick with item when card body is clicked
  ✎ calls onEditClick when edit button is clicked (owner mode)
  ✎ calls onDeleteClick when delete button is clicked (owner mode)
  ✎ calls onTogglePublic when visibility toggle is clicked
  ✎ toggles selection on checkbox click in selection mode
  ✎ supports keyboard Enter to trigger view action
  ✎ supports keyboard Space to toggle selection

describe('MediaCard — owner vs viewer mode')
  ✎ hides edit/delete controls when auth.isOwner() returns false
  ✎ shows all controls when auth.isOwner() returns true
  ✎ shows controls when createMockAuth({ isOwnerOfAll: true }) is used

describe('MediaCard — payment integration')
  ✎ shows price badge for item with price > 0
  ✎ shows free indicator for item with price === 0
  ✎ gates view action behind payment for non-owner viewers

describe('MediaCard — queue integration')
  ✎ shows queue indicator when item is in queue
  ✎ allows adding item to queue via action

describe('MediaCard — accessibility')
  ✎ has correct ARIA labels on interactive controls
  ✎ supports Tab navigation between interactive elements
  ✎ announces media type to screen readers via aria-label
```

---

### 7.9 Expand `src/components/MediaViewer/__tests__/MediaViewer.test.tsx` (P0)

Add to existing 5 tests:

```
describe('MediaViewer — mode transitions')
  ✎ starts in NORMAL mode by default
  ✎ transitions to THEATER mode on theater button click
  ✎ transitions to FULLSCREEN mode on fullscreen button click
  ✎ returns to NORMAL mode on Escape key press

describe('MediaViewer — keyboard shortcuts')
  ✎ ArrowLeft navigates to previous item
  ✎ ArrowRight navigates to next item
  ✎ Space toggles play/pause
  ✎ f key toggles fullscreen
  ✎ does not respond to keyboard when enableKeyboardShortcuts=false

describe('MediaViewer — queue navigation')
  ✎ renders next-up header when queue has multiple items
  ✎ calls onNavigate with next item on ArrowRight
  ✎ calls onNavigate with previous item on ArrowLeft
  ✎ disables previous at index 0
  ✎ disables next at last index

describe('MediaViewer — owner controls')
  ✎ shows edit/delete buttons when auth.isOwner() is true
  ✎ hides edit/delete buttons when auth.isOwner() is false

describe('MediaViewer — error handling')
  ✎ shows error state when media fails to load
  ✎ shows fallback for unsupported format
```

---

### 7.10 `src/components/MediaViewer/__tests__/useAdaptiveBitrate.test.ts` (NEW — P1)

```
describe('useAdaptiveBitrate')
  ✎ returns fallbackUrl when no tracks available
  ✎ returns fallbackUrl when disabled (enabled=false)
  ✎ selects highest quality track within estimated bandwidth
  ✎ applies EWMA smoothing to bandwidth samples (alpha=0.3)
  ✎ upgrades quality when bandwidth exceeds UPGRADE_FACTOR (1.5x)
  ✎ downgrades quality when bandwidth drops below DOWNGRADE_FACTOR (0.8x)
  ✎ enforces 5s cooldown between automatic switches
  ✎ allows manual track selection via selectTrack()
  ✎ re-enables auto mode via enableAutoMode()
  ✎ seeds initial bandwidth from navigator.connection.downlink
  ✎ defaults to 5 Mbps when Network Information API unavailable
  ✎ handles single-track scenario (never attempts switch)
  ✎ caps bandwidth sample history at 10 entries
```

---

### 7.11 `src/components/MediaCard/__tests__/useHybridMetadata.test.ts` (NEW — P1)

```
describe('useHybridMetadata')
  ✎ uses client-side extraction for small files (<10MB default threshold)
  ✎ uses server-side extraction for large files (>10MB)
  ✎ respects preferServer option override
  ✎ falls back to client when server extraction times out (15s default)
  ✎ uses client timeout of 5s by default
  ✎ calls onMetadataLoaded callback with extracted metadata
  ✎ returns { isLoading: true } during extraction
  ✎ returns { error } when both client and server fail
  ✎ returns metadata: { duration, width, height, codec, bitrate, source }
  ✎ source field is 'client' or 'server' based on extraction method
  ✎ caches metadata for subsequent renders (same item)
  ✎ re-extracts when item changes
```

---

### 7.12 `src/components/MediaCard/__tests__/useServerThumbnail.test.ts` (NEW — P1)

```
describe('useServerThumbnail')
  ✎ returns existing thumbnailUrl if item already has one
  ✎ auto-generates thumbnail for video items without thumbnail
  ✎ does not auto-generate when autoGenerate option is false
  ✎ uses provided timestamp for thumbnail generation
  ✎ defaults to middle of video duration when no timestamp
  ✎ defaults to timestamp 0 when video duration unknown
  ✎ returns { isLoading: true } during generation
  ✎ returns { error, canRetry: true } on generation failure
  ✎ supports retry after failure
  ✎ respects custom size option
```

---

### 7.13 `src/WebFile/__tests__/WebFile.test.ts` (NEW — P1)

```
describe('WebFile')
  describe('constructor')
    ✎ initializes with required properties (name, type)
    ✎ sets version to 0 for new files

  describe('save')
    ✎ serializes data for download
    ✎ increments version on save
    ✎ uses File System Access API when showSaveFilePicker available

  describe('isDirty')
    ✎ returns false for freshly loaded file
    ✎ returns true after data modification
    ✎ returns false after successful save

  describe('checksum')
    ✎ computes SHA-256 of serialized data via crypto.subtle
    ✎ returns same hash for same data (deterministic)
    ✎ returns different hash after modification

  describe('createSaveRequest')
    ✎ returns serialized payload with metadata

  describe('static fromUrl')
    ✎ fetches and deserializes file from URL
    ✎ throws on network error

  describe('static fromLocalFile')
    ✎ reads and deserializes from File/Blob

  describe('static fromOpenDialog')
    ✎ opens file picker and loads selected file
    ✎ handles user cancel (returns null/undefined)
```

---

### 7.14 `src/zip/__tests__/Zip.test.ts` (NEW — P1)

```
describe('createZip')
  ✎ returns a File with same name and application/zip type
  ✎ compresses file content via JSZip

describe('extractMeta')
  ✎ separates ZipMetadata keys (id, name, description, created, etc.) from remaining
  ✎ handles objects with no metadata keys
  ✎ handles objects with only metadata keys

describe('pickProps')
  ✎ picks matching properties from source object
  ✎ returns empty object for no matches

describe('splitProps')
  ✎ splits source into root and remaining property groups
  ✎ preserves all original properties across both groups

describe('getMimeType')
  ✎ constructs MIME type: 'application/stoked-ui-timeline-{subType}'
  ✎ handles custom type parameter
```

---

### 7.15 `src/hooks/__tests__/MediaApiProvider.test.tsx` (NEW — P1)

```
describe('MediaApiProvider')
  ✎ renders children
  ✎ creates MediaApiClient from config.baseUrl and config.authToken
  ✎ creates UploadClient from config
  ✎ uses custom QueryClient when provided
  ✎ creates default QueryClient when none provided

describe('useMediaApiContext')
  ✎ throws when used outside MediaApiProvider
  ✎ returns context with apiClient, uploadClient, queryClient

describe('useMediaClient')
  ✎ returns MediaApiClient instance from context

describe('useUploadClient')
  ✎ returns UploadClient instance from context
```

---

### 7.16 `src/performance/__tests__/metrics.test.ts` (NEW — P2)

```
describe('PerformanceCollector')
  ✎ is a singleton (same instance on multiple imports)
  ✎ markStart records a performance mark
  ✎ markEnd calculates duration and stores metric
  ✎ getMetrics filters by MetricType
  ✎ getAverageTime calculates mean duration for a type
  ✎ caps stored metrics at 1000 (evicts oldest)
  ✎ export() returns all metrics as serializable array
  ✎ clear() removes all stored metrics
  ✎ does nothing when disabled (setEnabled(false))
  ✎ resumes collection when re-enabled
```

---

### 7.17 `src/performance/__tests__/benchmark.test.ts` (NEW — P2)

```
describe('PERFORMANCE_BUDGETS')
  ✎ defines budgets for render times (mediaCard: 100ms, mediaViewer: 200ms)
  ✎ defines budgets for bundle sizes (mediaCard: 50KB, total: 150KB)
  ✎ defines budgets for API operations (GET: 100ms, POST: 150ms)
  ✎ all thresholds are positive numbers

describe('BenchmarkSuite')
  ✎ runs benchmark with specified iterations
  ✎ excludes warmup iterations from results
  ✎ reports pass when duration < budget.target
  ✎ reports fail when duration > budget.threshold
  ✎ calculates mean, median, p95 across iterations
```

---

### 7.18 `src/__tests__/integration-upload-flow.test.ts` (NEW — P2)

```
describe('Upload Flow Integration')
  ✎ full lifecycle: initiate → upload chunks → complete → media appears in list
  ✎ resume: interrupt mid-upload → resume → complete
  ✎ cancel: start upload → cancel → verify cleanup
  ✎ duplicate detection: upload same file twice → second returns existing
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation & Infrastructure (Week 1)
1. Extend `src/__tests__/setup.ts` with missing browser API mocks
2. Create `src/__tests__/mocks/fetch.ts` — reusable fetch mock factory
3. Create `src/MediaType/__tests__/MediaType.test.ts` — pure function, quick win, 100% target
4. Create `src/zip/__tests__/Zip.test.ts` — pure functions, low complexity

### Phase 2: API Layer (Week 2)
5. Create `src/api/__tests__/media-api-client.test.ts` — critical network boundary
6. Create `src/api/__tests__/upload-client.test.ts` — complex upload state machine

### Phase 3: Core Classes & Hooks (Week 3)
7. Create `src/MediaFile/__tests__/MediaFile.test.ts` — core class
8. Create `src/hooks/__tests__/MediaApiProvider.test.tsx` — provider context
9. Create `src/hooks/__tests__/useMediaUpload.test.tsx` — upload UX
10. Create `src/hooks/__tests__/useMediaItem.test.tsx` — data fetching
11. Create `src/hooks/__tests__/useMediaList.test.tsx` — paginated list

### Phase 4: Component & Hook Expansion (Week 4)
12. Expand `MediaCard.test.tsx` — interactions, modes, payment, a11y
13. Expand `MediaViewer.test.tsx` — keyboard, modes, queue, errors
14. Create `useAdaptiveBitrate.test.ts` — EWMA, hysteresis, switching
15. Create `useHybridMetadata.test.ts` — client/server fallback
16. Create `useServerThumbnail.test.ts` — auto-generation, retry

### Phase 5: Remaining Modules & Integration (Week 5)
17. Create `WebFile.test.ts` — versioning, checksum, persistence
18. Create `metrics.test.ts` and `benchmark.test.ts` — performance
19. Create `integration-upload-flow.test.ts` — end-to-end scenario
20. Run full coverage report, fill gaps to meet 80% global threshold

---

## 9. Running Tests

```bash
# Run all tests
cd packages/sui-media && pnpm test

# Run with coverage report
pnpm test:coverage

# Run specific test file
pnpm test -- --testPathPattern="media-api-client"

# Run tests matching a describe/test name
pnpm test -- -t "getMediaType"

# Run in watch mode (re-runs on file change)
pnpm test:watch

# Run CI mode (coverage + thresholds enforced, 2 workers)
pnpm test:ci

# Run only tests affected by uncommitted changes
pnpm test -- --onlyChanged
```

---

## 10. Edge Cases Checklist

| Area | Edge Cases to Cover |
|------|-------------------|
| **MediaFile factories** | Zero-byte files, corrupted headers, missing MIME types, `fromUrl` network timeout, concurrent `fromDataTransfer` calls, recursive directory entries |
| **Upload** | Resume after network loss, chunk boundary alignment (file size not divisible by chunk size), file hash collision, cancellation mid-chunk, 0-byte file upload, file > MAX_CHUNK_SIZE (100MB) |
| **API Client** | 401/403 responses, timeout races between internal and external AbortControllers, malformed JSON body, concurrent requests sharing one auth token, token update during in-flight request |
| **Components** | Missing/null media items, extremely long titles (overflow/truncation), zero-duration videos, unsupported MIME types, rapid prop changes causing re-renders, unmount during async thumbnail generation |
| **React Hooks** | Component unmount during fetch (no state update after unmount), stale closure over callbacks, React Strict Mode double-mount, query key collisions between different param sets |
| **Adaptive Bitrate** | No available tracks, single track only, bandwidth drops to 0, rapid oscillation prevention (hysteresis + cooldown), Network Information API absent, manual override during cooldown |
| **Hybrid Metadata** | Server timeout then client timeout (both fail), file exactly at size threshold (10MB), server returns partial metadata, client extraction takes longer than timeout |
| **WebFile** | Checksum of empty data, version overflow (very large number), save when File System Access API denied by user, fromUrl with redirect |

---

## 11. Key Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| `jsdom` lacks real media API support | Video/audio metadata tests unreliable | Mock `HTMLVideoElement`/`HTMLAudioElement` — fire `loadedmetadata` and `error` events manually |
| File System Access API is Chrome-only | `openFileApi`/`saveFileApi` can't run in jsdom | Mock `showOpenFilePicker`/`showSaveFilePicker`; test fallback paths explicitly |
| `crypto.subtle` may not exist in jsdom | `WebFile.checksum()` and `UploadClient.generateFileHash()` crash | Add `crypto.subtle.digest` mock to `setup.ts` |
| React Query caching makes tests stateful | Tests leak state between runs | Use `createTestQueryClient()` per test (already available); call `queryClient.clear()` in `afterEach` |
| CanvasRenderingContext2D not in jsdom | `generateWaveformImage` crashes | Use `jest-canvas-mock` or manual `getContext` stub |
| Large test suite slows CI | Developer friction | Use `--maxWorkers=2` (already in `test:ci`); split into shards if total exceeds 5 minutes |
| Abstraction mocks diverge from real implementations | Integration bugs missed | Existing contract tests in `abstractions/__tests__/` already validate mock ↔ interface alignment |

---

## 12. Notes

- All existing tests use `import { describe, it, expect, vi } from 'vitest'` which is shimmed to Jest. **New tests must follow the same pattern** for consistency.
- The `global.fetch` mock in `setup.ts` is a bare `jest.fn()` — individual tests must configure response behavior per test case.
- The 80% coverage threshold is already configured and enforced. The priority is filling gaps in untested modules, not raising the threshold.
- `collectCoverageFrom` excludes `index.ts`, `*.d.ts`, `*.stories.tsx`, and `*.types.ts` — correct, do not change.
- The `MockMediaApiClient` in `src/__tests__/mocks/api-client.mock.ts` already has call tracking (`getCallsFor`) — use this in hook tests to verify correct API calls without mocking fetch.
- The `UploadClient` tests are the most complex due to multi-step state machine (initiate → chunk → mark complete → get more URLs → complete). Use sequential mock assertions with `expect(fetch).toHaveBeenNthCalledWith()`.
