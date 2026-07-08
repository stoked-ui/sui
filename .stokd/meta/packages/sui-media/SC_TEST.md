# SC_TEST: sui-media (`@stoked-ui/media`)

## Package Overview

**Priority:** Medium
**Package path:** `packages/sui-media`
**Entry point:** `src/index.ts` · **Server entry:** `src/server/index.ts`
**Lines of source (non-test):** ~16,500
**Existing test suites:** 11 (`205` cases — `197` passing, `8` skipped/todo)
**Test runner:** Jest 29 + `ts-jest` + `jsdom`
**Coverage threshold:** 80% (branches, functions, lines, statements) — **currently failing: measured ~31% stmts/branches/lines, ~27% functions** (see §5)
**Last verified against source:** 2026-07-02 (TIMED REFRESH — recounted suites/cases against source: still 11 suites · 205 cases, no source change to `src/` since the 2026-06-22 pass. New this refresh: measured real coverage now that `jest --coverage` works again (§5, §9); added `Stage` to the zero-coverage targets with a new §7.19 plan — its registry keys are now a governed editor contract per `packages/sui-media/.axioms.md` `AX-MOD-SUIMEDIA-010` — and pinned the `#stage-${host}` cache-key quirk in §10)

> ⚠️ **Run under Node 20, not Node 26.** Node 26 breaks the umbrella mocha runner; this package is Jest, but the repo convention is to keep Node 20 (`nvm use v20.20.0`) on `PATH` for all test work. `@stoked-ui/media` and `@stoked-ui/common` are the **only** publishable packages allowed to run a standalone Jest stack — do not add Jest to other packages (it breaks the umbrella mocha glob).

The package has six domains, each with a distinct testing posture:

1. **Core file classes** — `MediaFile` (1,022 LOC), `WebFile`, `WebFileFactory`, `App`/`AppFile`/`AppOutputFile`, `Stage` — runtime types consumed by editor/timeline/file-explorer.
2. **Framework-agnostic abstractions** — `Auth`, `Router`, `Payment`, `Queue`, `KeyboardShortcuts` — **fully tested** (contract + no-op + in-memory factories).
3. **API client layer** — `MediaApiClient` (402 LOC), `UploadClient` (573 LOC) — **zero unit coverage** (highest risk).
4. **React-Query hooks** — `MediaApiProvider`, `useMediaList`, `useMediaItem`, `useMediaUpdate`, `useMediaDelete`, `useMediaUpload`, `useActiveUploads`, `useMediaGallery`, `useMediaMetadataCache` — **zero unit coverage**.
5. **React components** — `MediaViewer` (+ `useMediaViewerState`/`useAdaptiveBitrate`/`useMediaClassPlayback`), `MediaCard` (+ `useHybridMetadata`/`useServerThumbnail`), `MediaGallery`, `WebUserDirectChat`.
6. **Utilities** — `MediaType`, `zip/Zip`, `FileSystemApi`, `performance/{benchmark,metrics}`.

---

## 1. Current Test Inventory

Verified 2026-06-06 by counting `it()`/`test()` declarations in each suite.

| Test File | Location | Cases | Coverage Area | Quality |
|-----------|----------|------:|---------------|---------|
| `integration-backward-compatibility.test.ts` | `src/__tests__/` | 6 | Export smoke (`toBeDefined()`) | Low — barrel presence only |
| `Auth.test.ts` | `src/abstractions/__tests__/` | 24 | `NoOpAuth`, `createMockAuth`, contract | Good |
| `Queue.test.ts` | `src/abstractions/__tests__/` | 45 | CRUD, navigation, reorder | Excellent |
| `Router.test.ts` | `src/abstractions/__tests__/` | 12 | `NoOpRouter` + contract | Good |
| `Payment.test.ts` | `src/abstractions/__tests__/` | 24 | `createMockPayment`, callbacks | Good |
| `KeyboardShortcuts.test.ts` | `src/abstractions/__tests__/` | 37 (+8 skipped) | registration, overlay, normalize | Excellent |
| `MediaCard.test.tsx` | `src/components/MediaCard/__tests__/` | 10 | render/modes | Low–Medium — smoke + stubs |
| `MediaCard.utils.test.ts` | `src/components/MediaCard/__tests__/` | 15 | pure utils | Good — complete |
| `MediaViewer.test.tsx` | `src/components/MediaViewer/__tests__/` | 5 | basic render | Low |
| `hooks.test.ts` | `src/components/MediaViewer/__tests__/` | 10 | `useMediaViewerState`, `useMediaClassPlayback` | Good — state/phase transitions |
| `WebUserDirectChat.test.tsx` | `src/components/WebUserDirectChat/__tests__/` | 9 | full chat flow (steps, validation, submit, retry, prefill) | **Good — behavioral, the model suite to copy** |

**Totals:** 11 suites · 205 cases · 197 passing · 8 skipped (all in `KeyboardShortcuts.test.ts`).
**Strong:** abstractions (5/5), `WebUserDirectChat`, `MediaCard.utils`, MediaViewer state hooks.
**Weak/none:** API clients, all data hooks, `MediaFile`, `MediaType`, `WebFile`, `zip`, `FileSystemApi`, `performance/*`.

### Zero-Coverage Modules (priority targets)

| Module | File | LOC | Risk | Notes |
|--------|------|----:|------|-------|
| `UploadClient` | `src/api/upload-client.ts` | 573 | **Critical** | resumable multipart, retry, chunk math, dedup hash — data-loss risk |
| `MediaApiClient` | `src/api/media-api-client.ts` | 402 | **Critical** | every server call; auth injection, error mapping, timeout/abort |
| `MediaFile` | `src/MediaFile/MediaFile.ts` | 1,022 | **Critical** | core runtime type for editor/timeline/file-explorer |
| React-Query hooks | `src/hooks/*` | ~360 | **High** | data fetching + mutations + cache keys (a public contract) |
| `useHybridMetadata` / `useServerThumbnail` | `src/components/MediaCard/` | ~254 | **High** | gate the MediaCard render path (blank → rendered) |
| `useAdaptiveBitrate` | `src/components/MediaViewer/hooks/` | 321 | **High** | EWMA bandwidth, hysteresis, cooldown |
| `getMediaType` / `MimeMediaWildcardMap` | `src/MediaType/MediaType.ts` | 47 | **High** | drives controller/icon selection across 3 downstream packages; pure — 100% achievable |
| `Stage` | `src/Stage/Stage.ts` | 85 | **High** | shadow-DOM registry the editor's `VideoController` mounts `<video>` into; key pattern is a governed contract (`AX-MOD-SUIMEDIA-010`) with a latent cache-key quirk (§7.19, §10) |
| `WebFile` | `src/WebFile/WebFile.ts` | 304 | **Medium** | persistence, versioning, checksum, IDB version-entry guard |
| `zip/Zip.ts` | `src/zip/Zip.ts` | 86 | **Medium** | project bundling; `splitProps`/`pickProps` have a latent quirk (see §10) |
| `FileSystemApi` | `src/FileSystemApi/FileSystemApi.ts` | ~60 | **Medium** | modern + deprecated picker fallback |
| `MediaGallery` | `src/components/MediaGallery/MediaGallery.tsx` | 165 | **Medium** | masonry + MediaViewer overlay wiring |
| `PerformanceCollector` / `BenchmarkSuite` | `src/performance/*` | ~759 | **Low** | instrumentation; not on public barrel |

---

## 2. Test Framework and Tooling

### Established Stack (do not change)

| Tool | Purpose |
|------|---------|
| **Jest 29.7.0** | Test runner (`testEnvironment: 'jsdom'`) |
| **ts-jest 29** | TS transform; `isolatedModules: true` (no type-checking in tests — types are guarded by `pnpm build`) |
| **@testing-library/react 14** | Component render + `renderHook` |
| **@testing-library/user-event 14** | User interaction (import directly, **not** re-exported from `test-utils`) |
| **@testing-library/jest-dom 6** | DOM matchers |
| **identity-obj-proxy** | CSS-module mock |
| **formdata-node 6** | lets `UploadClient` build multipart bodies under Node/Jest |
| **jszip 3** | real in `createZip`; **mock it** in `Zip` unit tests |

### Configuration (`jest.config.js`)

- `roots: ['<rootDir>/src']`, `setupFilesAfterEach: src/__tests__/setup.ts`
- `moduleNameMapper`: `*.css → identity-obj-proxy`, `vitest → src/__tests__/vitest-shim.ts`, `@/* → src/*`
- `transformIgnorePatterns` un-ignores `bson|mongodb|mongoose|@nestjs/mongoose` (so `@stoked-ui/common` re-exports transpile)
- `collectCoverageFrom` excludes `*.d.ts`, `*.stories.tsx`, `index.ts`, `*.types.ts` — correct, keep as-is.

### Existing setup mocks (`src/__tests__/setup.ts`)

`window.matchMedia` (→ `{matches:false}`), `IntersectionObserver`, `ResizeObserver`, `HTMLMediaElement.{load,play,pause}`, `HTMLVideoElement.requestFullscreen`, `console.{error,warn}` silenced, and a bare `global.fetch = jest.fn()` (**you must configure responses per test**).

### Browser-API mocks still missing (add to `setup.ts` or per-test)

| API | Needed by | Strategy |
|-----|-----------|----------|
| `URL.createObjectURL` / `revokeObjectURL` | `MediaFile.getUrl()` | deterministic `blob:` string + spy |
| `crypto.subtle.digest('SHA-256', …)` | `UploadClient.generateFileHash`, `WebFile.checksum` | resolve a fixed `ArrayBuffer(32)` |
| `btoa` | `UploadClient.generateFileHash` (base64 of hash) | present in jsdom; verify in CI |
| `AudioContext` / `decodeAudioData` | `MediaFile` audio metadata + waveform | mock returning `{duration,numberOfChannels,sampleRate,length,getChannelData}` |
| `CanvasRenderingContext2D` | `MediaFile.generateWaveformImage` | `jest-canvas-mock` or manual `getContext` stub |
| `navigator.connection` | `useAdaptiveBitrate` initial bandwidth seed | `{ downlink: 10, effectiveType: '4g' }` |
| `document.fullscreenElement` / `exitFullscreen` | `useMediaViewerState` | track in a mutable mock |
| `showOpenFilePicker` / `showSaveFilePicker` | `FileSystemApi`, `WebFile` | return mock `FileSystemFileHandle`; also test the **deprecated fallback** path |
| `HTMLVideoElement` `loadedmetadata`/`error` events + `videoWidth`/`videoHeight`/`duration` | `MediaFile.extractVideoMetadata` | set props then `el.dispatchEvent(new Event('loadedmetadata'))` |

### Existing helpers

| File | Provides |
|------|----------|
| `src/__tests__/utils/test-utils.tsx` | `createTestQueryClient()` (retry off, `gcTime:0`), `renderWithProviders()`, `flushPromises()`, `createMockFile/VideoFile/ImageFile()`, `createMockMedia()`, `createMockUploadSession()`, `createMockUploadStatus()`; re-exports `@testing-library/react` |
| `src/__tests__/mocks/api-client.mock.ts` | `MockMediaApiClient` with `setMockResponse`/`setMockError`/`getCallsFor`/`reset` |
| `src/__tests__/vitest-shim.ts` | maps `import { vi } from 'vitest'` → Jest globals |

> 🔴 **`MockMediaApiClient` has drifted from the real clients — do not trust it for call-shape assertions.** It merges media + upload methods onto one object, but: it names the part method `markPartCompleted` (real `UploadClient.markPartComplete`), `getUploadStatus(sessionId, includeUrls)` (real signature is `(sessionId, signal)` with no `includeUrls`), and `generateThumbnail(id, options)` (real is `(id, timestamp, size?, signal?)`). Use it as a convenience double for hook *state* tests, but when asserting exact HTTP calls, **mock `fetch`** against the endpoints in §7.1/§7.2, or write a small purpose-built upload double. Realigning this mock to the live clients is itself a worthwhile task.

---

## 3. Test File Organization & Naming

```
src/
├── __tests__/
│   ├── setup.ts                                    # EXISTS — extend (browser-API mocks)
│   ├── vitest-shim.ts                              # EXISTS
│   ├── integration-backward-compatibility.test.ts  # EXISTS
│   ├── integration-upload-flow.test.ts             # NEW (P2)
│   ├── mocks/
│   │   ├── api-client.mock.ts                      # EXISTS — realign to live clients
│   │   └── fetch.ts                                # NEW — reusable fetch factory
│   └── utils/test-utils.tsx                        # EXISTS
├── MediaType/__tests__/MediaType.test.ts           # NEW (P1, 100% target)
├── MediaFile/__tests__/MediaFile.test.ts           # NEW (P0)
├── WebFile/__tests__/WebFile.test.ts               # NEW (P1)
├── zip/__tests__/Zip.test.ts                       # NEW (P1)
├── FileSystemApi/__tests__/FileSystemApi.test.ts   # NEW (P2)
├── Stage/__tests__/Stage.test.ts                   # NEW (P1, AX-MOD-SUIMEDIA-010)
├── api/__tests__/
│   ├── media-api-client.test.ts                    # NEW (P0)
│   └── upload-client.test.ts                       # NEW (P0)
├── hooks/__tests__/
│   ├── MediaApiProvider.test.tsx                   # NEW (P1)
│   ├── useMediaUpload.test.tsx                      # NEW (P0)
│   ├── useMediaItem.test.tsx                        # NEW (P1)
│   ├── useMediaList.test.tsx                        # NEW (P1)
│   ├── useMediaUpdate.test.tsx                      # NEW (P2)
│   ├── useMediaDelete.test.tsx                      # NEW (P2)
│   └── useActiveUploads.test.tsx                    # NEW (P2)  ← file is useResumeUpload.ts, export is useActiveUploads
├── performance/__tests__/{metrics,benchmark}.test.ts  # NEW (P2)
└── components/
    ├── MediaViewer/__tests__/
    │   ├── MediaViewer.test.tsx                    # EXISTS — expand
    │   ├── hooks.test.ts                           # EXISTS — expand
    │   └── useAdaptiveBitrate.test.ts              # NEW (P1)
    ├── MediaCard/__tests__/
    │   ├── MediaCard.test.tsx                      # EXISTS — expand
    │   ├── MediaCard.utils.test.ts                 # EXISTS (complete)
    │   ├── useHybridMetadata.test.ts               # NEW (P1)
    │   └── useServerThumbnail.test.ts             # NEW (P1)
    ├── MediaGallery/__tests__/MediaGallery.test.tsx # NEW (P2)
    └── WebUserDirectChat/__tests__/WebUserDirectChat.test.tsx  # EXISTS (model suite)
```

### Conventions
- **File:** `{ModuleName}.test.ts(x)` co-located in a sibling `__tests__/`. Use `.tsx` for components/hooks.
- **`describe`** matches the class/function/component name exactly.
- **Test names** start with a verb: "returns", "throws", "renders", "calls", "invalidates", "retries".
- **Import style:** existing tests use `import { describe, it, expect, vi } from 'vitest'` (shimmed to Jest). New tests should follow it for consistency, or import nothing and use Jest globals — both work.

---

## 4. Mock / Stub Strategy

### 4.1 `fetch` factory — `src/__tests__/mocks/fetch.ts` (NEW)

```typescript
export function mockFetch(routes: Record<string, {
  status: number; body?: unknown; headers?: Record<string, string>;
}>) {
  return jest.fn((url: string) => {
    const key = Object.keys(routes).find((k) => url.includes(k));
    const r = key ? routes[key] : { status: 404, body: { message: 'Not found' } };
    return Promise.resolve({
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      statusText: r.status === 204 ? 'No Content' : 'OK',
      json: () => Promise.resolve(r.body),
      headers: new Headers(r.headers ?? {}),
    } as Response);
  });
}
export const mockFetchReject = (e: Error) => jest.fn(() => Promise.reject(e));
```
Assign to `global.fetch` in `beforeEach`, restore in `afterEach`. For `UploadClient` use ordered `mockResolvedValueOnce` chains and assert with `expect(fetch).toHaveBeenNthCalledWith(n, url, init)` — order matters (initiate → urls → PUT chunk → mark part → complete).

### 4.2 Abstraction doubles — already shipped, use as-is

`createMockAuth(user, { isOwnerOfAll })`, `createInMemoryQueue(items)`, `createInMemoryKeyboardShortcuts()`, `createMockPayment({ autoVerify })`, and the `noOp*` singletons. These ARE the mocks for `MediaViewer`/`MediaCard`/`MediaGallery` — never re-mock them.

### 4.3 Hook tests — inject clients via provider

`MediaApiProvider` exposes `MediaApiClient`/`UploadClient` through context (`useMediaApiContext`/`useMediaClient`/`useUploadClient`). Two viable strategies:
1. **Mock `fetch`** and let the real clients run (highest fidelity; matches the user's preference for integration-style tests over mocks).
2. Render with a `QueryClientProvider` + a provider whose clients are doubles. Wrap with `createTestQueryClient()` and call `queryClient.clear()` in `afterEach` to prevent cache bleed.

### 4.4 Internal-module mocking rules

| Module | Mock when | Use real when |
|--------|-----------|---------------|
| `getMediaType()` | never (pure) | always |
| `JSZip` | in `Zip` unit tests (`jest.mock('jszip')` → `generateAsync` stub) | never in tests |
| `MediaApiClient`/`UploadClient` | in hook *state* tests | in their own unit tests (mock `fetch`) |
| `crypto.subtle` | always (jsdom lacks it) | n/a |
| `PerformanceCollector` | in non-perf tests (avoid metric pollution) | in perf tests |

---

## 5. Coverage Targets

Global threshold is **80%** (enforced via `test:ci`) — but as of 2026-07-02 the check is **red**: measured coverage is **~31%** statements/branches/lines and **~27%** functions, because `src/api/`, `src/hooks/`, `src/server/`, `src/performance/`, `src/zip/`, `src/MediaFile/`, and `src/Stage/` are untested. This was previously invisible: a repo-wide `jest --coverage` break (root `glob: ">=10.5.0"` pnpm override vs Jest's glob-v7 consumers) made coverage runs crash; it was fixed 2026-07-02 with scoped overrides (`test-exclude>glob`, `@jest/reporters>glob`, `jest-config>glob`, `jest-runtime>glob` in the root `package.json`). **The remedy is writing the planned suites below — do not lower the threshold** (that is itself an axiom acceptance check in `packages/sui-media/.axioms.md`). Per-module aims:

| Module | Lines | Rationale |
|--------|------:|-----------|
| `src/abstractions/*` | 95% | already near; pure logic |
| `src/MediaType/MediaType.ts` | 100% | 47 lines, pure — no excuse |
| `src/zip/Zip.ts` | 90% | pure functions |
| `src/api/media-api-client.ts` | 90% | every error/abort path matters |
| `src/api/upload-client.ts` | 85% | multi-step state machine, retry |
| `src/hooks/*` | 80% | React-Query integration |
| `src/components/MediaCard/*` | 80% | utils + hooks carry the logic |
| `src/components/MediaViewer/*` | 75% | fullscreen/ABR hard in jsdom |
| `src/WebFile/WebFile.ts` | 80% | versioning/checksum |
| `src/MediaFile/MediaFile.ts` | 70% | 1,022 lines, heavy browser API; some paths unreachable in jsdom |
| `src/Stage/Stage.ts` | 95% | 85 lines, pure DOM; governed editor contract (`AX-MOD-SUIMEDIA-010`) |
| `src/performance/*` | 75% | utility tier |

---

## 6. Critical Paths — Priority Order

### P0 (data integrity, API correctness, primary UX)
1. `MediaApiClient` — auth injection, error mapping, 204 handling, timeout vs cancel
2. `UploadClient` — chunk math, retry, ETag, resume, dedup, abort
3. `MediaFile` — factories, metadata extraction, `getUrl`, stable IDs
4. `useMediaUpload` — progress, cancel, **`['media','list']` invalidation**, the stale-closure speed bug (§10)
5. expand `MediaCard.test.tsx` — interactions, owner/viewer, payment, queue, a11y
6. expand `MediaViewer.test.tsx` — modes, keyboard, queue nav, errors

### P1 (data flow + React integration)
7. `getMediaType()` — pure, 100% target
8. `useMediaItem` / `useMediaList` — cache keys + callback semantics (they differ! see §7.6/§7.7)
9. `useHybridMetadata` / `useServerThumbnail` — client/server fallback, retry
10. `useAdaptiveBitrate` — EWMA, hysteresis, cooldown
11. `WebFile` — checksum, version, dirty, IDB version-entry guard
12. `MediaApiProvider` — context + missing-provider throw
13. `zip/Zip` — round-trip + prop helpers (+ document the `splitProps` quirk)
13b. `Stage` — registry key pattern + temp→permanent lifecycle (`AX-MOD-SUIMEDIA-010`; pin the `#`-prefix cache quirk, §7.19)

### P2 (utilities, mutations, integration)
14. `FileSystemApi` — modern + deprecated fallback
15. `useMediaUpdate` / `useMediaDelete` — mutation + invalidation (`['media','list']` prefix; delete removes `['media', id]`)
16. `useActiveUploads` — `['uploads','active']`, 30s refetch
17. `MediaGallery` — overlay wiring
18. `PerformanceCollector` / `BenchmarkSuite`
19. integration: upload lifecycle end-to-end

---

## 7. Specific Test Cases (grounded in current source)

### 7.1 `src/api/__tests__/media-api-client.test.ts` (NEW — P0)

`MediaApiClient` is constructed with `{ baseUrl, authToken?, timeout?, headers? }`. The shared `request()` does the heavy lifting — exercise it through the public methods.

```
describe('MediaApiClient')
  constructor
    ✎ strips one trailing slash from baseUrl
    ✎ defaults timeout to 30000
    ✎ merges custom headers over { 'Content-Type': 'application/json' }
  auth
    ✎ setAuthToken → adds `Authorization: Bearer <t>` to subsequent requests
    ✎ clearAuthToken → removes the header
  request pipeline (via getMedia)
    ✎ throws Error with .statusCode + .response on non-OK
    ✎ joins array `message` with ', ' (Nest validation arrays)
    ✎ falls back to statusText when body has no message / body parse fails
    ✎ returns undefined on 204 No Content
    ✎ aborts after `timeout` ms → throws 'Request timeout'
    ✎ when an EXTERNAL signal aborts → throws 'Request was cancelled'
    ✎ combineSignals: pre-aborted external signal aborts immediately
  getMedia        ✎ GET /media/:id
  listMedia       ✎ GET /media (no query when params empty)
                  ✎ appends only defined params (skips undefined/null) via URLSearchParams
  updateMedia     ✎ PATCH /media/:id with JSON body → MediaDocument
  deleteMedia     ✎ DELETE /media/:id (soft delete) → void
  permanentlyDeleteMedia ✎ DELETE /media/:id/permanent
  getMediaByAuthor ✎ delegates to listMedia({ ...params, authorId })
  searchMedia     ✎ delegates to listMedia({ ...params, search })
  getPublicMedia  ✎ delegates to listMedia({ ...params, publicity: 'public' })
  interactions    ✎ likeMedia/unlikeMedia/dislikeMedia/viewMedia → POST /media/:id/{like,unlike,dislike,view}
  getMediaStats   ✎ GET /media/:id/stats → { views, uniqueViews, likes, dislikes, score }
  extractMetadata    ✎ POST /media/:id/extract-metadata
  generateThumbnail  ✎ POST /media/:id/generate-thumbnail with body { timestamp, size }
  generateSpriteSheet ✎ POST /media/:id/generate-sprites with body (options || {})
```
> Endpoint paths verified against `media-api-client.ts`: thumbnail is `/generate-thumbnail` (not `/thumbnail`) and sprites is `/generate-sprites` (not `/sprite-sheet`). There is **no** `getActiveUploads` on this client — that lives on `UploadClient`.

### 7.2 `src/api/__tests__/upload-client.test.ts` (NEW — P0)

`calculateChunkSize` and `generateFileHash` are **private** — assert them through `initiateUpload`/`upload`. Constants: `DEFAULT=10MiB`, `MIN=5MiB`, `MAX=100MiB`, `MAX_RETRIES=3`, `URL_BATCH_SIZE=50`.

```
describe('UploadClient')
  chunk sizing (observed via initiateUpload payload.chunkSize)
    ✎ < 100MiB file → 10MiB chunks
    ✎ ≥ 100MiB file → ceil(size/10000) clamped to [5MiB, 100MiB]
    ✎ explicit preferredSize clamped to [5MiB, 100MiB]
  initiateUpload  ✎ POST /upload/initiate { filename, mimeType, totalSize, chunkSize, hash? }
    ✎ generateHash:true → crypto.subtle.digest called, base64 hash sent
    ✎ hash generation failure → console.warn, proceeds with hash undefined
    ✎ empty file.type → mimeType 'application/octet-stream'
  upload (happy path)
    ✎ aborts before start (signal.aborted) → UploadError code 'ABORT'
    ✎ initResponse.existingMedia → returns { mediaId, mediaType } WITHOUT uploading (dedup)
    ✎ initiate → uploadParts → completeUpload → { mediaId, mediaType }
    ✎ onProgress(percent) fires per part = round(completed/total*100)
    ✎ onChunkComplete(completed, total) fires per part
  uploadParts / getMoreUrls
    ✎ requests more URLs (POST /upload/:id/urls) in batches of 50 when pendingUrls miss
    ✎ missing presigned URL after fetch → UploadError 'MISSING_URL'
  uploadChunk (PUT to presigned URL)
    ✎ slices file[(n-1)*chunk, n*chunk], PUT with Content-Type = file.type||octet-stream
    ✎ extracts ETag from response header; throws 'No ETag in response' if absent
    ✎ retries up to MAX_RETRIES on non-AbortError (backoff 1000*(n+1) ms — use fake timers)
    ✎ does NOT retry AbortError
  markPartComplete ✎ POST /upload/:id/part/:partNumber body { etag }   (NOTE: markPartComplete, not ...Completed)
  getUploadStatus  ✎ GET /upload/:id/status  (signature (sessionId, signal) — no includeUrls flag)
  getMoreUrls      ✎ POST /upload/:id/urls { partNumbers }
  completeUpload   ✎ POST /upload/:id/complete → CompleteUploadResponseDto
  abortUpload      ✎ POST /upload/:id/abort → void
  getActiveUploads ✎ GET /upload/active → ActiveUploadsResponseDto
  resumeUpload
    ✎ status 'completed' → UploadError 'ALREADY_COMPLETED'
    ✎ status 'aborted'|'expired' → UploadError code = status.toUpperCase()
    ✎ derives completedParts from totalParts \ pendingPartNumbers, uploads only remainder
  error mapping (apiRequest)
    ✎ non-OK → UploadError, code `HTTP_<status>`, message from body or statusText
    ✎ timeout → UploadError 'Upload timeout' code 'ABORT'; external abort → 'Upload cancelled' code 'ABORT'
  UploadError ✎ name === 'UploadError', preserves .code and .cause, instanceof works (setPrototypeOf)
```

### 7.3 `src/MediaFile/__tests__/MediaFile.test.ts` (NEW — P0)

`MediaFile extends globalThis.File`. Heavy on browser APIs — fire DOM events manually.

```
describe('MediaFile')
  constructor / from* factories ✎ fromFile, fromBlob, fromUrl (fetch ok + 404 + reject), fromUrls, fromDataTransfer (files + item entries + directories), universal from() routing, null for unsupported
  mediaType ✎ derived from MIME via getMediaType(); 'file' for unknown
  extractVideoMetadata ✎ duration/videoWidth/videoHeight via 'loadedmetadata'; 'error' event path; Infinity-duration guard
  extractAudioMetadata ✎ via AudioContext.decodeAudioData; decode error path
  extractMetadata ✎ routes video/* vs audio/*; empty for application/pdf
  stable IDs ✎ deterministic + idempotent per URL; differs across URLs; handles query strings + empty/undefined
  getUrl ✎ returns stored url; else URL.createObjectURL; revokes previous on re-call
  ScreenshotStore interplay ✎ render path tolerates count === 0 (regression guard — do NOT block on empty store)
  createSettings proxy on .media ✎ Object.assign writes are readable back (document the known propagation quirk — see §10)
```
> `MediaFile.media` uses `@stoked-ui/common`'s `createSettings` Proxy; properties set via `Object.assign` don't always propagate through React state. Don't write a test that "fixes" this by replacing the proxy — assert current behavior and reference the editor DetailView `<video>` fallback.

### 7.4 `src/MediaType/__tests__/MediaType.test.ts` (NEW — P1, 100%)

Map order matters: first wildcard match wins. `getMediaType` slices the MIME at the `*` and compares the prefix.

```
describe('getMediaType')
  ✎ 'video' for video/mp4, video/webm, video/quicktime  (video/* prefix)
  ✎ 'audio' for audio/mpeg, audio/wav                    (audio/* prefix)
  ✎ 'image' for image/png, image/jpeg, image/svg+xml      (image/* prefix)
  ✎ 'text'  for text/plain, text/html, text/csv           (text/* prefix)
  ✎ 'pdf'   for application/pdf
  ✎ 'doc'   for application/msword + wordprocessingml.{document,template}
  ✎ 'json'  for application/json
  ✎ 'lottie' for application/vnd.lottie+json
  ✎ 'folder' for 'folder'
  ✎ 'file'  for undefined, '', and unknown (application/octet-stream)  ← string fallback contract
describe('MimeMediaWildcardMap')
  ✎ ends with the '*' → 'file' catch-all entry
```

### 7.5 `src/hooks/__tests__/useMediaUpload.test.tsx` (NEW — P0)

Returns `{ upload, isUploading, isSuccess, isError, error, result, progress, cancel, reset }`. `isUploading === mutation.isPending`. `progress` is the `UploadState` object (`{ progress, sessionId?, completedParts, totalParts, uploadedBytes, totalBytes, speed?, estimatedTimeRemaining? }`).

```
describe('useMediaUpload')
  ✎ isUploading false initially → true during mutate → false on settle
  ✎ resets progress to zeros at mutation start (totalBytes = file.size)
  ✎ onSuccess fires user callback; sets progress to 100
  ✎ invalidates queryKey ['media','list'] on success (default invalidateQueries:true)
  ✎ invalidateQueries:false → no invalidation
  ✎ onError fires user callback and nulls the abort controller
  ✎ cancel() aborts the in-flight AbortController and calls mutation.reset()
  ✎ forwards defaultChunkSize / per-call chunkSize into client.upload
  🔴 REGRESSION (expected red): speed/eta in the onProgress payload are computed from a STALE
      closure over uploadState.uploadedBytes (captured at mutation creation, always 0 on first
      tick) → speed is ~0. Write the failing test first, then fix the hook to read live bytes
      (e.g. via a ref) — red→green per Axiom 5.
```

### 7.6 `src/hooks/__tests__/useMediaItem.test.tsx` (NEW — P1)

Query key `['media', mediaId]`. `enabled: !!mediaId && (options.enabled ?? true)`.

```
describe('useMediaItem')
  ✎ fetches via client.getMedia(mediaId, signal)
  ✎ query key is ['media', mediaId]
  ✎ does NOT fetch when mediaId is null/undefined (enabled false)
  ✎ does NOT fetch when options.enabled === false
  ✎ honors refetchInterval
  ⚠️ onSuccess/onError are spread into useQuery via `...options` but TanStack Query v5 DROPPED
      those — they are silently ignored here. Assert they are NOT called (documents the gap),
      and contrast with useMediaList which re-implements them via useEffect.
```

### 7.7 `src/hooks/__tests__/useMediaList.test.tsx` (NEW — P1)

Query key `['media', 'list', params]` where `params` excludes `enabled`/`keepPreviousData`/`onSuccess`/`onError`. `keepPreviousData` (default true) maps to `placeholderData: (prev) => prev`. Callbacks ARE wired via `useEffect`.

```
describe('useMediaList')
  ✎ calls client.listMedia(params, signal)
  ✎ query key ['media','list', params] changes when params change → refetch
  ✎ keepPreviousData → placeholderData keeps prior page during refetch
  ✎ onSuccess fires (useEffect) on isSuccess with data
  ✎ onError fires (useEffect) on isError with error
  ✎ enabled:false → no fetch
```

### 7.8 Expand `MediaCard.test.tsx` (P0)
Add to the existing 10: image/audio/missing-thumbnail rendering; `onViewClick`/`onEditClick`/`onDeleteClick`/`onTogglePublic`; selection checkbox; keyboard Enter/Space; owner vs viewer via `createMockAuth({ isOwnerOfAll })`; price badge / free indicator / payment gate; queue indicator + add-to-queue; ARIA labels + Tab order. Eyeball one live card at `/products/media/` (docs, port 5199).

### 7.9 Expand `MediaViewer.test.tsx` (P0)
Add to the existing 5: NORMAL→THEATER→FULLSCREEN transitions + Escape; keyboard (←/→ nav, Space play/pause, `f` fullscreen) gated by `enableKeyboardShortcuts`; queue next-up header + `onNavigate` + disabled at bounds; owner controls via auth; error/unsupported-format fallback.

### 7.10 `useAdaptiveBitrate.test.ts` (NEW — P1)
EWMA (alpha), upgrade/downgrade factors, cooldown, manual `selectTrack`/`enableAutoMode`, seed from `navigator.connection.downlink` (default 5 Mbps when absent), single-track no-op, capped sample history, `fallbackUrl` when disabled/no tracks. **Verify exact constants against `useAdaptiveBitrate.ts` before asserting** (don't hard-code 1.5/0.8/5s without reading).

### 7.11 `useHybridMetadata.test.ts` (NEW — P1)
Client vs server selection by size threshold; `preferServer`; server-timeout → client fallback; `onMetadataLoaded`; `{isLoading}`; both-fail error; `source: 'client'|'server'`; cache hit via `useMediaMetadataCache`; re-extract on item change. Confirm thresholds/timeouts from source.

### 7.12 `useServerThumbnail.test.ts` (NEW — P1)
Existing thumbnail short-circuit; auto-generate for videos (gated by `autoGenerate`); timestamp default = mid-duration, else 0; `{isLoading}`; `{error, canRetry}` + retry; custom size. Calls flow through `MediaApiClient.generateThumbnail(id, timestamp, size?)`.

### 7.13 `WebFile.test.ts` (NEW — P1)
Constructor/version init; `save` (FSA API + anchor fallback, version increment); `isDirty` lifecycle; `checksum` via `crypto.subtle` (deterministic + changes on edit + empty-data case); `createSaveRequest`; statics `fromUrl`/`fromLocalFile`/`fromOpenDialog` (incl. user-cancel). **Preserve the IDB version-entry creation guard** — add a regression test that a missing version entry is created, not thrown on.

### 7.14 `zip/Zip.test.ts` (NEW — P1)

```
describe('createZip')   ✎ returns File(name, type) zipping the input via JSZip (mock generateAsync)
describe('extractMeta')  ✎ splits ZipMetadata keys [id,name,description,created,lastModified,author,size,url] from the rest
describe('pickProps')    ✎ returns a shallow copy of all own keys (effectively identity — document this)
describe('splitProps')   ⚠️ uses {}.hasOwnProperty against an empty TRoot, so `root` is ALWAYS empty and
                            `remaining` gets EVERYTHING. Write a test that pins this CURRENT behavior and
                            flag it as a latent bug — fix only under a governed task with consumer review.
describe('getMimeType')  ✎ { subType:'project' } → { type: 'application/stoked-ui-timeline-project' }
                         ✎ honors custom type / subTypePrefix ('' prefix drops the dash)
```

### 7.15 `MediaApiProvider.test.tsx` (NEW — P1)
Renders children; builds `MediaApiClient`/`UploadClient` from config (`baseUrl`, `authToken`); uses provided `QueryClient` else creates a default; `useMediaApiContext` **throws** outside provider; `useMediaClient`/`useUploadClient` return the instances.

### 7.16 `useMediaUpdate` / `useMediaDelete` / `useActiveUploads` (NEW — P2)
- `useMediaUpdate`: `client.updateMedia`; invalidates `['media','list']` prefix and `['media', id]`.
- `useMediaDelete`: `client.deleteMedia`; removes `['media', id]` from cache; invalidates `['media','list']`.
- `useActiveUploads` (in `useResumeUpload.ts`): query key `['uploads','active']`, `refetchInterval: 30000`, `enabled` default true. (There is no `useResumeUpload` export.)

### 7.17 `performance/{metrics,benchmark}.test.ts` (NEW — P2)
`PerformanceCollector` singleton, mark start/end → duration, filter by type, average, 1000-cap eviction, export/clear, disabled no-op. `BenchmarkSuite` budgets exist + positive, warmup excluded, pass/fail vs budget, mean/median/p95. Confirm field names against source before asserting.

### 7.18 `integration-upload-flow.test.ts` (NEW — P2)
Full lifecycle (initiate → chunks → complete → appears in list); resume after interrupt; cancel + cleanup; duplicate → returns existing.

### 7.19 `src/Stage/__tests__/Stage.test.ts` (NEW — P1)

`Stage` is a static registry of `HTMLDivElement`s keyed by host id. `@stoked-ui/editor`'s `VideoController` (`packages/sui-editor/src/Controllers/VideoController.ts:52,64`) mounts `<video>` elements via `Stage.getStage(editorId)` — the key pattern and lifecycle are a governed contract per `AX-MOD-SUIMEDIA-010`. `Stage._stages` is module-static; **reset it between tests** (e.g. `(Stage as any)._stages = {}` in `beforeEach`) and clean `document.body`.

```
describe('Stage')
  getStage — no DOM element, no cache
    ✎ creates a temp stage: id `temp-stage-${host}`, appended to document.body,
      display:none, pointerEvents:none, zIndex 49, position absolute
    ✎ second call with same host returns the SAME temp element (cached under temp key)
    ✎ distinct hosts get distinct temp stages
  getStage — permanent element present in DOM (`<div id="stage-${host}">`)
    ✎ returns the DOM element
    🔴 QUIRK (pin, do not fix here): caches it under key `#stage-${host}` (stray `#`,
       Stage.ts:46) while lookups use `stage-${host}` — so the permanent stage is
       re-queried from the DOM on every call and the cached-permanent branch
       (Stage.ts:19) never hits via this path. Consequence: the temp→permanent child
       transfer loop (Stage.ts:21-32) is unreachable from the DOM-discovery path.
       Pin CURRENT behavior; the fix is a governed task because AX-MOD-SUIMEDIA-010
       declares the transfer lifecycle an editor contract — fixing the key makes the
       transfer live for the first time and must be eyeballed in the editor
       (/x/editor on 5199: drop a video clip, scrub, frames render).
  temp→permanent transfer (exercise by seeding `_stages['stage-${host}']` directly)
    ✎ children of the temp stage are appendChild-moved to the permanent stage in order
    ✎ the temp key is deleted from the registry after transfer
    ✎ subsequent getStage returns the permanent stage
  getElementById
    ✎ finds an element by id across ALL registered stages
    ✎ returns null when absent (and when the registry is empty)
```

---

## 8. Implementation Roadmap (TDD: red → green per case)

**Phase 1 — Foundation (quick wins).**
Extend `setup.ts` (crypto.subtle, URL.createObjectURL, AudioContext, navigator.connection, video metadata events). Add `mocks/fetch.ts`. Realign `MockMediaApiClient` to the live client method names. Write `MediaType.test.ts` (100%) and `zip/Zip.test.ts`.

**Phase 2 — API layer (highest risk).**
`media-api-client.test.ts`, then `upload-client.test.ts` (use fake timers for retry backoff; ordered `fetch` assertions).

**Phase 3 — Core class + data hooks.**
`MediaFile.test.ts`, `MediaApiProvider.test.tsx`, `useMediaUpload.test.tsx` (incl. the stale-closure regression), `useMediaItem.test.tsx`, `useMediaList.test.tsx`.

**Phase 4 — Component + UI hooks.**
Expand `MediaCard`/`MediaViewer`; add `useAdaptiveBitrate`, `useHybridMetadata`, `useServerThumbnail`, `Stage.test.ts` (§7.19).

**Phase 5 — Remaining + integration.**
`WebFile.test.ts`, `FileSystemApi.test.ts`, `MediaGallery.test.tsx`, mutation hooks, `performance/*`, `integration-upload-flow.test.ts`. Run full coverage, close gaps to 80% global.

---

## 9. Running Tests

```bash
# from packages/sui-media (Node 20 on PATH)
pnpm test                                   # all suites
pnpm test:coverage                          # + coverage report (works again since 2026-07-02 — the root
                                            #   glob>=10.5.0 override broke Jest's glob-v7 consumers until
                                            #   scoped test-exclude>glob / @jest/reporters>glob /
                                            #   jest-config>glob / jest-runtime>glob overrides landed)
pnpm test:ci                                # CI: coverage + thresholds, --maxWorkers=2
pnpm test -- --testPathPattern=upload-client
pnpm test -- -t "getMediaType"             # by test/describe name
pnpm test:watch
pnpm test -- --onlyChanged

# from repo root
pnpm --filter @stoked-ui/media test
```
After non-trivial changes, also run the downstream guard:
`pnpm --filter @stoked-ui/media build && pnpm --filter @stoked-ui/editor typescript && pnpm --filter @stoked-ui/timeline typescript && pnpm --filter @stoked-ui/file-explorer typescript`.

---

## 10. Edge Cases & Known Quirks to Pin

| Area | Cases / quirks |
|------|----------------|
| **MediaFile** | zero-byte files, missing MIME, `fromUrl` network failure/404, recursive directory entries in `fromDataTransfer`, Infinity-duration video, `createSettings` proxy `Object.assign` propagation quirk (assert current behavior, do not "fix") |
| **UploadClient** | file size not divisible by chunk size (last-part remainder math), 0-byte file, file forcing `getMoreUrls` batching (>50 parts), retry backoff timing (fake timers), abort mid-chunk (no retry), dedup short-circuit, resume from partial `pendingPartNumbers` |
| **MediaApiClient** | array vs string error `message`, body-parse failure fallback to statusText, 204 → undefined, internal timeout vs external cancel race, token update mid-flight |
| **useMediaUpload** | 🔴 stale-closure speed/eta bug (§7.5) — regression test then fix; unmount during upload (no setState after unmount); cancel before any chunk |
| **useMediaItem** | ⚠️ v5 silently ignores `onSuccess`/`onError` (unlike `useMediaList`) — pin the difference |
| **zip** | ⚠️ `splitProps` always returns empty `root` (buggy `hasOwnProperty` on empty `{}`); `pickProps` is effectively identity — pin current behavior, flag for governed fix |
| **Components** | null/missing items, very long titles (truncation), zero-duration video, unsupported MIME, rapid prop churn, unmount during async thumbnail gen |
| **Hooks** | unmount during fetch, query-key collisions across param sets, React StrictMode double-mount, cache bleed between tests (`queryClient.clear()` in `afterEach`) |
| **AdaptiveBitrate** | no/one track, bandwidth → 0, oscillation prevention (hysteresis + cooldown), Network Info API absent |
| **WebFile** | empty-data checksum, missing IDB version entry (must create, not throw), FSA denied by user, `fromUrl` redirect |
| **Stage** | 🔴 `#stage-${host}` cache-key mismatch (Stage.ts:46) makes the cached-permanent branch + temp→permanent transfer unreachable from the DOM path — pin current behavior (§7.19); fixing the key is a governed change under `AX-MOD-SUIMEDIA-010`. Static `_stages` registry leaks across tests — reset in `beforeEach`. |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| jsdom lacks real `<video>`/`<audio>` | set `videoWidth`/`duration` then `dispatchEvent(new Event('loadedmetadata'\|'error'))` |
| FSA API is Chrome-only | mock `showOpenFilePicker`/`showSaveFilePicker`; explicitly test the deprecated fallback |
| `crypto.subtle` absent in jsdom | mock `digest` in `setup.ts` (deterministic `ArrayBuffer`) |
| Canvas absent in jsdom | `jest-canvas-mock` or `getContext` stub for `generateWaveformImage` |
| React-Query state leaks across tests | `createTestQueryClient()` per test + `queryClient.clear()` in `afterEach` |
| `MockMediaApiClient` drift (§2) | mock `fetch` for call-shape assertions; realign the mock to live clients as a follow-up task |
| `ts-jest isolatedModules` skips type-checking | rely on `pnpm build` / `pnpm --filter @stoked-ui/media typescript` for type safety; tests verify runtime behavior |
| Large suite slows CI | `--maxWorkers=2` (already in `test:ci`); shard if total > 5 min |

---

## 12. Notes

- New tests should match existing style: `import { describe, it, expect, vi } from 'vitest'` (shimmed) or plain Jest globals.
- `global.fetch` in `setup.ts` is a bare `jest.fn()` — configure per test.
- 80% global threshold is already enforced; the goal is filling untested modules, not raising the bar.
- Cache keys are a **public contract** (host apps invalidate by them): `['media', id]`, `['media','list', params]`, `['media-gallery', source]`, `['uploads','active']`, plus the `mediaQueryKeys` factory rooted at `['media']`. Any reshape is a breaking change — guard with tests.
- Per Axiom 5 (TDD): for every behavioral case, write the test, watch it go **red**, then implement/fix to **green**. The 🔴/⚠️ items above are deliberate red-first opportunities that double as regression coverage.
