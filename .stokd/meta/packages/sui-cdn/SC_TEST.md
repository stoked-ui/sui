# SC_TEST: sui-cdn (`@stoked-ui/cdn`)

> **Generated:** 2026-06-06 | **Re-verified:** 2026-07-02 | **Meta version:** 0.4.1
> **Package:** `packages/sui-cdn` (`@stoked-ui/cdn` v0.1.0)
> **Priority:** Medium
> **Source entry (barrel):** `packages/sui-cdn/src/index.ts`
> See `.stokd/meta/packages/sui-cdn/SC_MODULE.md` for module classification and
> `packages/sui-cdn/.axioms.md` for the module invariants this strategy protects.
>
> All file paths, line numbers, exports, and test-stack conventions below were
> verified against the working tree on the generated date.

`@stoked-ui/cdn` is a **browser-only, embeddable React component** for browsing and
managing an S3-backed CDN bucket. It ships with **zero test coverage today** — there
are no `*.test.*` files and no `test` script in `package.json` (verified:
`find packages/sui-cdn -name '*.test.*'` → none). The package is three testable
layers under one barrel:

1. **Pure utilities** — `src/utils/contents.ts` (normalization, S3-XML / JSON parsing, formatting).
2. **A thin REST + upload client** — `src/CdnApi/CdnApi.ts` (`createCdnApi`, resumable multipart upload, drag/drop helpers).
3. **A large stateful UI** — `src/CdnBrowser/CdnBrowser.tsx` (1,442 LOC: listing, search, breadcrumbs, drag/drop, auth, rename, move, delete, permissions, view modes).

### Source surface (verified LOC / line anchors)

| Module | File | LOC | Key exports (line) |
|--------|------|-----|--------------------|
| Content utilities | `src/utils/contents.ts` | 266 | `normalizePrefix` (`:22`), `buildPublicUrl` (`:34`), `fromFlatObjects` (`:61`), `parseS3Xml` (internal `:118`), `normalizeJson` (internal `:97`), `fetchRemote` (internal `:149`), `getContents` (`:182`), `getFileKind` (`:210`), `formatBytes` (`:232`), `formatTimestamp` (`:244`), `buildCrumbs` (`:252`) |
| REST + upload client | `src/CdnApi/CdnApi.ts` | 363 | `createCdnApi` (`:125`), `collectDroppedEntries` (`:285`), `beginDesktopDownload` (`:352`), types `CdnApi`/`UploadFileOptions` |
| Browser component | `src/CdnBrowser/CdnBrowser.tsx` | 1,442 | `CdnBrowser` (default + named) |
| Public types | `src/CdnBrowser/CdnBrowser.types.ts` | 81 | `CdnBrowserProps`, content type re-exports |
| Mock fixture | `src/data/mockContents.ts` | 58 | `mockObjects` |
| Barrel | `src/index.ts` | 6 | Re-exports the public contract (see `AX-MOD-CDN-001`) |

> **Barrel vs. internal note:** `src/index.ts` re-exports only `CdnBrowser`,
> `createCdnApi`, `collectDroppedEntries`, `beginDesktopDownload`, `getFileKind`,
> `formatBytes`, `formatTimestamp`, `buildCrumbs`, `normalizePrefix`, `mockObjects`,
> and the public types. `buildPublicUrl`, `fromFlatObjects`, and `getContents` are
> `export`ed from `contents.ts` but **not** re-exported through the barrel;
> `parseS3Xml` / `normalizeJson` / `fetchRemote` are module-private. Co-located
> tests in *this* package import the source directly by relative path
> (`'../utils/contents'`, `'./CdnApi'`) — that is **not** a deep cross-package import
> and does **not** violate `AX-MOD-CDN-001` (which governs *consumers* importing
> `@stoked-ui/cdn`). Test the barrel exports through their relative source files;
> there is no need to round-trip through the published package name from inside the
> package.

### Integration point — the `/api/cdn/*` contract

`createCdnApi(apiBaseUrl='/api/cdn')` is one half of a wire contract whose server
half lives in **`docs/pages/api/cdn/**`** (`contents.ts`, `folders.ts`, `move.ts`,
`delete.ts`, `permissions.ts`, `export.ts`, `upload/initiate.ts`, `upload/active.ts`,
`upload/[sessionId]/{status,urls,part/[partNumber],complete,abort}.ts`,
`path/[format]/[[...prefix]].ts`). Tests in *this* package mock the network boundary
and verify the **client side** of that contract (method, path, body, headers). The
server side is tested under `docs/`. Keep the two in sync — see
`AX-REPO-CDN-API-CONTRACT` in `.stokd/meta/SC_AXIOMS.md` (promoted 2026-06-06 from
the candidate noted in `packages/sui-cdn/.axioms.md`) and `AX-MOD-CDN-002`.

---

## 1. Framework & Tooling — use the umbrella Mocha runner

> **Do not add Jest/ts-jest/RTL-standalone.** The umbrella coverage command globs
> `packages/**/*.test.{js,ts,tsx}` through **Mocha** (verified in root
> `package.json#scripts.test:coverage` / `test:unit`). Any Jest-only `*.test.tsx`
> added under `packages/sui-cdn` would be collected by that glob and fail under
> Mocha (no `jest` globals, no `ts-jest` transform). New tests in this package
> **must** run under the umbrella Mocha runner.

The monorepo has two test stacks. Pick the one that gates this package:

| Stack | Used by | Runner |
|-------|---------|--------|
| **Mocha + Babel + JSDOM via `@stoked-ui/internal-test-utils`** (chai + sinon + `@testing-library/react`) | `sui-file-explorer`, `sui-editor`, `sui-timeline`, `sui-github` — the publishable browser packages | Root `pnpm test` / `pnpm test:coverage` (`nyc mocha 'packages/**/*.test.{js,ts,tsx}' 'docs/**/*.test.{js,ts,tsx}'`) |
| Standalone **Jest + ts-jest + RTL** with a per-package `jest.config.js` | `sui-media`, `sui-common` only | Per-package `jest` |

`@stoked-ui/cdn` is a publishable browser package in the same family as
`sui-file-explorer`/`sui-editor`, and it is gated by the umbrella runner. **Adopt the
Mocha + `internal-test-utils` stack**, not Jest.

- **Runner:** Mocha 10 (`mocha@^10.3.0`, root devDependency), configured by the
  **root `.mocharc.js`**: `extension: ['js','mjs','ts','tsx']`,
  `require: ['@stoked-ui/internal-test-utils/setupBabel', '@stoked-ui/internal-test-utils/setupJSDOM']`,
  `recursive: true`, `ignore: ['**/build/**','**/node_modules/**','docs/.next/**']`,
  `timeout: 2000` (5000 on CI). No per-package mocharc is needed; the root config
  already covers `packages/**`.
- **DOM:** JSDOM via `@stoked-ui/internal-test-utils/setupJSDOM` (provides `window`,
  `localStorage`, `DOMParser`, a `fetch` target, and observer polyfills).
- **Compilation:** Babel via `@stoked-ui/internal-test-utils/setupBabel` (TS/TSX, no
  separate ts-jest).
- **Assertions:** chai. **Import `expect` directly from `chai`** — `import { expect } from 'chai';`.
  (Verified convention in `packages/sui-file-explorer/src/useFile/useFile.test.tsx`.)
  Do **not** import `expect` from `@stoked-ui/internal-test-utils` — it does not
  re-export chai.
- **Mocks/spies/timers:** `sinon` (`sinon@15.2.0`, hoisted and resolvable from the
  workspace root). **Import directly from `sinon`** — `import { spy, stub, useFakeTimers } from 'sinon';`
  (verified convention across `sui-file-explorer` / `sui-editor` tests). Restore in
  `afterEach` (or call `sinon.restore()`).
- **React rendering & RTL helpers:** import from `@stoked-ui/internal-test-utils`:
  `createRenderer`, `act`, `cleanup`, `fireEvent`, `createEvent`, `screen`,
  `waitFor` (re-exported from `@testing-library/react/pure`), `userEvent`
  (a namespace: `import { userEvent } from '@stoked-ui/internal-test-utils'`),
  `flushMicrotasks`, and `describeConformance`. Do **not** import
  `@testing-library/react` directly (it is bundled inside `internal-test-utils`).
  Use `const { render } = createRenderer();` per the existing pattern.

### devDependencies to add to `packages/sui-cdn/package.json`

Match the browser-package family (`sui-file-explorer` / `sui-github` / `sui-editor`):

```jsonc
"devDependencies": {
  "@stoked-ui/internal-test-utils": "workspace:^",
  "@types/chai": "^4.3.17",
  "@types/node": "^18.19.25",
  "@types/prop-types": "^15.7.12",   // optional — only if a test needs the types
  "@types/react": "^18.3.1",
  "chai": "^4.4.1",
  "typescript": "^5.4.5"
}
```

`sinon` is **not** carried as a direct devDependency by the family packages (it
resolves hoisted from the root); you can add `"sinon": "^15.2.0"` for hygiene, but it
is not required for the tests to run. Do **not** add `jest`, `ts-jest`,
`@types/jest`, `identity-obj-proxy`, or `cross-env` (cross-env is only needed if you
add a local script — see below).

### Do NOT add a (broken) per-package `test` script

The browser-package family deliberately ships **no** per-package `test` script
(verified: `sui-file-explorer`, `sui-editor`, `sui-timeline`, `sui-github` all have
`scripts.test === undefined`). They run exclusively through the root umbrella runner.
Once a co-located `*.test.ts(x)` file exists under `packages/sui-cdn/src`, the root
`pnpm test:unit` / `pnpm test:coverage` picks it up with **no further wiring**.

A naive per-package script such as `"test": "mocha 'src/**/*.test.{ts,tsx}'"` would
**fail**: Mocha resolves its config from the current working directory and does **not**
walk up the tree, so run from `packages/sui-cdn/` it would not load the root
`.mocharc.js` `require` hooks (no Babel/JSDOM setup → TS/TSX won't compile, no DOM).
If a `turbo run test --filter=@stoked-ui/cdn` entry point is genuinely wanted, point
it at the root config explicitly and add `cross-env`:

```jsonc
"scripts": {
  "test": "cross-env NODE_ENV=test mocha --config ../../.mocharc.js 'src/**/*.test.{ts,tsx}'"
}
```

Default recommendation: **omit the per-package script** and run from the root, exactly
like the rest of the family. Run a focused subset during development with a path arg
or `--grep`, e.g.:

```bash
cross-env NODE_ENV=test mocha --config .mocharc.js 'packages/sui-cdn/src/**/*.test.{ts,tsx}'
```

> **CSS imports:** `src/styles.css` is consumed by host apps, not by the component
> source — `CdnBrowser.tsx` references class names only and does **not**
> `import './styles.css'` (verified; this is enforced by `AX-MOD-CDN-007`). So no CSS
> module mapper is required. If a future test imports a `.css` file, add a Babel
> ignore rather than a Jest `moduleNameMapper`.

---

## 2. What Should Be Tested

### Tier 1 — Pure utilities (`src/utils/contents.ts`) — highest ROI, deterministic

- **`normalizePrefix`** (`:22`): `.trim()` → collapse repeated slashes → strip a
  leading slash → append a trailing slash to a non-empty value (`/(.+[^/])$/`).
  e.g. `'///a//b///'` → `'a/b/'`; `'a'` → `'a/'`; `''` → `''`; `'  x  '` → `'x/'`.
- **`buildPublicUrl`** (`:34`): `new URL(path, base + '/')` after stripping one
  trailing slash from `publicBaseUrl`; joins `path` under the base.
- **`fromFlatObjects`** (`:61`): groups direct children into `objects`, collapses
  one-level-down paths into a single `folder` each (key
  `${prefix}${remainder.slice(0, slashIndex+1)}`), sorts folders by path
  `localeCompare` and objects by path `localeCompare`, ignores entries that don't
  `startsWith(prefix)`, and skips the prefix itself (`remainder === ''` or `'/'`).
- **`getContents`** (`:182`): normalizes the prefix; with no `contentsEndpoint`
  returns mock data (`fromFlatObjects(prefix, mockObjects, …)`); on fetch failure
  falls back to mocks **only** when `typeof window !== 'undefined'` **and**
  `window.location.hostname === 'localhost'` **and** (`error` has no `status` key
  **or** `error.code === 'credentials_unavailable'`) — and emits `console.warn`;
  otherwise re-throws. (The XML/JSON dispatch in `fetchRemote` and
  `parseS3Xml`/`normalizeJson` are internal — cover them through `getContents` with a
  stubbed `fetch`, or import the source directly.)
- **`parseS3Xml`** (internal, `:118`): extracts `CommonPrefixes > Prefix` into
  folders and `Contents` (`Key`/`Size`/`LastModified`) into objects; throws
  `'Invalid XML response from contents endpoint'` on a `<parsererror>`; filters out
  objects whose `name` is empty or `'/'`.
- **`normalizeJson`** (internal, `:97`): uses `fromFlatObjects` when
  `Array.isArray(payload?.items)`; otherwise maps `payload.folders`/`payload.objects`,
  backfilling `url` (folder → `/?prefix=<encoded>`, object → `buildPublicUrl`) when
  absent.
- **`getFileKind`** (`:210`): case-insensitive extension (`path.split('.').pop()`) →
  `video` (mp4/mov/webm/m4v), `image` (png/jpg/jpeg/gif/svg/webp/avif), `download`
  (zip/dmg/exe/pkg), `code` (js/map/json/xml/html/css), else `file`; no extension →
  `file`.
- **`formatBytes`** (`:232`): falsy/`0` → `'0 B'`; unit chosen by
  `floor(log(size)/log(1024))` capped at TB; `B` uses 0 decimals, `KB`+ use 1
  (`toFixed`).
- **`formatTimestamp`** (`:244`): `''` (falsy) → `'Unknown'`; otherwise
  `new Date(value).toLocaleString()`.
- **`buildCrumbs`** (`:252`): normalizes, splits on `/` filtering empties; each
  segment yields a cumulative `path` ending in `/`, `label` = segment, and a
  URL-encoded `href` (`/?prefix=<encoded>`).

### Tier 2 — REST client (`createCdnApi`, `src/CdnApi/CdnApi.ts:125`)

- Trailing slash stripped from `apiBaseUrl` (`base = apiBaseUrl.replace(/\/$/, '')`),
  so `'/api/cdn/'` → requests hit `/api/cdn/...`.
- Each verb issues the correct method + path + JSON body:
  - `createFolder(path)` → `POST /folders` `{ path }`
  - `deletePath(path)` → `POST /delete` `{ path }`
  - `movePath(src, dst)` → `POST /move` `{ sourcePath, destinationPath }`
  - `getPermissions(path)` → `GET /permissions?path=<encoded>` (headers `{}`)
  - `updatePermissions(path, roles, userIds)` → `PUT /permissions` `{ path, viewRoles, viewUserIds }`
  - `clearPermissions(path)` → `DELETE /permissions?path=<encoded>` (headers `{}`)
- `buildExportUrl(path)` (`:175`) → `new URL(`${base}/export`, window.location.origin)`
  with `path` set as a query param → e.g. `http://localhost/api/cdn/export?path=a%2Fb`.
- `apiRequest` (`:36`): always sends `credentials: 'include'` and merges
  `JSON_HEADERS` (`Content-Type: application/json`) with any per-call headers;
  non-OK throws `body.message` when JSON parses, else `Request failed with <status>`;
  `204` resolves to `null`; otherwise returns `response.json()`.

> Note: `getPermissions` / `clearPermissions` pass `headers: {}`, which still merges
> with `JSON_HEADERS` in `apiRequest` (so the JSON content-type is present). Assert on
> the merged result, not on the per-call `{}`.

### Tier 3 — Resumable multipart upload (`uploadFile`, `src/CdnApi/CdnApi.ts:181`) — highest correctness risk

- **Fresh upload:** no stored session → `POST /upload/initiate`
  `{ path, filename, mimeType, totalSize, hash }` → builds `pendingUrls` from
  `initiated.presignedUrls` → per-part `uploadChunk` then
  `POST /upload/{id}/part/{n}` `{ etag }` → `POST /upload/{id}/complete`; stores the
  `localStorage` fingerprint (`uploadFingerprint`, `:8`) after initiate and **clears
  it** after `complete`.
- **Resume:** a stored `sessionId` → `GET /upload/{id}/status` → derives
  `chunkSize = ceil(status.totalSize / status.totalParts)`; `completedParts` =
  all part numbers **not** in `status.pendingPartNumbers`; uploads only the missing
  parts.
- **Stale session:** the `status` call throws → catch clears the fingerprint, sets
  `sessionId = null`, and falls through to a fresh initiate.
- **URL batching:** when `pendingUrls` lacks the current part, `POST /upload/{id}/urls`
  `{ partNumbers }` with up to `URL_BATCH_SIZE` (50) of the not-yet-fetched pending
  parts; throws `Missing presigned URL for part N` if still absent afterward.
- **Progress:** `onProgress` emits `round(completedParts.size / status.totalParts * 100)`
  after each part — monotonically increasing, ending at 100.
- **Abort:** an aborted `signal` propagates to the in-flight `fetch`; `uploadChunk`
  re-throws the `AbortError` (no retry), so `uploadFile` rejects and `complete` is
  never called.
- **Hash:** `generateHash` (`:58`) failure is swallowed
  (`await generateHash(file).catch(() => undefined)`) — initiate still fires with
  `hash: undefined`. `mimeType` falls back to `'application/octet-stream'` when
  `file.type === ''`.

#### `uploadChunk` retry logic (`src/CdnApi/CdnApi.ts:65`)

- Slices the correct byte range for part `n`: `start = (n-1)*chunkSize`,
  `end = min(start + chunkSize, file.size)`; `chunk = file.slice(start, end)`.
- PUTs with `Content-Type: file.type || 'application/octet-stream'`.
- Throws `'Chunk upload failed with <status>'` on a non-OK response, and
  `'Chunk upload response did not include an ETag'` when the `ETag` header is absent.
- On error, retries while `retries < MAX_RETRIES` (3) **and** `error.name !== 'AbortError'`,
  with linear backoff `setTimeout(…, 1000 * (retries + 1))` — drive with
  `sinon.useFakeTimers`; after exhausting retries it re-throws. Does **not** retry on
  `AbortError`.

### Tier 4 — Drag/drop helpers (`src/CdnApi/CdnApi.ts:285`, `:352`)

- **`collectDroppedEntries`** (`:285`): `null`/empty → `[]`; when items expose
  `webkitGetAsEntry()` it uses the entry tree, else it falls back to
  `item.getAsFile()` → `{ file, relativePath: file.name }`; a `FileSystemFileEntry`
  → one `{ file, relativePath: prefix + file.name }`; a `FileSystemDirectoryEntry`
  recurses via `createReader().readEntries`, looping until an empty batch
  (pagination), prefixing children with `parent/`, yielding `parent/child.ext`
  paths; entries that are neither file nor directory → `[]` (ignored).
- **`beginDesktopDownload`** (`:352`): sets `dataTransfer.effectAllowed`
  (override or `'copy'`), then `setData('DownloadURL', `${mime}:${name}:${url}`)`
  (mime falls back to `'application/octet-stream'`), `setData('text/uri-list', url)`,
  and `setData('text/plain', url)`.

### Tier 5 — `CdnBrowser` component (`src/CdnBrowser/CdnBrowser.tsx`)

Drive via the `getContents` prop (a custom data source that bypasses the network) and
`sinon` stubs of `createCdnApi`'s methods where mutations are involved.

- **Listing & states** (`useDirectoryContents`, `:138`): loading → success renders
  folder/object rows; empty state copy from `emptyMessage(prefix, query)` (`:31`);
  error state copy from `describeContentsError(error, authStatus)` (`:107`).
- **Controlled vs. uncontrolled prefix** (props parsed at `:424`,
  `deferredQuery`/`auth`/contents wired at `:466`–`:468`): with `prefix` +
  `onPrefixChange`, navigation calls `onPrefixChange`; without, internal prefix
  state updates. Note the **220 ms folder-name click debounce**
  (`handleFolderNameClick`, `:823`) — use `sinon.useFakeTimers().tick(220)`.
- **Search** (`deferredQuery = useDeferredValue(query.trim().toLowerCase())`, `:466`):
  filters folders/objects by `name` (case-insensitive) — assert with `waitFor`/`act`
  (deferred across a tick).
- **`hideRootFiles`** (default at `:424`; `visible` computed at `:511`): default
  `true` hides objects when at the root prefix (`isRoot`); `false` shows them.
  Folders are never hidden (`AX-MOD-CDN-008`).
- **View mode** (`isMediaHeavy`, `:62`; effect at `:497`–`:499`): ≥90% media objects
  → default `gallery`, else `list`; persisted in `localStorage` under
  `getViewModeKey(prefix)` = `cdn-view-mode-${prefix}` (`:68`) via
  `readStoredViewMode` (`:72`) / `writeStoredViewMode` (`:80`).
- **Upload flow** (`handleDrop` → `collectDroppedEntries` → `api.uploadFile`):
  progress renders in the tray; `onUploadComplete(path)` on success; failures route
  through `onError` and mark the tray entry errored; a refresh bumps the reload token.
- **Auth** (`useAuthSession`, `:188`): no `authEndpoint` → `status: 'disabled'`, no
  auth chrome; present → `fetch(authEndpoint, { credentials: 'include' })`, renders
  login/logout via `resolveLoginUrl` (`:479`) / `resolveLogoutUrl` (`:484`) (string
  or `(returnTo) => string` factory); `401` → `unauthenticated`;
  `shouldForceLogout(authStatus, error)` (`:100`) / `isCredentialFailure(error)`
  (`:88`) trigger `window.location.assign(resolveLogoutUrl(...))` (`:492`).
- **Admin gating** (`canManage = auth.status === 'authenticated' && auth.user?.role === 'admin'`,
  `:476`): create-folder, rename, move/drag (`onDragOver`/`onDrop` guarded by
  `canManage`), delete, permissions editor, and drag-move targets render/fire only
  for admins (`AX-MOD-CDN-005`).
- **Mutations:** rename commits via `api.movePath(old, new)` (Enter/blur/Tab;
  Escape cancels — `handleRenameKeyDown`, `:779`); delete confirms via
  `window.confirm` then `api.deletePath`; move guards against dropping a folder into
  itself (`handleMove`, `:612`); permissions editor save/clear/close round-trips.
- **Copy path** (`handleCopyPath`, `:658`): writes a resolved URL to
  `navigator.clipboard`; failure sets an operation error.

### Edge cases (call out explicitly)

- Filenames with spaces, unicode, `+`, `%`, `#`, `?` round-trip through
  `encodeURIComponent` in `getPermissions`/`clearPermissions`/`buildExportUrl` and
  the `?prefix=` URLs.
- Prefix `''` (root) vs. `'a/b/'`.
- `file.type === ''` → `application/octet-stream` on both the chunk PUT and the
  initiate `mimeType`.
- `localStorage` throws (private mode/quota): `getStoredSessionId` /
  `setStoredSessionId` / `clearStoredSessionId` (`CdnApi.ts:12`–`:34`) and the
  view-mode helpers (`readStoredViewMode` `:72` / `writeStoredViewMode` `:80`)
  swallow the error (`try/catch`) — `AX-MOD-CDN-004`.
- `crypto.subtle.digest` rejects → upload still proceeds with `hash: undefined`.
- Malformed XML → `parsererror` branch throws.
- `204 No Content` for delete/clear → `apiRequest` resolves `null`.

### Out of scope

- Real browser drag-and-drop event dispatch and `webkitGetAsEntry` (non-standard;
  JSDOM does not implement — mock the entry shapes).
- Actual S3 / presigned-URL network round-trips (mock `fetch`).
- The server handlers under `docs/pages/api/cdn/**` (tested in `docs/`).
- Visual/CSS regression (`src/styles.css`) — no Argos pipeline gates this package.
- `prop-types` runtime warnings — there are none in this package.

---

## 3. Test File Organization & Naming

Match the umbrella **co-located** convention (`sui-file-explorer`, `sui-editor`) —
**do not** centralize under a top-level `__tests__/` (that is the Jest-package style
used only by `sui-media`/`sui-common`):

```
packages/sui-cdn/src/
├── index.ts
├── utils/
│   ├── contents.ts
│   ├── contents.format.test.ts      # getFileKind, formatBytes, formatTimestamp
│   ├── contents.normalize.test.ts   # normalizePrefix, buildPublicUrl, buildCrumbs
│   ├── contents.parse.test.ts       # fromFlatObjects + parseS3Xml/normalizeJson via getContents
│   └── contents.getContents.test.ts # fetch dispatch + localhost mock fallback
├── CdnApi/
│   ├── CdnApi.ts
│   ├── CdnApi.rest.test.ts          # createCdnApi verbs, apiRequest, buildExportUrl
│   ├── CdnApi.upload.test.ts        # uploadFile multipart + resume + batching + abort
│   ├── CdnApi.uploadChunk.test.ts   # retry / abort / ETag / byte-range
│   └── CdnApi.dragdrop.test.ts      # collectDroppedEntries, beginDesktopDownload
└── CdnBrowser/
    ├── CdnBrowser.tsx
    ├── CdnBrowser.types.ts
    ├── CdnBrowser.listing.test.tsx  # render, prefix, search, hideRootFiles, view mode
    ├── CdnBrowser.upload.test.tsx   # drop → upload tray → callbacks
    ├── CdnBrowser.auth.test.tsx     # auth session, login/logout, force-logout
    └── CdnBrowser.admin.test.tsx    # rename / move / delete / permissions gating
```

**Conventions:**
- File suffix is **`.test.ts` / `.test.tsx`** (the root mocharc globs `*.test.*`).
  Reserve **`.spec.ts(x)`** for type-only specs validated by `tsc` — those are
  intentionally **not** collected by Mocha (cf. `sui-editor/test/typescript/*.spec.tsx`).
- Split a component concern into its own file when one would exceed ~400 LOC.
- `describe('functionName' | '<CdnBrowser />', () => { it('returns X when Y', …) })`.
- Avoid the stray `describe('ee<…>')` typo that slipped into
  `sui-file-explorer/src/FileDropzone/FileDropzone.test.tsx:9`.

**Import header template** (verified against the family convention):

```ts
import { expect } from 'chai';
import { spy, stub, useFakeTimers } from 'sinon';
// component tests only:
import * as React from 'react';
import { createRenderer, screen, fireEvent, act, waitFor } from '@stoked-ui/internal-test-utils';
import { CdnBrowser } from './CdnBrowser';
```

---

## 4. Mock & Stub Strategy

Stub at the network/DOM boundary, with `sinon`, restoring in `afterEach`
(`sinon.restore()`).

| Dependency | Approach |
|------------|----------|
| `global.fetch` | `sinon.stub(globalThis, 'fetch')` returning `{ ok, status, json: async () => …, text: async () => …, headers: { get: (k) => … } }`. Provide a small `mockFetch(responses)` helper that matches by URL/method. Restore via `sinon.restore()`. |
| `window.localStorage` | JSDOM default works. Spy with `sinon.spy(Storage.prototype, 'setItem')`. For the error-swallow tests, `sinon.stub(Storage.prototype, 'setItem').throws()` (and `getItem`/`removeItem`). **`localStorage.clear()` in `beforeEach`** so upload-session fingerprints and view-mode keys don't leak between tests. |
| `crypto.subtle.digest` | `sinon.stub(globalThis.crypto.subtle, 'digest')` returning a fixed `ArrayBuffer`, or `.rejects()` to verify upload continues with `hash: undefined`. |
| `File` / `Blob` | Real: `new File([new Uint8Array(N)], 'name.bin', { type })`. Choose `N` and the server-reported `chunkSize`/`totalParts` so there are ≥ 2 parts. JSDOM supports `File.slice` / `File.arrayBuffer`. |
| `DataTransferItem` / `FileSystemEntry` | Hand-rolled minimal mocks: `{ webkitGetAsEntry: () => ({ isFile:true, name, file:(cb)=>cb(realFile) }) }`; directories mock `createReader().readEntries(cb)` to call back an array then `[]` (pagination); flat-file fallback mocks `{ getAsFile: () => realFile }` (no `webkitGetAsEntry`). |
| `DragEvent` / `dataTransfer` | Plain object `{ preventDefault: sinon.spy(), dataTransfer: { items, getData, setData: sinon.spy(), effectAllowed:'' } }` — the real `DragEvent` ctor is unreliable in JSDOM. |
| `DOMParser` | Real (JSDOM). Use a literal `<ListBucketResult>…</ListBucketResult>` string for happy path; an intentionally broken string for the `parsererror` branch. |
| `AbortController` | Real `new AbortController()`; call `controller.abort()` mid-flight and assert the rejection + that `complete`/retry is skipped. |
| `window.location` | `Object.defineProperty(window, 'location', { value: { hostname:'localhost', origin:'http://localhost', href:'http://localhost/', assign: sinon.spy() }, writable:true, configurable:true })`; **save and restore the original descriptor in `afterEach`** (the localhost mock-fallback path reads `window.location.hostname`; `buildExportUrl` reads `origin`). |
| `window.prompt` / `window.confirm` | `sinon.stub(window, 'prompt').returns('newName')`, `sinon.stub(window, 'confirm').returns(true)`. |
| `navigator.clipboard.writeText` | `sinon.stub(navigator.clipboard, 'writeText').resolves()` (or `.rejects()` for the failure path). |
| `console.warn` | `sinon.stub(console, 'warn')` in the localhost mock-fallback test. |
| `createCdnApi` (in `CdnBrowser` tests) | Prefer the `getContents` prop for reads. For writes, stub `fetch` and assert on the issued request, or factor the api object so the component test can inject doubles. Don't reach into private module internals. |

**Fixtures:** reuse `src/data/mockContents.ts` (`mockObjects`) for listing tests;
inline small S3-XML strings in the test rather than checking in fixture files.

---

## 5. Coverage Targets

Medium priority, browser-only, single docs-backed consumer today
(`packages-internal/cdn-sui`). The utility + client layers are cheap and
high-value; the component layer ramps. Coverage is collected by the root `nyc`
(`nyc@^15.1.0`, via `pnpm test:coverage`).

| Milestone | Branches | Functions | Lines | Statements |
|-----------|----------|-----------|-------|------------|
| Phase 1 — utilities + REST client land | 60% | 70% | 70% | 70% |
| Phase 2 — upload + drag/drop + component smoke | 70% | 75% | 75% | 75% |
| Steady state | 80% | 80% | 80% | 80% |

**Per-file expectations:**
- `src/utils/contents.ts` — **≥ 90%** (pure, deterministic).
- `src/CdnApi/CdnApi.ts` — **≥ 85%** (upload/network carries the most risk).
- `src/CdnBrowser/CdnBrowser.tsx` — **≥ 65%** initially; grow as the feature stabilizes.
- `src/data/mockContents.ts`, `src/**/*.types.ts`, `src/index.ts` — **excluded** (static/barrel).

There is no `coverageThreshold` enforcement config for this package today; rely on the
root `nyc` report and treat the table above as the review bar, not a build gate, until
Phase 2 lands.

---

## 6. Specific Test Cases to Implement First

Ordered by ROI. Each bullet is one `it(...)`. Per **AXIOM-5 (TDD)**, write each test,
observe it **red**, then implement/verify it goes **green**; for the existing behavior
here the cycle is "test reproduces the documented behavior, fails if the code
regresses." Record the red→green outcome per criterion (see `~/.stokd/SC_AXIOMS.md`
§5.3).

### Tier 1 — Pure utilities (`utils/*.test.ts`) — ~1–2 h, locks the foundation

1. `normalizePrefix('///a//b///')` → `'a/b/'`; `''` → `''`; `'a'` → `'a/'`; `'  x  '` → `'x/'`.
2. `buildPublicUrl('a/b.png', 'https://cdn.example.com')` and `…/` (trailing slash) both resolve to the same absolute URL.
3. `buildCrumbs('a/b/c/')` → 3 cumulative crumbs, each `path` ending `/`, `href` URL-encoded, `label` = bare segment.
4. `getFileKind` → `video` for `.MP4`/`.mov`/`.webm`/`.m4v` (case-insensitive); `image` for png/jpg/svg/webp/avif; `download`/`code` sets; `file` for unknown ext + no-extension input.
5. `formatBytes(0)` → `'0 B'`; B = 0 decimals, KB/MB/GB at boundary values = 1 decimal; caps at TB.
6. `formatTimestamp('')` → `'Unknown'`; a real ISO string → `new Date(v).toLocaleString()`.
7. `fromFlatObjects` groups nested paths into one folder per top-level segment, returns sorted folders+objects, ignores entries outside the prefix, and skips the prefix itself.

### Tier 2 — REST client (`CdnApi/CdnApi.rest.test.ts`) — ~2 h

8. `createCdnApi('/api/cdn/')` strips the trailing slash (request hits `/api/cdn/folders`).
9. `createFolder('foo/')` → `POST /folders` `{ path:'foo/' }`; `deletePath`/`movePath` method+path+body correct.
10. `getPermissions`/`clearPermissions` URL-encode the `path` query param; `updatePermissions` sends `{ path, viewRoles, viewUserIds }`.
11. `buildExportUrl('a/b')` → `http://localhost/api/cdn/export?path=a%2Fb` (with `window.location.origin` stubbed).
12. Non-OK JSON response throws `body.message`; non-OK non-JSON (json() rejects) throws `Request failed with <status>`.
13. `204` resolves `null`; every request carries `credentials:'include'` + `Content-Type: application/json`.

### Tier 3 — Resumable upload (`CdnApi/CdnApi.upload.test.ts`, `CdnApi.uploadChunk.test.ts`) — ~3–4 h, highest risk

14. `uploadChunk` slices the correct byte range for part `n`; uses `file.type` (falls back to `application/octet-stream` when empty).
15. `uploadChunk` throws `'…did not include an ETag'` when the response lacks the `ETag` header.
16. `uploadChunk` retries 3× on non-abort errors (drive backoff with `sinon.useFakeTimers`), then throws; does **not** retry on `AbortError`.
17. Fresh `uploadFile`: stores `sessionId` (fingerprint key), uploads all parts in order, posts each part etag, calls `complete`, clears the fingerprint.
18. Resume: stored `sessionId` → `GET /upload/{id}/status` → only `pendingPartNumbers` re-uploaded; `chunkSize` derived from `totalSize`/`totalParts`.
19. Stale stored session (`status` rejects) → clears fingerprint, restarts fresh via `/upload/initiate`.
20. Hash failure (`crypto.subtle.digest` rejects) does not block initiate (`hash` undefined in the body).
21. URL batching: exhausted `pendingUrls` → `POST /upload/{id}/urls` `{ partNumbers }` for the next ≤50 batch; `Missing presigned URL for part N` if still absent.
22. `onProgress` emits monotonic values ending at 100.
23. `signal.abort()` rejects `uploadFile` and `complete` is never called.

### Tier 4 — Drag/drop helpers (`CdnApi/CdnApi.dragdrop.test.ts`) — ~1 h

24. `collectDroppedEntries(null)` → `[]`.
25. Flat files (no `webkitGetAsEntry`, only `getAsFile`) → `{ file, relativePath: file.name }`.
26. Nested directory entry → entries with `parent/child.ext` paths.
27. Paginated `readEntries` (a chunk then `[]`) collects all children.
28. `beginDesktopDownload` sets all three `dataTransfer` formats (`DownloadURL`, `text/uri-list`, `text/plain`) with correct `effectAllowed`/`mimeType` fallbacks.

### Tier 5 — `CdnBrowser` smoke (`CdnBrowser/*.test.tsx`) — ~3–4 h, after Tiers 1–4

29. Renders folders+objects from a stubbed `getContents` prop.
30. `hideRootFiles` hides objects when prefix is empty; `false` shows them; folders always render.
31. Clicking a folder calls `onPrefixChange` in controlled mode (advance the 220 ms debounce via fake timers).
32. Search input filters visible rows after `useDeferredValue` settles (`waitFor`).
33. Empty-state copy matches `emptyMessage(prefix, query)`; error-state copy matches `describeContentsError`.
34. Drop event → `collectDroppedEntries` → `api.uploadFile`; tray shows progress; `onUploadComplete(path)` fires; failure routes through `onError`.
35. No `authEndpoint` → no auth chrome and no management controls; with `authEndpoint`, login link renders and a credential-failure error triggers `window.location.assign(logoutUrl)`.
36. Admin gating: `role !== 'admin'` hides create-folder / rename / delete / permissions controls and the drag-move drop targets.

---

## 7. Known Gotchas (carry into tests)

- **Framework lock-in:** new tests must run under **Mocha** (root `.mocharc.js`). A
  stray `import … from '@testing-library/react'`, `import { jest } from '@jest/globals'`,
  or a `jest.config.js` will be collected by the umbrella
  `mocha 'packages/**/*.test.{js,ts,tsx}'` glob and fail.
- **Import sources are split:** `expect` ← `'chai'`; `spy`/`stub`/`useFakeTimers` ←
  `'sinon'`; `createRenderer`/`act`/`fireEvent`/`createEvent`/`screen`/`waitFor`/`userEvent`
  ← `'@stoked-ui/internal-test-utils'`. Do **not** try to get `expect` or `sinon`
  from `internal-test-utils` — it re-exports neither.
- **No working per-package `test` script exists or is needed:** the family runs from
  the root. A bare `mocha 'src/**/*.test.{ts,tsx}'` per-package script would not load
  the root `.mocharc.js` `require` hooks (Mocha doesn't walk up for config), so
  Babel/JSDOM setup would be missing. Run via the root, or point a local script at
  `--config ../../.mocharc.js`. Until a `*.test.ts(x)` file exists,
  `pnpm test:unit` simply doesn't collect this package.
- **`useDeferredValue` defers a tick:** wrap search-filter assertions in `waitFor`/`act`.
- **220 ms folder-name click debounce** (`handleFolderNameClick`, `:823`):
  single-click navigation is delayed; use `sinon.useFakeTimers().tick(220)` or `waitFor`.
- **`localStorage` leaks sessions:** call `localStorage.clear()` in `beforeEach`, or a
  prior upload's fingerprint (`cdn-upload:…`) or a stored view mode
  (`cdn-view-mode-…`) makes the next test behave unexpectedly.
- **`window.location` override:** save and restore the original property descriptor in
  `afterEach`; `getContents` reads `window.location.hostname` and `buildExportUrl`
  reads `window.location.origin`.
- **`webkitGetAsEntry` is non-standard:** JSDOM doesn't implement it — entry mocks are
  mandatory for `collectDroppedEntries`.
- **Cross-surface contract drift:** `createCdnApi`'s paths/bodies must match
  `docs/pages/api/cdn/**`. A client-only change that diverges from the server is a
  contract break (`AX-MOD-CDN-002`, `AX-REPO-CDN-API-CONTRACT`); pair client
  tests here with the server tests in `docs/`.
- **Barrel is the contract** (`AX-MOD-CDN-001`): the public surface is `src/index.ts`.
  Within-package tests import the source files by relative path (not the published
  package name and not deep cross-package paths); that is allowed and expected.
