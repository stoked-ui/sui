# SC_MODULE: sui-cdn (`@stoked-ui/cdn`)

> **Generated:** 2026-06-06 | **Updated:** 2026-06-22 (UPGRADE 0.4.0 → 0.6.0 — re-verified version/LOC/exports against the working tree; version is now `0.1.0`) | **Meta version:** 0.6.0
> **Module classification document.** Module-level detail that used to live
> inside product docs is consolidated here. See `.stokd/meta/SC_PRODUCT_STOKED_UI_SUI.md`
> for product context, `.stokd/meta/SC_VIEWS.md` §13/§17 for view detail, and
> `.stokd/meta/packages/sui-cdn/SC_TEST.md` for the test strategy.

---

## Module Name & Location

- **Module / package name:** `@stoked-ui/cdn`
- **Package path:** `packages/sui-cdn`
- **Version:** `0.1.0`
- **Entry point (barrel):** `packages/sui-cdn/src/index.ts`
- **Published `main`:** `src/index.ts` (built to `build/` via the shared Babel pipeline)
- **Stylesheet (side-effect):** `packages/sui-cdn/src/styles.css`, consumed by host apps as `@stoked-ui/cdn/styles.css` (declared `sideEffects: ["*.css"]`)
- **Type:** browser-only React component package (no server-side code)

---

## Responsibility

`@stoked-ui/cdn` is a **self-contained, embeddable React component for browsing
and managing an S3-backed CDN bucket** from any host app. Its design intent is
to be a drop-in surface that:

1. **Lists directory contents** for a given prefix (folders + objects), driven
   either by a remote contents endpoint (S3 XML or JSON) or by an in-package
   mock dataset for local development.
2. **Manages content (admin only):** create folder, rename, move (incl.
   drag-and-drop), delete, and per-path visibility permissions (roles + user IDs).
3. **Uploads files** with a **resumable, presigned-URL multipart protocol** that
   survives page reloads via `localStorage` session fingerprinting.
4. **Exports folders as zips** and supports native desktop drag-out of objects.
5. **Renders role-aware UI** — public visitors see a read-only listing; an
   `admin` user (resolved from an auth-session endpoint) unlocks management
   controls.

The package layers a **thin REST client (`CdnApi`)** beneath a **feature-rich UI
(`CdnBrowser`)** and exposes **pure, framework-agnostic utilities**
(`utils/contents.ts`). It is intentionally dependency-light: only `react` /
`react-dom` are peer dependencies — no MUI, no data-fetching library, no AWS SDK.

The only UI consumer today is the internal Vite admin app
`packages-internal/cdn-sui` (`cdn-sui.stokd.cloud`); the docs app is the **server
half** of the contract (`docs/pages/api/cdn/**`), not a `CdnBrowser` host. The
component must therefore remain portable and free of host-specific assumptions
beyond the `apiBaseUrl` / `authEndpoint` / `publicBaseUrl` / `loginUrl` /
`logoutUrl` props.

---

## Public Interfaces / Entry Points

All public API flows exclusively through `src/index.ts`:

### Components
- **`CdnBrowser`** (`src/CdnBrowser/CdnBrowser.tsx`) — the main UI component.
  Props (`CdnBrowserProps`, `src/CdnBrowser/CdnBrowser.types.ts`):
  `apiBaseUrl` (default `/api/cdn`), `publicBaseUrl`, `authEndpoint`,
  `loginUrl` / `logoutUrl` (string or `(returnTo) => string`),
  `prefix` + `onPrefixChange` (controlled navigation), `getContents`
  (custom data source override), `title`, `subtitle`,
  `hideRootFiles` (default `true`), `onUploadComplete`, `onError`,
  `className`, `style`.

### API client
- **`createCdnApi(apiBaseUrl = '/api/cdn'): CdnApi`** (`src/CdnApi/CdnApi.ts`) —
  factory returning a `CdnApi` with:
  - `createFolder(path)` → `POST /folders`
  - `deletePath(path)` → `POST /delete`
  - `movePath(sourcePath, destinationPath)` → `POST /move`
  - `getPermissions(path)` → `GET /permissions?path=`
  - `updatePermissions(path, viewRoles, viewUserIds)` → `PUT /permissions`
  - `clearPermissions(path)` → `DELETE /permissions?path=`
  - `buildExportUrl(path)` → absolute `…/export?path=` URL
  - `uploadFile({ path, file, signal, onProgress })` → resumable multipart upload

### Drag-and-drop helpers
- **`collectDroppedEntries(dataTransferItems)`** — flattens dropped files and
  recursively-read directory trees into `{ file, relativePath }[]`.
- **`beginDesktopDownload(event, { name, url, mimeType?, effectAllowed? })`** —
  populates `DownloadURL` / `text/uri-list` / `text/plain` for native drag-out.

### Pure utilities (`src/utils/contents.ts`)
- `getFileKind(path)` → `'video' | 'image' | 'download' | 'code' | 'file'`
- `formatBytes(size)`, `formatTimestamp(value)`
- `buildCrumbs(prefix)`, `normalizePrefix(prefix)`
- (internal, not exported: `getContents`, `fromFlatObjects`, `parseS3Xml`,
  `buildPublicUrl`, `normalizeJson`)

### Fixtures & types
- **`mockObjects`** (`src/data/mockContents.ts`) — fallback dataset.
- Type exports: `CdnBrowserProps`, `CdnContents`, `CdnFolder`, `CdnObject`,
  `CdnApi`, `UploadFileOptions`.

---

## Products

- **`SC_PRODUCT_STOKED_UI_SUI.md`** (`@stoked-ui/sui`) — this module is one of the
  embeddable React component suite packages. It powers the product's **CDN admin**
  capability (SC_PRODUCT §6.1 *Browse / Upload via `CdnBrowser`*, §6.2 *Resume /
  Abort Multipart Upload*). Its sole UI consumer is the internal Vite admin app
  `packages-internal/cdn-sui`; the docs app participates only as the server-side
  `/api/cdn/*` contract host (SC_PRODUCT §3 audience table, §"Module map").

---

## Views

This module renders / materially shapes the following views in
`.stokd/meta/SC_VIEWS.md`:

- **§13.1 CdnBrowser** — the canonical view for this module. Regions: Hero
  (title / search / auth status / stats), Pathbar (breadcrumbs), View toggle
  (list / gallery), Listing (folder cards · gallery thumbnails · file table),
  Permission editor, Upload list, Feedback. States: directory
  (loading/success/error/empty), auth (authenticated/unauthenticated/loading/
  error), per-item upload (uploading/complete/error), rename, permissions
  (loading/saving/clearing/ready), view (list/gallery), drag.
- **§17.2 CDN Sui Wrapper** — `packages-internal/cdn-sui` renders `CdnBrowser`
  directly and delegates all view behavior to §13.1.
- **§17.1 Internal CDN Browser (legacy app)** — `packages-internal/cdn` is a
  standalone reimplementation that shares the same `/api/cdn/*` contract and
  utility semantics; it is *not* built on this package but mirrors its behavior.

---

## Integration Points

### Downstream consumers (who imports this module)
- **`packages-internal/cdn-sui`** (`src/App.jsx`) — the **only** importer of this
  package today (`import { CdnBrowser } from '@stoked-ui/cdn'` +
  `import '@stoked-ui/cdn/styles.css'`). A thin Vite wrapper rendering `CdnBrowser`
  with `title`, `apiBaseUrl="/api/cdn"`, `publicBaseUrl`, `authEndpoint`,
  `loginUrl` (a `(returnTo) => …` factory) / `logoutUrl`, and controlled
  `prefix`/`onPrefixChange`. (`package.json` dep `"@stoked-ui/cdn": "workspace:^"`.)
- **`media-pairing-poster-detection` project** — gallery/poster work in
  `.stokd/projects/media-pairing-poster-detection/` exercises the `CdnBrowser`
  gallery view (`isMediaHeavy` auto-switch).

> Note: the docs Next.js app is **not** a `CdnBrowser` consumer — a repo-wide
> grep for `@stoked-ui/cdn` under `docs/` returns no imports. It is the upstream
> server contract host (see below).

### Upstream contracts (what this module depends on)
- **CDN REST API under `apiBaseUrl` (default `/api/cdn`)** — implemented by
  `docs/pages/api/cdn/**` (verified file layout):
  - `GET  /api/cdn/contents?prefix=&delimiter=/` (S3 XML or JSON) — `contents.ts`
  - `POST /api/cdn/folders`, `POST /api/cdn/delete`, `POST /api/cdn/move` —
    `folders.ts`, `delete.ts`, `move.ts`
  - `GET|PUT|DELETE /api/cdn/permissions` — `permissions.ts`
  - `GET /api/cdn/export?path=` — `export.ts`
  - Multipart (`upload/`): `POST initiate.ts`, `GET active.ts`, and the
    session-scoped `upload/[sessionId]/`: `status.ts`, `urls.ts`,
    `part/[partNumber].ts`, `complete.ts`, `abort.ts`.
  - Public path resolver: `path/[format]/[[...prefix]].ts`.
  The `contents` fetch lives in `utils/contents.ts` (`fetchRemote`, with
  `credentials: 'include'`); every other verb flows through `CdnApi.apiRequest`,
  which always sends `credentials: 'include'` + JSON. This contract is governed by
  **AX-REPO-MEDIA-API-BOUNDARY** (CDN admin routes live under `docs/pages/api/**`,
  **not** `sui-media-api`) and has its own server-side axiom file at
  `docs/pages/api/cdn/.axioms.md`; the client/server coupling is tracked by the
  `AX-CANDIDATE-REPO-CDN-API-CONTRACT` candidate in `packages/sui-cdn/.axioms.md`.
- **Auth-session endpoint** (`authEndpoint`) — returns
  `{ authenticated, user: { name, role, avatarUrl? } }`. Admin role (`role === 'admin'`)
  gates management UI. 401 / credential-expiry errors force a logout redirect.
- **Browser platform APIs** — `fetch`, `localStorage` (upload session + view
  mode), `DOMParser` (S3 XML), `crypto.subtle.digest` (optional content hash),
  `URL`, `navigator.clipboard`, drag-and-drop `DataTransfer` (incl. non-standard
  `webkitGetAsEntry`).
- **S3 / CloudFront** — `publicBaseUrl` builds shareable object URLs; folder
  exports stream zips from the API; uploads land via presigned PUTs.

### Cross-package consistency
- Browser-only constraint is enforced repo-wide by **AX-REPO-BROWSER-NO-SERVER-DEPS**
  (this package may not import NestJS / Mongoose / AWS SDK / `next/server`).

---

## Key Source Files

| File | Why it matters |
|------|----------------|
| `src/index.ts` | The publishable barrel — the entire public contract. Any add/remove/rename here is a consumer-facing change. |
| `src/CdnApi/CdnApi.ts` (~363 LOC) | The REST client + resumable multipart upload engine. Highest correctness risk: chunk retry (`MAX_RETRIES=3`, no retry on `AbortError`, ETag required), URL batching (`URL_BATCH_SIZE=50`), `localStorage` session fingerprinting (`uploadFingerprint`), and the `/api/cdn/*` endpoint shapes all live here. Also `collectDroppedEntries` and `beginDesktopDownload`. |
| `src/CdnBrowser/CdnBrowser.tsx` (~1,442 LOC) | The whole UI: listing, search (`useDeferredValue`), breadcrumbs, controlled/uncontrolled prefix, list/gallery view modes (auto-switch via `isMediaHeavy` ≥90%, persisted per-prefix in `localStorage`), drag-drop upload + move, rename, delete, permissions editor, and auth/role gating (`canManage`, `shouldForceLogout`, `isCredentialFailure`). Root class is `suiCdnBrowser`. |
| `src/CdnBrowser/CdnBrowser.types.ts` | `CdnBrowserProps` — the component's documented prop contract and defaults. |
| `src/utils/contents.ts` (266 LOC) | Pure data layer: `normalizePrefix`, `fromFlatObjects` (groups flat S3 keys into folders/objects), `parseS3Xml`, `normalizeJson`, `getContents` (remote fetch via `fetchRemote` + localhost mock fallback), and presentation helpers (`getFileKind`, `formatBytes`, `formatTimestamp`, `buildCrumbs`, `buildPublicUrl`). Cheap to test, high ROI. |
| `src/data/mockContents.ts` | `mockObjects` fixture — the fallback dataset when no endpoint is configured or on localhost credential failure. |
| `src/styles.css` | All component styling, scoped under `.suiCdnBrowser`; shipped as a side-effect import. |
| `package.json` | Build pipeline (`build:modern`→`node`→`stable`→`types`→`copy-files`), peer deps (React 18), `sideEffects`. |

---

## Change Impact

When this module changes, validate the following:

- **Barrel changes (`src/index.ts`):** adding/removing/renaming an export is a
  contract change. Re-typecheck and re-build every consumer
  (`packages-internal/cdn-sui`, docs admin). Run `pnpm --filter @stoked-ui/cdn typescript`.
- **`CdnApi` endpoint or payload changes:** must be landed together with the
  matching `docs/pages/api/cdn/**` handler. A drift between client paths/bodies
  (`/folders`, `/move`, `/permissions`, `/upload/*`, `/contents`, `/export`) and
  the server breaks browse, upload, move, and permissions flows at once. Verify
  every verb still sends `credentials: 'include'` and the expected JSON.
- **Multipart upload logic:** regressions are invisible without tests (package
  currently ships **0 tests** — see SC_TEST.md). Re-verify resume (stored
  `sessionId` → `status` → only pending parts), fresh-initiate fallback on a
  404 status, monotonic `onProgress` ending at 100, abort behavior, and that the
  `localStorage` fingerprint is cleared on success. `localStorage.clear()` leakage
  between sessions is a common foot-gun.
- **Auth / role gating:** changes to `canManage`, `shouldForceLogout`,
  `isCredentialFailure`, or `describeContentsError` affect what management
  controls render and when a user is force-logged-out. Confirm public (no
  `authEndpoint`) renders no auth chrome and no management actions.
- **Utility semantics (`contents.ts`):** `normalizePrefix`, `fromFlatObjects`,
  `parseS3Xml`, and `getFileKind` are depended on by both the component and the
  view tests; changing kind→extension mappings or prefix normalization changes
  listing output and the gallery auto-switch threshold.
- **`hideRootFiles` default (`true`):** the S3 bucket root holds SPA shell files;
  flipping this default would expose them in the listing.
- **CSS contract:** styling is keyed off the `suiCdnBrowser` root class and the
  documented sub-element class names; renaming classes silently breaks host
  styling and the `@stoked-ui/cdn/styles.css` import.
- **Browser-only invariant:** introducing a server-only import breaks SSR and
  violates AX-REPO-BROWSER-NO-SERVER-DEPS. Re-run `pnpm --filter @stoked-ui/cdn typescript`
  and `pnpm -w build`.

### Recommended validation commands
```bash
pnpm --filter @stoked-ui/cdn typescript     # type contract
pnpm -w build                               # build pipeline / accidental server imports
# tests run under the umbrella Mocha runner (NOT Jest — see SC_TEST.md §1):
#   nyc mocha 'packages/**/*.test.{js,ts,tsx}'   (root pnpm test:coverage)
# once a *.test.ts(x) file + per-package test script land:
pnpm --filter @stoked-ui/cdn test
```
