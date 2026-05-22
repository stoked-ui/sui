# SC_TEST: sui-cdn (`@stoked-ui/cdn`)

## Package Overview

**Priority:** Medium
**Package path:** `packages/sui-cdn`
**Entry point:** `src/index.ts`
**Existing test files:** 0
**Current coverage threshold:** None established
**Last updated:** 2026-05-21

`@stoked-ui/cdn` is an embeddable React component for browsing an S3-backed CDN. It is currently shipped with **no test coverage** — neither a `jest.config.js` nor any `*.test.*` files exist in the package. The package layers a thin REST client (`CdnApi`) under a feature-rich React UI (`CdnBrowser`) and exposes pure utilities (`utils/contents.ts`) plus a static fixture (`data/mockContents.ts`).

### Source surface

| Module | File | LOC | Notes |
|--------|------|-----|-------|
| `CdnApi` | `src/CdnApi/CdnApi.ts` | ~363 | `createCdnApi` factory, resumable multipart upload, `collectDroppedEntries`, `beginDesktopDownload` |
| `CdnBrowser` | `src/CdnBrowser/CdnBrowser.tsx` | ~1,400 | Listing, search, breadcrumbs, drag/drop upload, auth, rename, move, delete, permissions, view modes |
| Content utilities | `src/utils/contents.ts` | ~267 | `normalizePrefix`, `buildPublicUrl`, `fromFlatObjects`, `parseS3Xml`, `getContents`, `getFileKind`, `formatBytes`, `formatTimestamp`, `buildCrumbs` |
| Mock fixture | `src/data/mockContents.ts` | ~58 | `mockObjects` used as the fallback dataset |
| Public types | `src/CdnBrowser/CdnBrowser.types.ts` | ~82 | `CdnBrowserProps`, content types re-exports |

---

## 1. What Should Be Tested

### Critical paths (must cover)

1. **Resumable multipart upload (`createCdnApi().uploadFile`)** — `src/CdnApi/CdnApi.ts:181`
   - Fresh upload: `initiate` → presigned PUTs → per-part `POST` → `complete`
   - Resume: stored `sessionId` in `localStorage` → `status` call → only pending parts re-uploaded
   - Stored session invalid (404 on `status`) → falls back to fresh initiate, clears stored id
   - Presigned URL batching: when `pendingUrls` lacks a part number, calls `/upload/{id}/urls` for the next `URL_BATCH_SIZE` (50) parts
   - Progress callback emits monotonically increasing percentages, completes at 100
   - `signal` (AbortSignal) propagates and prevents retry on `AbortError`
   - `chunkSize` derived correctly on resume from `status.totalSize / status.totalParts`
   - On success, fingerprint is cleared from `localStorage`

2. **Chunk upload retry logic** — `src/CdnApi/CdnApi.ts:65` (`uploadChunk`)
   - Retries up to `MAX_RETRIES` (3) on non-abort errors with linear backoff
   - Does **not** retry on `AbortError`
   - Throws if response lacks `ETag` header
   - Slices file with correct `start`/`end` offsets per `partNumber`

3. **REST helpers (`createCdnApi`)** — `src/CdnApi/CdnApi.ts:125`
   - Each verb (`createFolder`, `deletePath`, `movePath`, `getPermissions`, `updatePermissions`, `clearPermissions`) issues the correct method, path, and JSON body
   - `apiBaseUrl` trailing slash is stripped
   - `buildExportUrl` builds an absolute URL with `path` encoded as a query parameter
   - Non-2xx responses throw with the server `message` when JSON, else the status code
   - 204 responses resolve to `null`
   - All requests use `credentials: 'include'`

4. **Drag-and-drop entry collection (`collectDroppedEntries`)** — `src/CdnApi/CdnApi.ts:285`
   - Flat file drop via `getAsFile()` (no `webkitGetAsEntry`) returns files with `relativePath === file.name`
   - Single `FileSystemFileEntry` returns one entry with the prefix applied
   - Nested `FileSystemDirectoryEntry` recurses, paginates via repeated `readEntries`, and yields `relativePath` like `folder/sub/file.png`
   - Empty `dataTransferItems` returns `[]`
   - Mixed/unknown entries (`isFile === false && isDirectory === false`) are ignored

5. **Desktop drag-out (`beginDesktopDownload`)** — `src/CdnApi/CdnApi.ts:352`
   - Sets `DownloadURL`, `text/uri-list`, and `text/plain`
   - Honors `effectAllowed` override; falls back to `'copy'`
   - Falls back to `application/octet-stream` when `mimeType` is missing

6. **Content normalization (`utils/contents.ts`)**
   - `normalizePrefix`: collapses repeated slashes, strips leading slash, appends trailing slash, leaves empty strings empty
   - `buildPublicUrl`: respects/normalizes trailing slash on `publicBaseUrl`
   - `fromFlatObjects`: groups direct children into objects, deduplicates folders one level down, sorts both collections, ignores entries outside the prefix
   - `parseS3Xml`: extracts `CommonPrefixes/Prefix`, `Contents/Key/Size/LastModified`; throws on `parsererror`; filters out objects with empty name
   - `getContents`: uses mock data when no endpoint is provided; falls back to mocks on localhost when fetch errors **and** error has no status or has `code === 'credentials_unavailable'`; otherwise re-throws
   - `getFileKind`: maps extensions to `video`/`image`/`download`/`code`/`file` (case-insensitive); empty/no-extension returns `'file'`
   - `formatBytes`: zero → `'0 B'`; correct unit selection up to TB; sub-KB shown without decimals
   - `formatTimestamp`: empty value → `'Unknown'`
   - `buildCrumbs`: each segment includes a cumulative path ending in `/` and a URL-encoded `href`

### Component behavior (`CdnBrowser`)

7. **Initial render & listing** — verify `getContents` is called with the normalized prefix and listings render (folder rows, object rows, empty state copy from `emptyMessage`).
8. **Controlled vs. uncontrolled prefix** — when `prefix` + `onPrefixChange` are passed, internal state is bypassed; folder clicks call `onPrefixChange`.
9. **Search filter** — typing in the search box uses `useDeferredValue` and filters by `name` (case-insensitive).
10. **Breadcrumbs** — navigating via crumbs calls `onPrefixChange` and updates internal prefix.
11. **`hideRootFiles`** — default `true` hides files at root; `false` shows them.
12. **`isMediaHeavy` view mode auto-switch** — when ≥90% of objects are images/videos, default view becomes grid; persisted in `localStorage` under `cdn-view-mode-${prefix}`.
13. **Upload flow** — dropping files invokes `collectDroppedEntries` → `api.uploadFile`, emits progress into the uploads tray, calls `onUploadComplete(path)` on success, surfaces `onError` on failure.
14. **Auth UI** — when `authEndpoint` is omitted, no auth chrome; when present, fetches `authEndpoint` with credentials and renders login/logout per `loginUrl`/`logoutUrl`; force-logout on credential failures (`isCredentialFailure`).
15. **Permissions editor** — open, save (`updatePermissions`), clear (`clearPermissions`), close round-trip.
16. **Rename + move** — rename input commits via `movePath(old, new)`; cancel restores original; collisions surface errors.
17. **Delete** — confirms then calls `deletePath`; refreshes listing via `reloadToken`.

### Edge cases

- Filenames with spaces, unicode, `+`, `%`, `#`, and `?` round-trip through URL encoding.
- Prefix `''` (root) vs. `'a/b/'`.
- `file.type === ''` falls back to `application/octet-stream` for both single-shot and multipart paths.
- `localStorage` throws (private mode / quota): all `getStoredSessionId`/`setStoredSessionId`/`clearStoredSessionId` swallow errors.
- `crypto.subtle.digest` rejects → upload still proceeds (`hash` becomes `undefined`).
- XML parser returns a `parsererror` element for malformed input.
- Server returns `204 No Content` for delete/clear paths.

---

## 2. Recommended Framework & Tooling

Match the monorepo convention used by `packages/sui-media/jest.config.js` and `packages/sui-common/jest.config.js`:

- **Test runner:** Jest with `ts-jest` preset
- **Environment:** `jsdom` (required for `fetch`, `localStorage`, `DOMParser`, drag-drop events, React component tests)
- **Component testing:** `@testing-library/react` + `@testing-library/user-event` (already used elsewhere in the monorepo — see `packages/sui-media/src/components/MediaCard/__tests__/MediaCard.test.tsx`)
- **Network mocking:** Manual `global.fetch = jest.fn()` for `CdnApi` unit tests; consider `msw` only if integration-level fixtures grow unwieldy
- **CSS:** `identity-obj-proxy` (matches sui-media moduleNameMapper)
- **Coverage:** Jest built-in (`text`, `lcov`, `html`)

### Required `jest.config.js` (new file)

Create `packages/sui-cdn/jest.config.js` mirroring `packages/sui-media/jest.config.js` with these adjustments:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.+(ts|tsx)', '**/?(*.)+(spec|test).+(ts|tsx)'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/*.types.ts',
    '!src/data/mockContents.ts',
  ],
  coverageThreshold: {
    global: { branches: 70, functions: 75, lines: 75, statements: 75 },
  },
};
```

### Required dev dependencies (add to `package.json`)

- `jest`, `ts-jest`, `@types/jest`
- `jest-environment-jsdom`
- `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- `identity-obj-proxy`

Also add scripts:
```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

---

## 3. Test File Organization & Naming

Follow the sibling-package pattern (`packages/sui-media`):

```
packages/sui-cdn/src/
├── __tests__/
│   └── setup.ts                          # @testing-library/jest-dom imports, polyfills
├── CdnApi/
│   ├── CdnApi.ts
│   └── __tests__/
│       ├── CdnApi.test.ts                # createCdnApi REST helpers
│       ├── CdnApi.upload.test.ts         # uploadFile multipart + resume
│       ├── CdnApi.dragdrop.test.ts       # collectDroppedEntries, beginDesktopDownload
│       └── uploadChunk.test.ts           # retry / abort / ETag handling
├── CdnBrowser/
│   ├── CdnBrowser.tsx
│   └── __tests__/
│       ├── CdnBrowser.listing.test.tsx
│       ├── CdnBrowser.upload.test.tsx
│       ├── CdnBrowser.auth.test.tsx
│       ├── CdnBrowser.permissions.test.tsx
│       └── CdnBrowser.viewmode.test.tsx
└── utils/
    ├── contents.ts
    └── __tests__/
        ├── contents.normalize.test.ts    # normalizePrefix, buildPublicUrl, buildCrumbs
        ├── contents.parse.test.ts        # fromFlatObjects, parseS3Xml, normalizeJson
        ├── contents.format.test.ts       # getFileKind, formatBytes, formatTimestamp
        └── contents.getContents.test.ts  # fetch + fallback behavior
```

**Naming conventions:**
- Pure utility tests: `<module>.<aspect>.test.ts`
- Component tests: `<Component>.<concern>.test.tsx` (split when a single file would exceed ~400 LOC)
- Use `describe(functionName, ...)` blocks and `it('returns X when Y', ...)` phrasing

---

## 4. Mock & Stub Strategy

| Dependency | Approach |
|------------|----------|
| `fetch` | `global.fetch = jest.fn()` reset in `beforeEach`. Provide a small helper `mockFetchOnce(body, init?)` returning `{ ok, status, json, text, headers: { get } }`. |
| `window.localStorage` | jsdom default works; assert calls with `jest.spyOn(Storage.prototype, 'setItem')`. For the error-swallow tests, monkey-patch one of the methods to throw. |
| `crypto.subtle.digest` | Stub on `globalThis.crypto` to return a fixed `ArrayBuffer` or to reject (verify upload continues without `hash`). |
| `File` / `Blob` | Use real `new File([new Uint8Array(N)], 'name.bin', { type: 'application/octet-stream' })`. For multipart, choose `N` so the server-reported `chunkSize` produces ≥ 2 parts. |
| `DataTransferItem` / `FileSystemEntry` | Build minimal mocks: `{ webkitGetAsEntry: () => ({ isFile: true, name, file: cb => cb(realFile) }) }`. For directories, mock `createReader().readEntries(cb)` to call back with an array then an empty array (simulating pagination). |
| `DragEvent` | Construct `{ dataTransfer: { setData: jest.fn(), effectAllowed: '' } }` plain objects; the real `DragEvent` constructor is flaky in jsdom. |
| `DOMParser` | Real jsdom `DOMParser` handles the S3 XML fixtures. Provide a `<Error>` document only to verify the `parsererror` branch. |
| `AbortController` | Real `new AbortController()`; assert that mid-flight `abort()` rejects with `AbortError` and prevents retry. |
| `window.location.hostname` | `Object.defineProperty(window, 'location', { value: { hostname: 'localhost', origin: 'http://localhost' }, writable: true })`. |
| `console.warn` | `jest.spyOn(console, 'warn').mockImplementation(() => {})` in the localhost fallback test. |

**Fixtures:** Reuse `src/data/mockContents.ts` for listing tests. For S3 XML, embed a small literal `<ListBucketResult>...</ListBucketResult>` in the test file rather than checking in a fixture file.

---

## 5. Coverage Targets

This is a **medium-priority** package with no public consumers outside `docs/` today and an opt-in UI surface. Targets should ramp:

| Milestone | Branches | Functions | Lines | Statements |
|-----------|----------|-----------|-------|------------|
| Phase 1 (after initial test pass) | 60% | 70% | 70% | 70% |
| Phase 2 (component coverage) | 70% | 75% | 75% | 75% |
| Steady state | 80% | 80% | 80% | 80% |

**Per-file expectations:**
- `utils/contents.ts` — **≥ 90%** (pure functions, cheap to cover)
- `CdnApi/CdnApi.ts` — **≥ 85%** (network logic carries the most risk)
- `CdnBrowser/CdnBrowser.tsx` — **≥ 65%** initially; grow as feature stabilizes
- `data/mockContents.ts` — excluded from coverage (static fixture)

---

## 6. Test Cases to Implement First

Ordered by ROI. Each bullet is a single `it(...)` block.

### Tier 1 — Pure utilities (1–2 hours, locks in the foundation)

`utils/__tests__/contents.normalize.test.ts`
1. `normalizePrefix` collapses `///a//b///` to `a/b/`
2. `normalizePrefix` returns `''` for empty input
3. `normalizePrefix` returns `'a/'` for `'a'`
4. `buildPublicUrl` joins a path under a base with and without a trailing slash
5. `buildCrumbs` produces a cumulative chain for `'a/b/c/'` with URL-encoded hrefs

`utils/__tests__/contents.format.test.ts`
6. `getFileKind` returns `'video'` for `.MP4`, `.mov`, `.webm`, `.m4v`
7. `getFileKind` returns `'image'` for png/jpg/svg/webp/avif
8. `getFileKind` returns `'file'` for unknown and empty extensions
9. `formatBytes(0)` returns `'0 B'`
10. `formatBytes` round-trips KB/MB/GB at boundary values
11. `formatTimestamp('')` returns `'Unknown'`

`utils/__tests__/contents.parse.test.ts`
12. `fromFlatObjects` groups nested paths into one folder per top-level segment
13. `fromFlatObjects` returns sorted folders and objects
14. `fromFlatObjects` ignores objects outside the prefix
15. `parseS3Xml` extracts `CommonPrefixes` and `Contents`
16. `parseS3Xml` throws on malformed XML
17. `parseS3Xml` filters objects with empty `Key`

### Tier 2 — `CdnApi` REST helpers (2–3 hours)

`CdnApi/__tests__/CdnApi.test.ts`
18. `createCdnApi` strips trailing slash from `apiBaseUrl`
19. `createFolder('foo/')` issues `POST /folders` with `{ path: 'foo/' }`
20. `deletePath` / `movePath` issue the right body
21. `getPermissions` URL-encodes the path query param
22. `updatePermissions` sends `viewRoles`, `viewUserIds` as JSON
23. `clearPermissions` issues `DELETE` with encoded path
24. `buildExportUrl` builds `<origin>/api/cdn/export?path=<encoded>`
25. Non-OK JSON response throws with server `message`
26. Non-OK non-JSON response throws with status fallback
27. `204` response resolves to `null`
28. Every request includes `credentials: 'include'` and JSON content type

### Tier 3 — Resumable upload (3–4 hours, highest correctness risk)

`CdnApi/__tests__/uploadChunk.test.ts`
29. Slices the correct byte range for part `n` given `chunkSize`
30. Throws when response is missing `ETag`
31. Retries up to 3 times on non-abort errors, then throws
32. Does **not** retry on `AbortError`
33. Uses `file.type` for `Content-Type`; falls back to `application/octet-stream`

`CdnApi/__tests__/CdnApi.upload.test.ts`
34. Fresh upload: stores `sessionId` in `localStorage`, uploads all parts in order, calls `complete`, clears the fingerprint
35. Resume: stored `sessionId` triggers `GET /upload/{id}/status` and skips completed parts
36. Stored session that 404s clears the fingerprint and starts fresh
37. Hash generation failure does not prevent the initiate call
38. URL batching: when presigned URLs are exhausted, fetches the next batch
39. `onProgress` is called with monotonically increasing values that end at 100
40. `signal.abort()` rejects the upload and does not call `complete`

### Tier 4 — Drag/drop helpers (1 hour)

`CdnApi/__tests__/CdnApi.dragdrop.test.ts`
41. `collectDroppedEntries(null)` returns `[]`
42. Flat files (no `webkitGetAsEntry`) return `{ file, relativePath: file.name }`
43. Nested directory yields entries with `parent/child.ext` paths
44. Paginated `readEntries` (returns chunks then `[]`) collects all children
45. `beginDesktopDownload` sets all three dataTransfer formats with correct fallbacks

### Tier 5 — `CdnBrowser` smoke (after Tiers 1–4) (3–4 hours)

`CdnBrowser/__tests__/CdnBrowser.listing.test.tsx`
46. Renders folders and objects from a stubbed `getContents`
47. `hideRootFiles` hides files when prefix is empty
48. Clicking a folder row calls `onPrefixChange` in controlled mode
49. Search input filters visible rows after `useDeferredValue` settles
50. Empty state copy reflects `emptyMessage(prefix, query)`

`CdnBrowser/__tests__/CdnBrowser.upload.test.tsx`
51. Drop event triggers `collectDroppedEntries` → `api.uploadFile`
52. Upload progress renders in the tray; `onUploadComplete(path)` fires on success
53. Upload failure routes through `onError` and marks the tray entry as errored

`CdnBrowser/__tests__/CdnBrowser.auth.test.tsx`
54. No `authEndpoint` → no auth chrome rendered
55. `authEndpoint` fetched with credentials; renders the login link
56. Credential-failure errors (`isCredentialFailure`) trigger logout navigation

---

## 7. Open Questions & Risks

- **No existing baseline:** every regression today is invisible. Tier 1 + Tier 2 close ~40% of the package risk for a few hours of work — prioritize them.
- **`useDeferredValue` in search tests:** wrap assertions in `waitFor` because React defers updates across a tick.
- **`DataTransferItem.webkitGetAsEntry` is non-standard:** jsdom does not implement it; mocks are mandatory.
- **Multipart fixtures share state through `localStorage`:** call `localStorage.clear()` in `beforeEach` or each upload test will leak a session id.
- **`window.location` mutation:** restore the original descriptor after each test that overrides `hostname`.
- **Build tooling:** the package currently has no `test` script in `package.json`; running `pnpm --filter @stoked-ui/cdn test` will fail until `jest.config.js` and the script are added (see §2).
