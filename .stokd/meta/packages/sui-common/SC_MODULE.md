# Module: @stoked-ui/common

> **Generated:** 2026-05-05 · **Last upgraded:** 2026-05-21 · **Last refreshed:** 2026-06-06 (timed) · **Meta version:** 0.4.0
> **Package location:** `packages/sui-common`
> **NPM name:** `@stoked-ui/common` (v0.1.2)
> **Source entry:** `packages/sui-common/src/index.tsx`
> **Build artifacts:** `packages/sui-common/build/` (modern + node + stable + types)

---

## 1. Responsibility

`@stoked-ui/common` is the **foundation layer** for the published `@stoked-ui/*` package family. Its design intent:

1. **Zero internal dependencies** — does not depend on any other Stoked UI package, so any Stoked UI package can depend on it.
2. **Browser-oriented utilities** that need to be reusable across `editor`, `timeline`, `file-explorer`, `media`, `github`, `docs`, and the `docs/` Next.js site.
3. **Client-safe DTO/type interfaces** that can be imported by API packages (`sui-common-api`, `sui-media-api`) without dragging in NestJS or React.
4. **A small set of shared React primitives** (chrome) used by multiple consumer packages — `UserMenu`, `SocialLinks`, `GrokLoader`, plus the resize hooks.

It is *not* a UI kit, *not* a domain-specific library, and *not* a place to put server-only code (NestJS, Node fs, etc.).

---

## 2. Public Interfaces / Entry Points

The single public entry is `src/index.tsx`. All public exports flow through here:

```ts
// packages/sui-common/src/index.tsx
export { LocalDb, useResize, useResizeWindow };
export * from './Colors';            // compositeColors
export * from './ProviderState';     // createProviderState, createSettings, Flags, FlagData, FlagConfig, Settings
export * from './Types';             // SortedList, setProperty, mergeWith, Constructor types
export * from './Ids';               // namedId, useIncId, randomBytes
export * from './FetchBackoff';      // FetchBackoff
export * from './LocalDb';           // IDB types, VideoDb, getRecordVersions, getVideos, createFolder
export * from './MimeType';          // MimeRegistry, SUIMime, IMimeType, getExtension, MimeType data map
export { GrokLoader };
export * from './interfaces';        // publicity, embed-visibility, upload-types
export * from './SocialLinks';       // SocialLinks, SocialLinkField, PLATFORM_REGISTRY, getPlatformByKey
export * from './UserMenu';          // UserMenu component + types
```

### Public surface by category

| Surface | Exports | Source |
|---|---|---|
| Networking | `FetchBackoff` | `src/FetchBackoff/FetchBackoff.ts` |
| State / Flags | `createProviderState`, `createSettings`, `Flags`, `FlagData`, `FlagConfig`, `Settings`, `NestedRecord`, `IProviderStateProps` | `src/ProviderState/ProviderState.ts`, `Settings.ts` |
| ID generation | `namedId`, `useIncId`, `randomBytes` | `src/Ids/namedId/namedId.ts`, `src/Ids/useIncId/useIncId.ts` |
| Data structures | `SortedList<T>`, `setProperty`, `mergeWith` (extends `Array.prototype`), `Constructor<T>` | `src/Types/Types.ts`, `src/Types/mergeWith.ts` |
| Colors | `compositeColors` | `src/Colors/colors.ts` |
| MIME registry | `MimeRegistry`, `SUIMime`, `IMimeType`, `MimeSubtype`, `SUIMimeType`, `Ext`, `getExtension`, `MimeType` value map | `src/MimeType/IMimeType.ts`, `StokedUiMime.ts`, `MimeType.ts` |
| IndexedDB | `LocalDb` static class, `VideoDb`, `IDBFile`, `IDBFileVersion`, `IDBProjectFile`, `IDBVideo`, `Version`, `Versions`, `ProjectValue`, `LocalDbProps`, `LocalDbStoreProps`, `ISaveFileData`, `FileSaveRequest`, `VideoSaveRequest`, `FileLoadRequest{ByName,ByUrl}`, `getRecordVersions`, `getVideos`, `createFolder` | `src/LocalDb/LocalDb.ts`, `VideoDb.tsx` |
| Client-safe DTO interfaces | `PUBLICITY_TYPES`, `ADMIN_ONLY_PUBLICITY_TYPES`, `ALL_FILTER_PUBLICITY_TYPES`, `isAdminOnlyPublicity`, `isIncludedInAllFilter`, `DEFAULT_EMBED_VISIBILITY`, `isPublicEmbedVisibility`, `isAuthenticatedEmbedVisibility`, upload-type constants | `src/interfaces/publicity.ts`, `embed-visibility.ts`, `upload-types.ts` |
| React chrome | `UserMenu`, `SocialLinks`, `SocialLinkField`, `PLATFORM_REGISTRY`, `getPlatformByKey`, `ALL_PLATFORM_KEYS`, `GrokLoader` | `src/UserMenu/`, `src/SocialLinks/`, `src/GrokLoader/` |
| Resize hooks | `useResize`, `useResizeWindow` | `src/useResize/useResize.tsx`, `src/useResizeWindow/useResizeWindow.tsx` |

There are **no NestJS controllers, no CLI commands, and no providers/contexts**. The package is library code only.

### Present but not yet exported

- `src/Dialog/Dialog.types.ts` — type-only module declaring `ConfirmOptions`, `PromptOptions`, `ConfirmDialogProps`, `PromptDialogProps`, `ConfirmFn`, `PromptFn`, and `DialogContextValue` for a future shared confirm/prompt dialog context. As of 2026-06-06 it is **not re-exported from `src/index.tsx`** and has no in-repo consumers (only self-references). It is staged surface, not yet part of the public contract — wiring it into `index.tsx` is a governed contract change (AX-MOD-SUICOMMON-001).

---

## 3. Products

This module is consumed by the single product documented in this repo:

- **SC_PRODUCT_STOKED_UI_SUI.md** — `@stoked-ui/sui`. Every other workspace package and the `docs/` Next.js app rely on `@stoked-ui/common` either directly or transitively.

There is no other product doc; the module participates in only this one.

---

## 4. Views

From `SC_VIEWS.md` §16 ("Common Package Shared Chrome — `@stoked-ui/common`"), this module **directly renders or owns** the following views:

| View | File | Notes |
|---|---|---|
| `UserMenu` chrome | `packages/sui-common/src/UserMenu/UserMenu.tsx` | Avatar trigger + dropdown (Dashboard / Settings / Licenses / Billing / Sign Out). Each menu item is opt-in via the corresponding `on*` prop. |
| `GrokLoader` spinner | `packages/sui-common/src/GrokLoader/GrokLoader.tsx` | Animated framer-motion loader used as a global loading indicator. |
| `SocialLinks` / `SocialLinkField` | `packages/sui-common/src/SocialLinks/` | Read view (icon list) and editor view (per-platform input field with prefix adornment). Backed by `platformRegistry.ts`. |

Indirectly (materially shapes other views by providing infrastructure rather than rendering chrome):

- All views that use ID generation (`namedId`, `useIncId`) for SSR-stable element IDs — Editor, Timeline, FileExplorer, Docs.
- All views that read/write IndexedDB project state (`LocalDb`, `VideoDb`) — Editor authoring view (project save/load/version history), media app library, internal CDN tools.
- All views whose provider chrome derives flags/settings from `createProviderState` / `createSettings` (Editor and Timeline providers — see §5).
- All views that render or consume MIME types (`MimeRegistry`, `SUIMime`, `MimeType`) — file pickers, drag-drop accept lists, file metadata display.
- Marketing/checkout views that render social links via `SocialLinks` (footer, profile pages).

---

## 5. Integration Points

### Upstream (this module depends on)

| Dependency | Where used | Contract |
|---|---|---|
| `@tempfix/idb` (^8.0.3) | `LocalDb/LocalDb.ts` (`openDB`) | IndexedDB wrapper. Browser only. |
| `framer-motion` (^12.4.10) | `GrokLoader/GrokLoader.tsx` | `motion`, `useAnimationControls`, `useMotionValue`, `useTransform`, `animate`. |
| `@mui/material/styles` (peer) | `Colors/colors.ts` | `hexToRgb`, `hslToRgb`, `rgbToHex`. |
| `@mui/material`, `@mui/icons-material` (peer) | `UserMenu`, `SocialLinks` | Avatar, Menu, MenuItem, Divider, Typography, etc. |
| `@emotion/react`, `@emotion/styled` (peer) | `UserMenu/UserMenu.styles.ts`, `SocialLinks/SocialLinks.styles.ts` | Styled wrappers. |
| `react` 18.3.1 (peer) | All hooks and components | Hooks API; SSR safety must be respected by callers. |
| `global.fetch`, `global.URL`, `window`, `setTimeout` | `FetchBackoff`, `MimeType.getExtension`, `useResize*` | Browser globals. |

### Downstream (consumers)

In-tree consumers verified by `import` statements (excluding `build/` artifacts):

- `packages/sui-common-api/src/index.ts` — re-exports `interfaces` for server use.
- `packages/sui-editor/` — `Editor.tsx`, `EditorFile.ts`, `EditorProvider.types.ts`, `useEditor.ts`, `EditorControls.tsx`, `Controllers/AnimationController.ts`, `Controllers/VideoController.ts`, `DetailView/Controlled{Checkbox,Color,Text}.tsx`, `Editor/StokedUiEditorApp.ts`.
- `packages/sui-timeline/` — `Timeline.tsx`, `StokedUiTimelineApp.ts`, `TimelineProvider.tsx`, `TimelineDetail.ts`, `TimelineAction.types.ts`, `ToggleButtonGroupEx.tsx`.
- `packages/sui-file-explorer/` — `File.tsx`, `FileElement.tsx`, plus `useFileExplorerFiles`, `useFileExplorerGrid`, `useFileExplorerJSXItems` plugins.
- `packages/sui-media/` — `App.ts`, `AppFile.ts`, `AppOutputFile.ts`, `WebFileFactory.ts`, `MediaFile/Metadata/ScreenshotStore.ts`, `api/types.ts`.
- `docs/` Next.js site (transitively, via packages above and direct imports of `UserMenu`, `SocialLinks`, `GrokLoader`).

### Contracts that must hold for downstream

1. **Single entry**: consumers import only from `@stoked-ui/common`, never from deep paths. Internal restructuring is allowed only if `src/index.tsx` keeps the same named exports.
2. **`createSettings` proxy semantics**: dot-path `get`/`set` and missing-intermediate creation. Consumers (editor `file.media.metadata`) rely on this for nested config.
3. **`createProviderState` flag/trigger model**: Editor and Timeline providers depend on `enableFlags`/`disableFlags`/`toggleFlags` and the `addTriggers`/`removeTriggers` cascade.
4. **`LocalDb` static state**: callers depend on `LocalDb.init()` being idempotent and on `LocalDb.disabled` short-circuiting all I/O. Persistent in-memory state is intentional.
5. **`MimeRegistry` static maps**: `MimeRegistry.exts`, `.names`, `.subtypes`, `.types` are global registries. `SUIMime.getInstance()` lazily seeds standard types (png/mp4/mp3) once.
6. **`Array.prototype.mergeWith`** is installed as a global side effect when any code imports `Types/mergeWith.ts`. As of 2026-06-06 there are **no `.mergeWith(...)` call sites in `src`** across the monorepo, but the prototype patch still ships on import, so removing or renaming it remains a breaking change for any external/runtime consumer that relies on it. Treat it as a published global contract, not dead code.
7. **Client-safe interfaces**: files in `src/interfaces/` must remain free of NestJS, Node, or React dependencies because `sui-common-api` re-exports them.

---

## 6. Key Source Files

| File | Lines | Why it matters |
|---|---|---|
| `src/index.tsx` | ~25 | The public surface contract. Adding/removing here changes the package's API. |
| `src/ProviderState/ProviderState.ts` | 153 | `createProviderState()` factory — flag state + trigger cascade used by Editor/Timeline providers. Contains the well-known `checkTriggers` closure quirk: object-shaped triggers write to the raw `settings` parameter (lines 110-112, 125-126), bypassing the `createSettings` Proxy. `removeFlags` throws `Flag "<name>" does not exist.` for unknown flags. |
| `src/ProviderState/Settings.ts` | 48 | `createSettings()` Proxy — dot-path get/set with autovivified intermediate objects. Behavior is depended on by `EditorFile`/`media.metadata`. |
| `src/LocalDb/LocalDb.ts` | 557 | Static `LocalDb` class wrapping IndexedDB via `@tempfix/idb`. Owns project save/load, version history, and per-project video appendage. Browser-only — must be guarded under SSR. |
| `src/LocalDb/VideoDb.tsx` | 104 | React hook layer over `LocalDb` for video records. Used by editor screenshot/recording flows. |
| `src/MimeType/IMimeType.ts` | 103 | `MimeRegistry` static class + `IMimeType` shape + `getExtension(url)` URL-parsing helper. |
| `src/MimeType/StokedUiMime.ts` | 45 | `SUIMime` singleton seeding standard MIME types and providing `make(application, ext, description, embedded)`. |
| `src/MimeType/MimeType.ts` | 1209 | Static MIME data map (extension → metadata). Treated as data; not unit-tested beyond spot checks. |
| `src/FetchBackoff/FetchBackoff.ts` | 56 | Exponential-backoff fetch wrapper. Defaults: 3 retries, factor 2, 500 ms initial delay. Used for resilient API calls. |
| `src/Colors/colors.ts` | 61 | `compositeColors(base, overlay)` — alpha compositing via MUI color helpers. |
| `src/Types/Types.ts` | 101 | `SortedList<T>` (binary-insert sorted Array subclass), `setProperty` (defineProperty wrapper), constructor type aliases. |
| `src/Types/mergeWith.ts` | 38 | Installs `Array.prototype.mergeWith` globally as an import side effect. |
| `src/Ids/namedId/namedId.ts` | 38 | `namedId(props?)` returns `prefix-id-suffix-<hex>`. Used everywhere for stable React keys / DOM IDs. |
| `src/Ids/useIncId/useIncId.ts` | 62 | Deterministic auto-incrementing ID hook for SSR-safe rendering. |
| `src/UserMenu/UserMenu.tsx` | 122 | MUI Avatar + dropdown shared chrome. Each menu item is opt-in via prop. |
| `src/SocialLinks/SocialLinks.tsx` (95), `SocialLinkField.tsx` (51), `platformRegistry.ts` (123) | ~269 | Controlled/uncontrolled list/editor for social platform URLs. The only test-covered surface in the package: 52 Jest cases across `__tests__/SocialLinks.test.tsx` (14), `SocialLinkField.test.tsx` (18), `platformRegistry.test.ts` (20) — `it.each` parameterization expands the case count well beyond the literal `it()` blocks. |
| `src/GrokLoader/GrokLoader.tsx` | 140 | Framer-motion animated loader. |
| `src/useResize/useResize.tsx` | 31 | Element-or-window dimensions hook. |
| `src/useResizeWindow/useResizeWindow.tsx` | 29 | Window-only dimensions hook. **Known bug:** calls `useState` after a conditional early return — violates rules of hooks under SSR. |
| `src/interfaces/publicity.ts` | 54 | `PUBLICITY_TYPES`, admin-only and "all filter" subsets, type guards. Re-exported by API packages. |
| `src/interfaces/embed-visibility.ts` | 42 | Embed-visibility constants and guards. |
| `src/interfaces/upload-types.ts` | 201 | Shared upload DTO types/constants (NestJS-free, React-free). Re-exported by `sui-common-api`/`sui-media-api`. |
| `src/Dialog/Dialog.types.ts` | 42 | Type-only confirm/prompt dialog contract. **Not exported** from `index.tsx` yet — staged surface (see §2). |

---

## 7. Change Impact

When this module changes, the following typically need validation:

### Always validate

- **Build** — `pnpm --filter @stoked-ui/common build` (modern + node + stable + types). Other packages consume the built `build/` directory in production.
- **Type check** — `pnpm --filter @stoked-ui/common typescript`.
- **Tests** — `pnpm --filter @stoked-ui/common test` (Jest, jsdom). See `.stokd/meta/packages/sui-common/SC_TEST.md` for the full test plan; today the only covered surface is `SocialLinks` (52 cases / 3 suites, last run 2026-06-06: all green). The rest of the package — `ProviderState`, `LocalDb`, `MimeType`, `FetchBackoff`, `Types`, `Ids`, the hooks — has no unit coverage, so changes there rely on downstream typecheck + manual smoke.
- **Downstream typescript** — every consumer in §5 transitively imports types here. A signature change ripples to `sui-editor`, `sui-timeline`, `sui-file-explorer`, `sui-media`, `sui-common-api`, `sui-media-api`, and the `docs/` site.

### Risk-specific checklists

| Change | What to validate |
|---|---|
| Edit `src/index.tsx` exports | Build all packages and `docs/` to catch missing-export errors. Some consumers import via deep paths historically; grep for deep imports before removing. |
| Edit `LocalDb.ts` schema, store names, or version | Existing user IndexedDB databases must migrate cleanly. Verify `init()` idempotence, `disabled=true` short-circuit, and saveFile/loadByName/loadByUrl in the editor authoring view (project versioning is the integration point). |
| Edit `createSettings` (Proxy semantics) | Editor `file.media` and detail-view bindings rely on dot-path access and on properties autovivifying. Test in the docs editor demo at `localhost:5199`. |
| Edit `createProviderState` triggers | Editor and Timeline providers depend on the flag cascade. The known `settings`-vs-`this.settings` quirk in `checkTriggers` (lines 110-112, 125-126) is **observed behavior** — don't "fix" without coordinating with provider consumers. |
| Edit `MimeRegistry` or `SUIMime` | Static state pollutes across consumers. New MIME types must use unique extensions/names to avoid collisions. Verify `SUIMime.getInstance()` still seeds png/mp4/mp3. |
| Edit `mergeWith.ts` | `Array.prototype.mergeWith` is global. Every consumer that calls `arr.mergeWith(other, key)` is at risk; grep before changing the signature. |
| Edit `FetchBackoff` defaults or retry behavior | Any consumer doing API calls; verify final-throw path still produces `"Fetch failed after maximum retries."`. |
| Edit `UserMenu` props or menu items | Docs site `AppHeader` and consulting/admin shells consume this directly — check `docs/` rendering. |
| Edit `useResize`/`useResizeWindow` | Confirm SSR safety — these run in the docs Next.js site which renders server-side. |
| Edit `interfaces/*` | These are also imported by `sui-common-api` and `sui-media-api`. Keep the files NestJS-free and React-free. |
| Add a runtime dependency | The package promises near-zero deps. Adding a heavy dependency increases install size for **every** Stoked UI consumer. Justify in PR. |
| Bump peer dependency ranges (MUI, React, Emotion) | Coordinate with all consumer packages so peer ranges stay aligned. |

### Smoke tests after non-trivial changes

1. `pnpm docs:dev` (port 5199) — open the home page and the editor showcase; confirm `UserMenu` opens, `GrokLoader` animates, and the editor saves/loads a project (exercises `LocalDb` + `createSettings` + `namedId`).
2. Open any media view that lists files — exercises MIME detection through `getExtension` + `MimeRegistry`.
3. Trigger a known-flaky API call to verify `FetchBackoff` retry path (or rely on unit tests once they exist).
