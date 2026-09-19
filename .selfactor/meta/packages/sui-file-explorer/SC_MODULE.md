# Module: @stoked-ui/file-explorer

> **Generated:** 2026-05-21 (upgrade 0.3.0 → 0.4.0) · **Refreshed:** 2026-06-06 (timed refresh — re-verified against source; corrected DnD reducer action names) · **Upgraded:** 2026-06-22 (0.4.0 → 0.6.0 — re-verified barrel, plugin tuple, DnD reducer action/instruction names, `FileExplorerWithFlags` fallback, and `indentPerLevel = 32` against source; refreshed test inventory now that the suites compile) · **Refreshed:** 2026-07-02 (timed refresh — no source changes since 2026-06-11 (`51a3baad04`); re-verified barrel, plugin tuple, `FileExplorerWithFlags` fallback grep, and package TS gate (green); added feature-flag defaults, `DndTrashMode`, declared-only dependents, and the project-8 benchmark artifacts) | **Meta version:** 0.6.0
> **Package location:** `packages/sui-file-explorer`
> **NPM name:** `@stoked-ui/file-explorer` (v0.1.2)
> **Source entry:** `packages/sui-file-explorer/src/index.ts`
> **Build artifacts:** `packages/sui-file-explorer/build/` (modern + node + stable + types)

---

## 1. Responsibility

`@stoked-ui/file-explorer` is the **headless tree/grid file browser** of the Stoked UI suite. It is built atop `@mui/x-tree-view` primitives and combines them with `@atlaskit/pragmatic-drag-and-drop` to deliver an asset browser that is reusable across the editor, the docs site, and consulting/admin views.

Design intent:

1. **Render hierarchical file trees** — folders, files, nested children — with controlled/uncontrolled expansion, single/multi/checkbox selection, focus tracking, and full keyboard navigation (arrow keys, Home/End, type-ahead).
2. **Compose behavior through a plugin runtime** — every feature (files, expansion, selection, focus, keyboard nav, icons, grid, DnD) is a plugin signature merged into a public API. New behavior plugs in via the `FILE_EXPLORER_PLUGINS` tuple.
3. **Drag-and-drop everything** — internal reorder/reparent across the tree, external drops from the OS (validated via MIME, extension, and size), DnD trash zones, and a custom drop indicator stack. Built on the Atlassian Pragmatic DnD adapters, surfaced via a context reducer (`fileListStateReducer`).
4. **Provide multiple presentations** — `FileExplorer` (legacy + MUI-X rendered), `FileExplorerBasic` (simplified), `FileExplorerTabs` (drawer + tabs + drop zones), and a grid view plugin that adds sortable, resizable column headers.
5. **Validate untrusted input** — the dropzone path runs every external file through `fileValidation.ts` (dangerous-extension, MIME allowlist, size limits) before exposing it to consumers.
6. **Gate rollouts via feature flags** — the `featureFlags/` subsystem (config + React context + persistence) lets `FileExplorerWithFlags` swap between legacy and MUI-X rendering and toggle DnD subsystems independently.
7. **Stay framework-pure** — the package ships React components and headless hooks only. No Next.js routes, no NestJS controllers, no CLI surface.

It is *not* the asset persistence layer (that lives in `@stoked-ui/common`'s `LocalDb` / `MediaFile` from `@stoked-ui/media`), *not* the upload pipeline (consumers wire that), and *not* a viewer (rendering of file contents is delegated to `MediaViewer` / consumer components).

---

## 2. Public Interfaces / Entry Points

The single entry barrel is `src/index.ts`. It re-exports the components, hooks, models, plugins, icons, theme augmentation, and the feature-flag system:

```ts
// packages/sui-file-explorer/src/index.ts
export * from './FileExplorer';
export * from './FileExplorerBasic';
export * from './FileExplorerTabs';
export * from './File';
export * from './FileElement';
export * from './useFile';
export * from './internals';
export * from './models';
export * from './icons';
export * from './hooks';
export * from './featureFlags';
export { FileExplorerWithFlags } from './FileExplorer/FileExplorerWithFlags';
export { FileExplorerLegacy } from './FileExplorer/FileExplorerLegacy';
```

### Public surface by category

| Surface | Exports | Source |
|---|---|---|
| Tree-view components | `FileExplorer`, `FileExplorerBasic`, `FileExplorerLegacy`, `FileExplorerWithFlags`, `FileExplorerProps`, `fileExplorerClasses`, `getFileExplorerUtilityClass` | `src/FileExplorer/FileExplorer.tsx`, `FileExplorerBasic/FileExplorerBasic.tsx`, `FileExplorer/FileExplorerLegacy.tsx`, `FileExplorer/FileExplorerWithFlags.tsx`, `FileExplorer/fileExplorerClasses.ts`, `FileExplorer/FileExplorer.types.ts` |
| Tabbed shell | `FileExplorerTabs`, `FileExplorerTabsProps`, `ExplorerPanelProps`, `getFileExplorerTabsUtilityClass`, `fileExplorerTabsClasses` | `src/FileExplorerTabs/FileExplorerTabs.tsx`, `FileExplorerTabs.types.ts`, `fileExplorerTabsClasses.ts` |
| Tree item primitives | `File`, `FileProps`, `fileClasses`, `getFileUtilityClass`, `FileElement`, `FileElementProps`, `useFile` | `src/File/`, `src/FileElement/`, `src/useFile/` |
| Dropzone | `FileDropzone`, `FileDropzoneProps`, `fileDropzoneClasses` | `src/FileDropzone/` |
| Models | `FileBase`, `FileBaseInput`, `FileId` | `src/models/items.ts` (re-exports `MediaType` from `@stoked-ui/media`) |
| Icons | `LottieIcon` and the icon set used by `useFileExplorerIcons` slot precedence | `src/icons/icons.tsx`, `LottieIcon.{js,d.ts}` |
| Hooks | `useFileExplorerApiRef`, `useFileUtils` | `src/hooks/useFileExplorerApiRef.tsx`, `src/hooks/useFileUtils/` |
| Plugin runtime (internals) | `useFileExplorer`, `FileExplorerProvider`, `unstable_resetCleanupTracking`, `buildWarning`, `FileProvider`, `FileIcon`, plugin hooks `useFileExplorerExpansion` / `useFileExplorerSelection` / `useFileExplorerFocus` / `useFileExplorerKeyboardNavigation` / `useFileExplorerIcons` / `useFileExplorerFiles` / `useFileExplorerJSXItems` / `useFileExplorerGrid` | `src/internals/index.ts` (entry), `src/internals/useFileExplorer/`, `FileExplorerProvider/`, `FileProvider/`, `FileIcon/`, `plugins/*` |
| DnD plugin | `useFileExplorerDnd`, `UseFileExplorerDndParameters`, `FileExplorerDndContext`, `FileExplorerDndItemContext`, `FileExplorerDndAction`, `fileListStateReducer`, `getFileExplorerStateDefault`, `validateFile`, `validateFiles`, `getRejectionReason`, `isDangerousExtension`, `isAllowedMimeType`, `isAcceptableFileSize`, file-export utilities | `src/internals/plugins/useFileExplorerDnd/*` |
| Feature flag system | `FeatureFlag`, `Environment`, `DEFAULT_FEATURE_FLAGS`, `ENVIRONMENT_CONFIGS`, `FEATURE_FLAG_DEPENDENCIES`, `FEATURE_FLAG_STORAGE_KEY`, `FeatureFlagProvider`, `useFeatureFlag`, `useFeatureFlags`, `shouldShowFeature`, `hashUserId`, `isValidFeatureFlagState`, `isValidFeatureFlagConfiguration`, `getCurrentEnvironment` | `src/featureFlags/FeatureFlagConfig.ts`, `FeatureFlagContext.tsx` |
| Theme augmentation | MUI `MuiFileExplorer` / `MuiFileExplorerBasic` / `MuiFile` / `MuiFileExplorerTabs` slot/class augmentation | `src/themeAugmentation/*` |
| Plugin signatures (TS only) | `FileExplorerPluginSignatures`, `FileExplorerPluginSlots`, `FileExplorerPluginSlotProps`, `FileExplorerPluginParameters`, `ConvertPluginsIntoSignatures`, `MergeSignaturesProperty`, `FileExplorerPublicAPI`, `FileExplorerExperimentalFeatures` | `src/FileExplorer/FileExplorer.plugins.ts`, `src/internals/models/` |

### Plugin tuple (the runtime contract)

`FILE_EXPLORER_PLUGINS` (`src/FileExplorer/FileExplorer.plugins.ts`) is the declarative composition order — plugins later in the list see state set by earlier plugins:

```ts
export const FILE_EXPLORER_PLUGINS = [
  useFileExplorerFiles,
  useFileExplorerExpansion,
  useFileExplorerSelection,
  useFileExplorerFocus,
  useFileExplorerKeyboardNavigation,
  useFileExplorerIcons,
  useFileExplorerGrid,
  useFileExplorerDnd,
] as const;
```

Each plugin contributes `params`, `state`, `models`, `slots`, `slotProps`, public-API methods, and event handlers; the runtime in `internals/useFileExplorer/` merges them into the `FileExplorerPublicAPI` exposed via `apiRef`.

The package is **library-only**: there are no commands, providers, or routes outside React components and headless hooks.

---

## 3. Products

This module is consumed by the single product documented in this repo:

- **SC_PRODUCT_STOKED_UI_SUI.md** — `@stoked-ui/sui`. The file explorer is one of the marquee components in the suite. It powers:
  - the `/products/file-explorer/` showcase (`docs/pages/products/file-explorer/example/index.tsx`),
  - the `file-explorer` MDX docs section under `docs/data/file-explorer/docs/`,
  - the homepage `HeroFileExplorer` and `FileExplorerShowcase` demos,
  - the consulting portal's `ConsultingDocumentBrowserCard` and `FolderTreeView` showcase cards,
  - the editor's `EditorFileTabs` (which embeds `FileExplorerTabs` as the asset browser).

There is no other product doc; the module participates in only this one.

Internal consumers (non-publishable) include:
- `packages/sui-editor/src/EditorFileTabs/EditorFileTabs.tsx` — embeds `FileExplorerTabs`, `FileBase`, and `ExplorerPanelProps` to drive the editor asset rail.
- `docs/src/components/home/FileExplorerShowcase.tsx`, `docs/src/components/showcase/FileListCard.tsx`, `FolderTreeView.tsx`, `ConsultingDocumentBrowserCard.tsx`.
- `docs/data/file-explorer/docs/file-explorer/**` and `docs/data/file-explorer/docs/file-explorer-basic/**` — every customization, dropzone, drag-and-drop, expansion, focus, items, and selection demo.
- `docs/pages/blog/sui/stoked-ui-file-explorer.md`, `introducing-stoked-ui.md`, `stoked-ui-timeline-editor.md` — marketing posts.

---

## 4. Views

From `SC_VIEWS.md` §11 ("File-Explorer Package Views — `@stoked-ui/file-explorer`"), this module **directly renders or owns** the following views:

| View | File | Notes |
|---|---|---|
| §11.1 FileExplorer / FileExplorerBasic | `src/FileExplorer/FileExplorer.tsx`, `FileExplorerBasic/FileExplorerBasic.tsx` | Tree list (`ul.MuiFileExplorer-root`), optional grid headers, selection checkbox column. States: expanded, collapsed, multi-select, drag-active, drop-zone, filtered, virtualized. |
| §11.2 File / FileElement (Tree Item) | `src/File/`, `src/FileElement/` | Regions: `FileLabel`, `FileIconContainer`, `FileExtras`, selection checkbox. States: expanded/collapsed, selected, focused, disabled, locked, hovered, drag-source, drop-target. |
| §11.3 FileDropzone | `src/FileDropzone/FileDropzone.tsx` | External drop target with drag-over highlight. States: idle, drag-over, uploading, success, error. |
| §11.4 FileExplorerTabs | `src/FileExplorerTabs/FileExplorerTabs.tsx` | Tabs (Files/Assets/Exports/...) wrapping `FileExplorer` or `FileDropzone`; collapsible `MuiDrawer`. States: active-tab, loading, empty. |
| §11.5 Grid View Plugin | `src/internals/plugins/useFileExplorerGrid/` | Renders `FileExplorerGridHeaders`, `FileExplorerGridColumns`, `FileExplorerGridHeaderCell` inside the root tree. States: sorted, filtered, resizable, sortable, default. |

This module also **materially shapes** these views authored elsewhere:

- §1.1 Home Page hero — `HeroFileExplorer` (`docs/src/components/home/HeroFileExplorer.tsx`) dynamically renders the showcase `FileExplorerCard` → `FileExplorerHero` (`docs/src/components/showcase/FileExplorerHero.tsx`), which embeds `FileExplorer`.
- §1.2 Products Index — file-explorer card.
- §3.x Showcase pages (`/products/file-explorer/`) — full demo grid.
- §8 Embedded showcase — `FileExplorerShowcase`, `FileExplorerCard`, `FolderTreeView`, `ConsultingDocumentBrowserCard`.
- §9.5 Editor `EditorFileTabs` — embeds `FileExplorerTabs` for the editor asset rail.

---

## 5. Integration Points

### Upstream (this module depends on)

| Dependency | Purpose |
|---|---|
| `@mui/x-tree-view` (^7.22.2) | Underlying tree primitives (item rendering, collapse, ARIA) when MUI-X rendering is enabled. |
| `@mui/base`, `@mui/system`, `@mui/utils`, `@mui/material`, `@mui/icons-material` | Slot composition, `styled`, theming, classes, fallback icons. |
| `@atlaskit/pragmatic-drag-and-drop` (+ `-flourish`, `-hitbox`, `-react-drop-indicator`) | Internal reorder, external file drops, drop indicators, post-move flash. |
| `@react-spring/web` | Animations on expand/collapse and drop-indicator transitions. |
| `@stoked-ui/media` (peer) | `MediaFile`, `MediaType` types — every `FileBase` carries a `mediaType`; DnD payloads can be `MediaFile` instances. |
| `@stoked-ui/common` (peer) | Shared primitives used by consumers (e.g. `LocalDb` in `EditorFileTabs`); not a direct runtime dep of this package's source. |
| `tiny-invariant`, `clsx`, `memoize-one`, `prop-types` | Standard utility set. |

### Downstream (consumers in this monorepo)

| Consumer | Usage |
|---|---|
| `packages/sui-editor` | `EditorFileTabs` (`src/EditorFileTabs/EditorFileTabs.tsx`) imports `FileExplorerTabs`, `FileBase`, `FileExplorerTabsProps`, `ExplorerPanelProps` to render the editor asset rail. `Editor/Editor.types.ts` imports `FileExplorerProps` / `FileExplorerTabsProps`. The editor's `useEditorMetadata` / `useEditorKeyboard` plugin tests additionally reach into `@stoked-ui/file-explorer/internals` (a deep import across the workspace boundary — see repo-global AX-REPO-PACKAGE-BARREL); the `internals` barrel is therefore a de-facto contract for editor tests, not just the package's own runtime. |
| `docs/data/file-explorer/docs/**` | Every documented demo (selection, expansion, focus, items, dropzone, drag-and-drop, customization) across both `file-explorer/` and `file-explorer-basic/` sub-trees. |
| `docs/src/components/home/FileExplorerShowcase.tsx` | Homepage showcase. |
| `docs/src/components/showcase/{FolderTreeView,FileListCard,ConsultingDocumentBrowserCard}.tsx` | Embedded showcase cards. |
| `docs/pages/products/file-explorer/example/index.tsx` | `/products/file-explorer/` demo route. |
| `docs/pages/products/file-explorer/api/*.json` | Generated API JSON consumed by the docs MDX renderer. |

### Cross-cutting contracts

- **`FileBase` / `FileBaseInput`** — the canonical item shape (`id`, `name`, `mediaType`, `type`, optional `size`, `lastModified`, `url`, `media`, `path`, `children`, `expanded`, `selected`, `version`, …). Every consumer must conform to this shape; the editor uses it as the runtime form of `EditorFile` / `IEditorTrack` data.
- **`apiRef` (`FileExplorerPublicAPI`)** — imperative interface exposed to consumers: `focusItem`, `setItemExpansion`, `getItem`, `selectItem`, `getItemTree`, etc.
- **DnD callbacks** — `onItemPositionChange` (internal reorder), `onAddFiles` (external drops), `onItemDoubleClick`. External drops are validated through `fileValidation.ts` before reaching consumer code. Trash behavior is selected via `DndTrashMode` (`useFileExplorerDnd.types.ts:43`): `'remove' | 'collect-remove-restore' | 'collect-restore' | 'collect'`.
- **Feature flags** — when `FileExplorerWithFlags` is used, runtime behavior is gated by `useMuiXRendering`, `dndInternal`, `dndExternal`, `dndTrash` (see `featureFlags/FeatureFlagConfig.ts`). Consumers can wrap in `<FeatureFlagProvider userId="...">` to opt in. `DEFAULT_FEATURE_FLAGS` currently enables **all four flags at 100% traffic** (`FeatureFlagConfig.ts:104`); the production entry in `ENVIRONMENT_CONFIGS` deliberately overrides nothing and falls back to these defaults, so runtime overrides (localStorage / provider props) are the rollout lever. The three DnD flags each depend on `USE_MUI_X_RENDERING` via `FEATURE_FLAG_DEPENDENCIES`.
- **Declared-only dependents** — `packages/sui-timeline/package.json:54` and `packages/sui-docs/package.json:92` declare `"@stoked-ui/file-explorer": "workspace:^"` but have **no source imports** today (verified 2026-07-02). Removing those entries is safe only after re-checking; adding imports there would create new real consumers.

---

## 6. Key Source Files

| File | Why it matters |
|---|---|
| `src/index.ts` | Public barrel; defines what is exported and what is internal. |
| `src/FileExplorer/FileExplorer.tsx` | Public `FileExplorer` component (delegates to `FileExplorerLegacy` today). The default export consumers reach for. |
| `src/FileExplorer/FileExplorerLegacy.tsx` | Concrete legacy renderer used by `FileExplorer` and as the fallback in `FileExplorerWithFlags` when `useMuiXRendering=false`. |
| `src/FileExplorer/FileExplorerWithFlags.tsx` | Feature-flag-gated entry point; switches rendering implementations and toggles DnD subsystems independently. |
| `src/FileExplorer/FileExplorer.plugins.ts` | Declares `FILE_EXPLORER_PLUGINS` tuple and the merged `FileExplorerPluginParameters` / `Slots` / `SlotProps` types. Plugin order is load-bearing. |
| `src/FileExplorer/FileExplorer.types.ts`, `fileExplorerClasses.ts` | Public prop & class definitions. |
| `src/FileExplorerBasic/FileExplorerBasic.tsx` | Slimmer variant — same plugin runtime, fewer props. |
| `src/FileExplorerTabs/FileExplorerTabs.tsx` | Tabbed/drawer shell that the editor uses; combines `FileExplorer`, `Drawer`, MUI `Tabs`. |
| `src/File/File.tsx`, `src/FileElement/`, `src/useFile/` | The tree-item component, its DOM-element wrapper, and the headless hook providing slot props/classes. |
| `src/FileDropzone/FileDropzone.tsx` | External-drop target; pairs with `useFileExplorerDnd` for file validation. |
| `src/internals/index.ts` | Internal barrel; entry point for the plugin runtime, provider, contexts, types. |
| `src/internals/useFileExplorer/useFileExplorer.tsx` | The runtime that walks the plugin tuple, merges state, and exposes `apiRef`. |
| `src/internals/FileExplorerProvider/FileExplorerProvider.tsx` | React context wiring; provides instance, store, public API to descendants. |
| `src/internals/FileProvider/`, `FileIcon/`, `FileDepthContext/` | Context layers used by `File`/`FileElement` for rendering and indentation. |
| `src/internals/plugins/useFileExplorerFiles/` | Source-of-truth plugin: ingests `items` prop, builds the item map and tree shape. |
| `src/internals/plugins/useFileExplorerExpansion/` | Controlled/uncontrolled expansion state. |
| `src/internals/plugins/useFileExplorerSelection/` | Single/multi/checkbox selection, range select, modifiers. |
| `src/internals/plugins/useFileExplorerFocus/` | Tab-index management and focus tracking. |
| `src/internals/plugins/useFileExplorerKeyboardNavigation/` | Arrow keys, Home/End, Enter/Space, type-ahead. |
| `src/internals/plugins/useFileExplorerIcons/` | Slot precedence for expand/collapse/end/item icons. |
| `src/internals/plugins/useFileExplorerGrid/` | Adds `FileExplorerGridHeaders`, columns, header cells, sorting/resizing. |
| `src/internals/plugins/useFileExplorerJSXItems/` | Alternative JSX-children-based item declaration (used when `items` prop is not provided). |
| `src/internals/plugins/useFileExplorerDnd/useFileExplorerDnd.tsx` (~800 lines) | The DnD plugin: registers Atlassian Pragmatic adapters (`draggable`, `dropTargetForElements`, `monitorForElements`, external adapters), tracks drop-target hitboxes, fires post-move flashes. |
| `src/internals/plugins/useFileExplorerDnd/FileExplorerDndContext.ts` | DnD reducer (`fileListStateReducer`) + `getFileExplorerStateDefault` + context value (`FileExplorerDndContext`). Drives all DnD state transitions; the reducer dispatches on `action.type` ∈ `set-state`, `create-child`, `create-children`, `remove`, `instruction` — where `instruction` further branches on the Pragmatic-hitbox instruction (`reparent`, `reorder-above`, `reorder-below`, `make-child`). |
| `src/internals/plugins/useFileExplorerDnd/FileExplorerDndAction.ts` | The `FileExplorerDndAction<R>` discriminated union consumed by the reducer (one variant per `action.type` above). |
| `src/internals/plugins/useFileExplorerDnd/FileExplorerDndItemContext.ts`, `useFileExplorerDnd.types.ts`, `constants.ts` (`indentPerLevel = 32`), `index.ts` | Per-item DnD context, plugin type surface, indentation constant, and the DnD barrel. |
| `src/internals/plugins/useFileExplorerDnd/fileValidation.ts` (249 lines, security-critical) | `isDangerousExtension`, `isAllowedMimeType`, `isAcceptableFileSize`, `validateFile`, `validateFiles`, `getRejectionReason` (+ `FileValidationResult` / `FileValidationBatchResult` types). The gate between OS drops and consumer code. |
| `src/internals/plugins/useFileExplorerDnd/fileExportUtils.ts` | Blob creation, download URL generation, file export helpers. |
| `src/internals/plugins/useFileExplorerDnd/muiXDndAdapters.ts` | Adapter shims that bridge Pragmatic DnD events to the MUI-X tree's data model (`ItemPositionChangeParams`). |
| `src/internals/utils/EventManager.ts` | Pub/sub used by plugins for cross-cutting events (priority + ordered). |
| `src/internals/utils/transformFilesToTreeItems.ts` | Converts a flat `File[]` (from `<input type=file>` or DataTransfer) into a `FileBaseInput` tree. |
| `src/internals/utils/publishFileExplorerEvent.ts`, `fileExplorer.ts`, `warning.ts`, `cleanupTracking/` | Event dispatch, helpers, dev warnings, listener cleanup tracking. |
| `src/internals/zero-styled/` | The package's `styled` / `useThemeProps` indirection so the build can swap zero-runtime for emotion. |
| `src/featureFlags/FeatureFlagConfig.ts` (243 lines) | `FeatureFlag` enum, environment configs, dependency graph (`FEATURE_FLAG_DEPENDENCIES`), persistence key, validation predicates, percentage rollouts (`shouldShowFeature` + `hashUserId`). |
| `src/featureFlags/FeatureFlagContext.tsx` | React provider, `useFeatureFlag`, `useFeatureFlags`, runtime updates, localStorage persistence, emergency disable. |
| `src/hooks/useFileExplorerApiRef.tsx` | Public hook for parent apps to obtain a typed ref to the `FileExplorerPublicAPI`. |
| `src/hooks/useFileUtils/` | `useFileUtils` — interactions object (`handleExpansion`, `handleSelection`, status accessors). |
| `src/icons/icons.tsx`, `LottieIcon.{js,d.ts}` | Default icon set (folder, file, expand chevrons) and Lottie wrapper. |
| `src/models/items.ts` | `FileBase`, `FileBaseInput`, `FileId`. The cross-package data contract. |
| `src/themeAugmentation/` | TypeScript module augmentation so `MuiFileExplorer*` slots/classes appear in MUI theme types. |
| `scripts/benchmark.mjs`, `benchmark-results.json`, `test-benchmark.html` (package root) | Project-8 performance-benchmarking artifacts (Work Item 4.1, 2026-01-19): render-time targets for 100/1000 items, drag latency baselines. The JSON is a checked-in snapshot (values marked `estimated: true`), not a CI gate. |

---

## 7. Change Impact

When this module changes, the following is what usually breaks or needs validation:

### Always re-validate

- **Editor asset rail** — `packages/sui-editor/src/EditorFileTabs/EditorFileTabs.tsx` imports `FileExplorerTabs`, `FileBase`, `FileExplorerTabsProps`, `ExplorerPanelProps`. Type changes to any of these ripple into the editor build.
- **Docs demos** — every file under `docs/data/file-explorer/docs/**` imports from `@stoked-ui/file-explorer`. Prop renames break MDX showcases; a quick `pnpm docs:dev` (port 5199) on `/file-explorer/docs/...` is the smoke test.
- **Generated API JSON** — `docs/pages/products/file-explorer/api/{file,file-element,file-explorer,file-explorer-basic}.json` is regenerated from TypeScript prop types via the docs API generator. Public prop/class changes require a regen.
- **Theme augmentation** — adding a new slot/class to `FileExplorer*` requires a corresponding entry in `src/themeAugmentation/` so consumer themes still type-check.

### High-risk areas

1. **Plugin order in `FILE_EXPLORER_PLUGINS`** — reordering changes which plugin sees which state. Selection and keyboard navigation depend on focus/expansion being initialized first. Any change here demands the full plugin test suite run.
2. **`FileBase` shape changes** — every consumer (editor tracks, docs demos, showcase cards) constructs `FileBase` literals. Required-field changes break compile site-wide. Bumping `mediaType` enum requires coordinating `@stoked-ui/media`.
3. **DnD reducer (`fileListStateReducer`)** — dispatches on `action.type` ∈ `set-state`, `create-child`, `create-children`, `remove`, `instruction` (the `instruction` branch further handles the Pragmatic-hitbox sub-types `reparent` / `reorder-above` / `reorder-below` / `make-child`). Logic regressions silently corrupt tree state mid-drop; cover with the (currently missing) `FileExplorerDndContext.test.ts`.
4. **`fileValidation.ts`** — security-critical gate against executable/script drops. Any loosening of `isDangerousExtension` / `isAllowedMimeType` defaults must be reviewed; tighten only after auditing every consumer that overrides `dndFileTypes` / `dndMaxFileSize`.
5. **Atlassian Pragmatic DnD upgrade** — adapter API has shifted between minor versions; bumps to `@atlaskit/pragmatic-drag-and-drop*` need full DnD test coverage and manual verification of internal reorder + external drop in the editor.
6. **`@mui/x-tree-view` upgrade** — the legacy renderer relies on internal MUI-X primitives. A major bump can change accessibility roles and slot mounting; toggle `useMuiXRendering` flag in both states to check.
7. **Feature flag rollouts** — flipping `useMuiXRendering` defaults, or changing dependency graph in `FEATURE_FLAG_DEPENDENCIES`, can swap rendering paths in production. Validate with `FeatureFlagProvider` wrapping showcase pages.

### Validation playbook

- Run `pnpm typescript` in `packages/sui-file-explorer` (full TS check via `tsconfig.json`).
- Run `cross-env NODE_ENV=test mocha 'packages/sui-file-explorer/src/**/*.test.{ts,tsx}'`. Current suite inventory (21 files): component tests (`File.test.tsx`, `FileElement.test.tsx`, `FileExplorer.test.tsx`, `FileExplorerAlternatingRows.test.tsx`, `FileExplorerBasic.test.tsx`, `FileDropzone.test.{js,tsx}`, `useFile.test.tsx`), plugin tests (`useFileExplorer{Expansion,Files,Focus,Grid,Icons,KeyboardNavigation,Selection}.test.tsx`, `useFileExplorer.test.tsx`), DnD (`fileExportUtils.test.ts`), feature flags (`FeatureFlagConfig.test.ts`, `FeatureFlagContext.test.tsx`), and theme augmentation (`themeAugmentation.spec.ts`). **Caveat (re-verified 2026-07-02):** TS-green ≠ suite-loads — the SC_TEST.md §0 harness-path breakage is still live (~12 files import `test/utils/fileExplorer-view/…` / `tree-view/…` / `file-list/…` paths that don't exist; the harness lives at `test/utils/file-explorer/describeFileExplorer`), `fileExportUtils.test.ts` still imports `@jest/globals`, and `File.test.tsx` still targets upstream `@mui/x-file-list`. See `SC_TEST.md` §0/§6 for the fix plan.
- `pnpm build` to verify the modern + node + stable + types builds all succeed.
- Start `pnpm docs:dev` (port 5199) and click through:
  - `/file-explorer/docs/` demos (selection, expansion, dropzone),
  - `/products/file-explorer/example` showcase,
  - `/editor/docs/` (verifies `EditorFileTabs` integration),
  - homepage hero and consulting `FolderTreeView` showcase card.
- For DnD changes specifically, manually drag a file from the OS into the dropzone (verify validation messages) and reorder items inside the tree (verify post-move flash + `onItemPositionChange` callback).
- For accessibility-impacting changes: verify `role="tree"`, `role="treeitem"`, `aria-expanded`, `aria-selected`, `aria-multiselectable`, and `tabindex` rotation across keyboard navigation.

---
