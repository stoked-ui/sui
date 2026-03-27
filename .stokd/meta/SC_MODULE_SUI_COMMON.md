# SC_MODULE — sui-common

> **Generated:** 2026-03-17 | **Meta version:** 0.2.0
> **Package:** `@stoked-ui/common` v0.1.2
> **Location:** `packages/sui-common`

---

## Module Name

`@stoked-ui/common` — Shared utilities, types, hooks, and UI primitives for the Stoked UI monorepo.

---

## Responsibility

This is the foundational utility layer for every `@stoked-ui/*` package. It provides:

1. **Client-side persistence** — IndexedDB abstraction with versioned file storage and video attachment (`LocalDb`)
2. **MIME type registry** — Extensible type system for custom Stoked UI formats and 800+ standard extensions (`MimeType`)
3. **State primitives** — Proxy-based nested settings and feature flags with trigger cascades (`ProviderState`)
4. **ID generation** — Random (`namedId`) and hydration-safe incremental (`useIncId`) identifiers
5. **TypeScript utilities** — Sorted collections, constructor types, property helpers, array merging
6. **Shared domain types** — Client-safe DTOs for publicity, embed visibility, and multipart uploads (`interfaces/`)
7. **Reusable UI components** — `UserMenu`, `SocialLinks`, `GrokLoader`
8. **Layout hooks** — `useResize` (element), `useResizeWindow` (viewport)
9. **Network utilities** — Exponential backoff fetch wrapper (`FetchBackoff`)
10. **Color math** — Alpha-composite blending for CSS colors (`compositeColors`)

Design intent: centralize cross-cutting concerns so downstream packages never duplicate persistence, type registration, or utility logic. Nothing in this package imports from other `@stoked-ui/*` packages — it is a pure leaf dependency.

---

## Public Interfaces / Entry Points

### Main barrel: `src/index.tsx`

#### Storage

| Export | Source | Description |
|--------|--------|-------------|
| `LocalDb` | `src/LocalDb/LocalDb.ts` | Static class — `init()`, `open()`, `loadByName()`, `loadByUrl()`, `getVersions()`, `getKeys()`, `saveFile()`, `saveVideo()` |
| `VideoDb` | `src/LocalDb/VideoDb.tsx` | React component — loads/caches videos from IDB for iframe contexts |
| `IDBFile`, `IDBFileVersion`, `IDBProjectFile`, `IDBVideo` | `src/LocalDb/LocalDb.ts` | IndexedDB record types |
| `ProjectValue`, `FileSaveRequest`, `VideoSaveRequest`, `FileLoadRequest` | `src/LocalDb/LocalDb.ts` | Request/response shapes |
| `getRecordVersions`, `getVideos`, `createFolder` | `src/LocalDb/LocalDb.ts` | Helper functions |

#### MIME Types

| Export | Source | Description |
|--------|--------|-------------|
| `MimeRegistry` | `src/MimeType/IMimeType.ts` | Static registry — `create()`, lookup by ext/name/subtype/type |
| `SUIMime` | `src/MimeType/StokedUiMime.ts` | Singleton extending `MimeRegistry` — pre-registers png, mp4, mp3; `make()` for custom types |
| `IMimeType`, `SUIMimeType`, `MimeSubtype` | `src/MimeType/IMimeType.ts` | Type interfaces |
| `getExtension` | `src/MimeType/IMimeType.ts` | Extract file extension from URL |
| `ExtensionMimeTypeMap` | `src/MimeType/MimeType.ts` | Map of 800+ extensions to standard MIME strings |

#### State

| Export | Source | Description |
|--------|--------|-------------|
| `createProviderState` | `src/ProviderState/ProviderState.ts` | Factory — creates state instance with flags + settings |
| `createSettings` | `src/ProviderState/Settings.ts` | Proxy-based nested object — dot-notation access (`settings['user.name']`) |
| `Flags`, `FlagConfig`, `IProviderState` | `src/ProviderState/ProviderState.ts` | Flag types with `addTriggers`/`removeTriggers` cascade config |

#### IDs

| Export | Source | Description |
|--------|--------|-------------|
| `namedId` | `src/Ids/namedId/namedId.ts` | Random hex ID with optional prefix/suffix |
| `useIncId` | `src/Ids/useIncId/useIncId.ts` | React hook — deterministic incrementing IDs (SSR-safe) |

#### Types & Utilities

| Export | Source | Description |
|--------|--------|-------------|
| `SortedList<T>` | `src/Types/Types.ts` | Array subclass maintaining sorted order via comparator |
| `Constructor`, `NoArgsConstructor`, `ArgsConstructor` | `src/Types/Types.ts` | Generic constructor types |
| `setProperty` | `src/Types/Types.ts` | Define non-writable, non-configurable property on object |
| `mergeWith` | `src/Types/mergeWith.ts` | Merge two arrays by key field, second overwrites first |

#### Network

| Export | Source | Description |
|--------|--------|-------------|
| `FetchBackoff` | `src/FetchBackoff/FetchBackoff.ts` | Fetch wrapper — configurable retries (default 3), exponential backoff (default 500ms, 2x factor), custom `retryCondition` |

#### Colors

| Export | Source | Description |
|--------|--------|-------------|
| `compositeColors` | `src/Colors/colors.ts` | Alpha-blend two CSS colors (hex/hsl/rgb) → hex result |

#### Domain Interfaces

| Export | Source | Description |
|--------|--------|-------------|
| `PublicityType` | `src/interfaces/publicity.ts` | `'public' \| 'private' \| 'paid' \| 'deleted'` with filter helpers |
| `EmbedVisibilityType` | `src/interfaces/embed-visibility.ts` | `'public' \| 'authenticated' \| 'private'` with scope helpers |
| `InitiateUploadDto`, `PresignedUrlDto`, `UploadSession`, `Media`, etc. | `src/interfaces/upload-types.ts` | Multipart upload DTOs and media metadata types |

#### UI Components

| Export | Source | Description |
|--------|--------|-------------|
| `UserMenu` | `src/UserMenu/UserMenu.tsx` | Account dropdown — avatar, settings/licenses/billing/sign-out menu items |
| `SocialLinks` | `src/SocialLinks/SocialLinks.tsx` | Social platform inputs — 13 platforms, controlled/uncontrolled, `PLATFORM_REGISTRY` |
| `GrokLoader` | `src/GrokLoader/GrokLoader.tsx` | Animated loading indicator — 3 orbiting dots via framer-motion |

#### Hooks

| Export | Source | Description |
|--------|--------|-------------|
| `useResize` | `src/useResize/useResize.tsx` | Track element or window dimensions via `ResizeObserver` |
| `useResizeWindow` | `src/useResizeWindow/useResizeWindow.tsx` | Track `[width, height]` of window (SSR-safe) |

---

## Products

No dedicated product docs currently reference this module. It is consumed as infrastructure by all product-level packages.

---

## Views

Views from `SC_VIEWS.md` that this module directly renders or shapes:

| View | Section | Role |
|------|---------|------|
| **User Menu** (9.2) | `packages/sui-common/src/UserMenu/UserMenu.tsx` | Renders the account dropdown used in `AppHeader` across all docs site pages |
| **Social Links** (9.3) | `packages/sui-common/src/SocialLinks/SocialLinks.tsx` | Renders social platform input fields |
| **GrokLoader** (9.7) | `packages/sui-common/src/GrokLoader/GrokLoader.tsx` | Renders animated loading indicator |
| **VideoDb Viewer** (9.8) | `packages/sui-common/src/LocalDb/VideoDb.tsx` | Renders video list from IndexedDB |

Indirectly shapes (via utilities consumed by rendering packages):

- **Editor** (4.x views) — `LocalDb` persistence, `namedId`, `VideoSaveRequest`, `Constructor`, `IMimeType`
- **Timeline** (5.x views) — workspace dependency
- **File Explorer** (6.x views) — workspace dependency
- **Media** (7.x views) — `MimeType`, `SortedList`, `Settings`, `FileSaveRequest`, `IDBVideo`

---

## Integration Points

### Downstream Consumers (depend on `@stoked-ui/common`)

| Package | Key Imports |
|---------|-------------|
| `@stoked-ui/editor` | `Constructor`, `IMimeType`, `LocalDb`, `namedId`, `VideoSaveRequest` |
| `@stoked-ui/media` | `MimeType`, `SortedList`, `Settings`, `Constructor`, `FileSaveRequest`, `IDBVideo` |
| `@stoked-ui/timeline` | Workspace dependency (full) |
| `@stoked-ui/file-explorer` | Workspace dependency (full) |
| `@stoked-ui/github` | Workspace dependency (full) |
| `@stoked-ui/common-api` | Shared types (`interfaces/`) |
| `@stoked-ui/media-api` | Backend shared types |
| Docs app (`docs/`) | `UserMenu`, `SocialLinks`, `GrokLoader`, domain interfaces |

### Upstream Dependencies

| Dependency | Purpose |
|------------|---------|
| `@tempfix/idb` | IndexedDB promise wrapper (used by `LocalDb`) |
| `framer-motion` | Animation engine (used by `GrokLoader`) |
| `@mui/material` (peer) | UI primitives for `UserMenu`, `SocialLinks` |
| `@mui/icons-material` (peer) | Icons in `UserMenu` |
| `@emotion/react` + `@emotion/styled` (peer) | Styling |

### Contracts

- **LocalDb schema**: Consumers call `LocalDb.init({ stores })` with their store definitions. The versioned file structure (`IDBProjectFile` → `IDBFileVersion[]` → `IDBVideo[]`) is a shared contract.
- **MimeRegistry**: Packages register custom MIME types via `SUIMime.make()`. The `IMimeType` interface is the lookup contract.
- **ProviderState flags**: Downstream packages define their own `FlagConfig` maps; trigger cascades cross flag boundaries.
- **Settings proxy**: Settings keys are convention-based (dot-path strings). No schema enforcement — consumers must agree on key names.

---

## Key Source Files

| File | Why It Matters |
|------|---------------|
| `src/LocalDb/LocalDb.ts` | Core client persistence layer — all project save/load flows pass through here. Contains `LocalDb` static class, all IDB types, and version management logic. |
| `src/MimeType/IMimeType.ts` | `MimeRegistry` class and `IMimeType` interface — the type registration system that all file-handling packages depend on. |
| `src/MimeType/StokedUiMime.ts` | `SUIMime` singleton — factory for Stoked UI custom MIME types. Single point of registration. |
| `src/MimeType/MimeType.ts` | `ExtensionMimeTypeMap` — 800+ extension-to-MIME mapping. Used for file type detection. |
| `src/ProviderState/ProviderState.ts` | Feature flag system with cascading triggers — `createProviderState()`, `toggleFlags()`, `checkTriggers()`. |
| `src/ProviderState/Settings.ts` | `createSettings()` Proxy — enables dot-notation nested property access. Used heavily in editor and media packages. |
| `src/Types/Types.ts` | `SortedList<T>` — custom sorted Array subclass used by media package for ordered collections. |
| `src/interfaces/upload-types.ts` | Shared DTOs for multipart upload flow — `InitiateUploadDto`, `PresignedUrlDto`, `UploadSession`, `Media`. Shared between client and API packages. |
| `src/interfaces/publicity.ts` | `PublicityType` enum and filter predicates — governs content visibility across the platform. |
| `src/index.tsx` | Barrel export — defines the public API surface. Any addition/removal here affects all consumers. |

---

## Change Impact

### High Impact (breaks multiple packages)

| Change | Affected | Validation |
|--------|----------|------------|
| `LocalDb` API shape (method signatures, return types) | `sui-editor`, `sui-media`, docs app | Run editor save/load tests, media persistence tests |
| `IMimeType` interface or `MimeRegistry` lookup methods | `sui-editor`, `sui-media`, `sui-file-explorer` | Verify file type detection, MIME registration, save flows |
| `IDBProjectFile` / `IDBFileVersion` / `IDBVideo` type changes | `sui-editor`, `sui-media` | Run full editor/media integration tests; check IDB migration if schema changes |
| `ProviderState` / `Settings` proxy behavior | `sui-editor`, `sui-media` | Test flag toggles, setting reads/writes, trigger cascades in editor |
| Barrel export removals (`src/index.tsx`) | All consumers | Build all packages — removed exports will cause compile errors |

### Medium Impact (breaks specific features)

| Change | Affected | Validation |
|--------|----------|------------|
| `SortedList` comparator or override behavior | `sui-media` | Verify media ordering/sorting |
| `PublicityType` / `EmbedVisibilityType` values | Docs consulting views, `sui-media`, API packages | Check visibility filters, admin views, API guards |
| Upload DTO shapes (`interfaces/upload-types.ts`) | `sui-media-api`, `sui-common-api`, docs upload flows | End-to-end upload test |
| `FetchBackoff` retry/backoff defaults | Any consumer using retried fetches | Network failure scenarios |
| `compositeColors` math | Theme-dependent color blending | Visual regression |

### Low Impact (isolated to this package)

| Change | Affected | Validation |
|--------|----------|------------|
| `UserMenu` props or layout | Docs `AppHeader` | Visual check on docs site header |
| `SocialLinks` platform additions | Consulting profile forms | Run `SocialLinks.test.tsx` suite |
| `GrokLoader` animation parameters | Loading states in consuming views | Visual check |
| `useResize` / `useResizeWindow` | Components using resize tracking | Resize behavior in browser |
| `namedId` format changes | Logging, session IDs | Non-critical unless IDs are persisted |

### Test Coverage

Only `src/SocialLinks/` has tests:
- `SocialLinks.test.tsx` — rendering, controlled/uncontrolled, disabled/readOnly
- `SocialLinkField.test.tsx` — field-level input behavior
- `platformRegistry.test.ts` — platform lookup

**Gap**: `LocalDb`, `MimeType`, `ProviderState`, `FetchBackoff`, `SortedList`, and all hooks lack unit tests. Changes to these require manual validation or downstream integration tests.
