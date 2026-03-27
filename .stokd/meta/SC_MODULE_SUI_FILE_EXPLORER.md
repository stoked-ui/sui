# SC_MODULE_SUI_FILE_EXPLORER

> **Meta version:** 0.2.0 | **Generated:** 2026-03-21
> **Package:** `@stoked-ui/file-explorer` | **Path:** `packages/sui-file-explorer`

---

## Module Name

`@stoked-ui/file-explorer` — `packages/sui-file-explorer`

---

## Responsibility

Provides a fully-featured, plugin-driven hierarchical file-tree component for React. Design intent:

- **Fork/extension of `@mui/x-tree-view`** — keeps MUI theming/slots/DI but replaces tree items with file-domain primitives (`FileBase`, `FileMeta`).
- **Plugin composition architecture** — every behavioral concern (selection, expansion, focus, keyboard nav, icons, grid, DnD) is a discrete hook plugin wired together by `useFileExplorer`. Consumer variants choose their plugin set.
- **Two rendering modes** controlled by the `FeatureFlag.USE_MUI_X_RENDERING` feature flag: legacy recursive (`FileExplorerLegacy`) vs. MUI X `RichTreeView`-backed rendering.
- **Three consumer-facing variants**: `FileExplorer` (data-prop driven), `FileExplorerBasic` (JSX-children driven), `FileExplorerTabs` (multi-panel tabbed container).
- **Drag-and-drop** via `@atlaskit/pragmatic-drag-and-drop` with three modes: internal reorder, external file drop, and trash collection.
- **Grid/columnar view** via `useFileExplorerGrid` — renders column headers and enforces column widths per file attribute.

---

## Public Interfaces / Entry Points

**Package entry: `src/index.ts`**

### Components

| Export | Source | Purpose |
|--------|--------|---------|
| `FileExplorer` | `src/FileExplorer/FileExplorer.tsx` | Primary data-driven component; delegates to `FileExplorerLegacy` |
| `FileExplorerLegacy` | `src/FileExplorer/FileExplorerLegacy.tsx` | Recursive rendering impl; wraps `FileWrapped` per item |
| `FileExplorerWithFlags` | `src/FileExplorer/FileExplorerWithFlags.tsx` | Feature-flagged variant; switches between legacy and MUI X |
| `FileExplorerBasic` | `src/FileExplorerBasic/FileExplorerBasic.tsx` | JSX-children variant (no `items` prop); uses `SIMPLE_FILE_EXPLORER_VIEW_PLUGINS` |
| `FileExplorerTabs` | `src/FileExplorerTabs/` | Multi-panel tabbed container; accepts `tabData: Record<string, ExplorerPanelProps>` |
| `File` | `src/File/` | Primary file-item component with full slot API |
| `FileElement` | `src/FileElement/` | Legacy item component (compatibility) |
| `FileDropzone` | `src/FileDropzone/` | Empty-state drop zone; rendered when `items` is empty and `dropzone={true}` |

### Hooks (public)

| Export | Source | Purpose |
|--------|--------|---------|
| `useFile` | `src/useFile/useFile.ts` | Item-level hook for use in custom item renderers |
| `useFileExplorerApiRef` | `src/hooks/` | Creates imperative API ref (`apiRef`) |
| `useFileUtils` | `src/hooks/useFileUtils/` | Utility hook for file item state |

### Plugin Hooks (internals — re-exported from `src/internals/index.ts`)

| Hook | Signature type | Responsibility |
|------|----------------|----------------|
| `useFileExplorerFiles` | `UseFileExplorerFilesSignature` | Owns the item map, parent/child tree, ordered sibling indexes |
| `useFileExplorerExpansion` | `UseFileExplorerExpansionSignature` | Expanded-item state; controlled/uncontrolled; `setItemExpansion` API |
| `useFileExplorerSelection` | `UseFileExplorerSelectionSignature` | Selection state; single/multi; checkbox; `selectItem` API |
| `useFileExplorerFocus` | `UseFileExplorerFocusSignature` | Focus tracking; `focusItem` API |
| `useFileExplorerKeyboardNavigation` | `UseFileExplorerKeyboardNavigationSignature` | Arrow keys, Home/End, type-ahead `firstCharMap`; `handleItemKeyDown` |
| `useFileExplorerIcons` | `UseFileExplorerIconsSignature` | Per-file-type icon resolution |
| `useFileExplorerJSXItems` | `UseFileExplorerJSXItemsSignature` | JSX-children mode; populates item map from React children |
| `useFileExplorerGrid` | `UseFileExplorerGridSignature` | Column definitions, header rendering, width management; `getColumns`/`setColumns` API |
| `useFileExplorerDnd` | `UseFileExplorerDndSignature` | Atlaskit DnD; internal reorder, external file drop, trash; `dropInternal`, `createChild`, `removeItem` |

### Core Plugin Hooks

| Hook | Purpose |
|------|---------|
| `useFileExplorerId` | Assigns stable auto-incrementing IDs to explorer instances |
| `useFileExplorerInstanceEvents` | `EventManager`-based pub/sub between plugins and consumers |

### Feature Flag System

| Export | Source |
|--------|--------|
| `FeatureFlag` enum | `src/featureFlags/FeatureFlagConfig.ts` |
| `FeatureFlagProvider`, `useFeatureFlag`, `useFeatureFlags` | `src/featureFlags/FeatureFlagContext.ts` |
| `DEFAULT_FEATURE_FLAGS`, `ENVIRONMENT_CONFIGS` | `src/featureFlags/FeatureFlagConfig.ts` |

Flags: `USE_MUI_X_RENDERING`, `DND_INTERNAL`, `DND_EXTERNAL`, `DND_TRASH`.

### Public API (via `apiRef`)

Exposed on `apiRef.current` at runtime:

```ts
focusItem(event, id)
getItem(id): FileBase
getItemDOMElement(id): HTMLElement
getItemOrderedChildrenIds(id): string[]
gridEnabled(): boolean
selectItem(event, id, keepExistingSelection?, shouldBeSelected?)
setColumns(columns)
setItemExpansion(event, id, isExpanded)
setVisibleOrder(ids)
```

### Models

| Export | Source | Key fields |
|--------|--------|-----------|
| `FileBase` | `src/models/` | `id`, `name`, `type`, `mediaType`, `size`, `path`, `created`, `lastModified`, `children`, `selected`, `expanded`, `visibleIndex` |
| `FileMeta` | `src/internals/models/fileExplorerView.ts` | `parentId`, `depth`, `expandable`, `disabled`, `dndState`, `dndInstruction`, `dndContainer`, `visibleIndex` |
| `DndState` | same | `'idle' \| 'dragging' \| 'preview' \| 'parent-of-instruction'` |

---

## Products

No separate product docs files were listed for this module. The module is documented within:

- `docs/data/file-explorer/` — demo pages for FileExplorer, FileExplorerBasic (customization, DnD, dropzone, items)
- `docs/pages/products/file-explorer/` — product showcase and example pages

---

## Views

This module renders or materially shapes the following views from `SC_VIEWS.md`:

| View | Role |
|------|------|
| **1.2 Product Showcase Pages** (`/products/file-explorer/`) | `FileExplorerShowcase` (`docs/src/components/home/FileExplorerShowcase.tsx`) renders a live `FileExplorer` or `FileExplorerBasic` instance as the hero |
| **1.3 Product Documentation Pages** (file-explorer docs) | All `docs/data/file-explorer/docs/**` demos embed `FileExplorer`, `FileExplorerBasic`, `FileExplorerWithFlags`, `FileDropzone` directly |
| **1.6 File Explorer Standalone Example** (`/products/file-explorer/example`) | `docs/pages/products/file-explorer/example/index.tsx` — standalone `FileExplorer` instance |
| **1.5 Editor PWA** | `EditorFileTabs` in `packages/sui-editor` uses `FileExplorerTabs` for the Projects and Track Files panels inside the editor shell |

---

## Integration Points

### Upstream dependencies

| Dependency | Usage |
|------------|-------|
| `@atlaskit/pragmatic-drag-and-drop` ^1.2.1 | Core DnD primitives in `useFileExplorerDnd` |
| `@atlaskit/pragmatic-drag-and-drop-hitbox` ^1.0.3 | Tree-item hit-box calculation for DnD instruction |
| `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` ^1.1.1 | Visual drop indicator rendering |
| `@mui/x-tree-view` ^7.22.2 | Structural reference; `RichTreeView` used in MUI-X rendering mode |
| `@mui/base` 5.0.0-beta.40 | `useSlotProps`, `SlotComponentProps` |
| `@mui/system`, `@mui/utils` | Theme, `composeClasses`, `createStyled` |
| `@react-spring/web` ^9.7.3 | Group-transition animation for expand/collapse |
| `@stoked-ui/common` (peer) | `LocalDb`, shared utilities |
| `@stoked-ui/media` (peer) | `MediaFile`, `IMediaFile` consumed in `EditorFileTabs` |

### Downstream consumers

| Consumer | How it uses this module |
|----------|------------------------|
| `packages/sui-editor` | `EditorFileTabs.tsx` imports `FileExplorerTabs`, `FileBase`, `ExplorerPanelProps` for Projects/Track Files panels |
| `packages/sui-editor` | `Editor.types.ts` imports item types for editor file tracking |
| `docs/` | Demo pages, showcase components, `FileExplorerHero`, `FileListCard` |

### Context contract

`FileExplorerProvider` wraps the tree and injects `FileExplorerContextValue<TSignatures>`. All child components (`File`, `FileElement`, `FileElementContent`) consume it via `useFileExplorerContext`. Breaking this context shape (plugin signature merging in `src/internals/models/helpers.ts`) breaks all child rendering.

---

## Key Source Files

| File | Why it matters |
|------|----------------|
| `src/index.ts` | Package entry — controls what is public API |
| `src/FileExplorer/FileExplorer.tsx` | Consumer-facing component; thin forwardRef over `FileExplorerLegacy` |
| `src/FileExplorer/FileExplorerLegacy.tsx` | Full rendering implementation: plugin wiring, grid headers, DnD context, item recursion via `FileWrapped` |
| `src/FileExplorer/FileExplorer.plugins.ts` | `FILE_EXPLORER_PLUGINS` array — defines the canonical plugin set for the rich variant |
| `src/FileExplorerBasic/FileExplorerBasic.plugins.ts` | `SIMPLE_FILE_EXPLORER_VIEW_PLUGINS` — JSX variant omits `useFileExplorerFiles` data prop |
| `src/internals/useFileExplorer/useFileExplorer.ts` | Core orchestration hook: initialises all plugins, builds context value and public API |
| `src/internals/FileExplorerProvider/FileExplorerProvider.tsx` | React context provider; all child components depend on it |
| `src/internals/plugins/useFileExplorerDnd/` | DnD plugin: `useFileExplorerDnd.ts` (main), `useFileExplorerDnd.types.ts` (signatures), `FileExplorerDndContext.ts` (context for child access), `FileExplorerDndAction.ts` (action constants) |
| `src/internals/plugins/useFileExplorerGrid/` | Grid plugin: `useFileExplorerGridHeaders.tsx` (header row), `FileExplorerGridHeaders.types.ts`, `fileExplorerViewGridHeadersClasses.ts` |
| `src/internals/plugins/useFileExplorerFiles/useFileExplorerFiles.utils.ts` | `FILE_EXPLORER_VIEW_ROOT_PARENT_ID`, `buildSiblingIndexes` — used across plugins to traverse the item tree |
| `src/internals/models/fileExplorerView.ts` | `FileMeta`, `FileExplorerInstance`, `FileExplorerPublicAPI`, `DndState` — core runtime types |
| `src/internals/models/plugin.types.ts` | `FileExplorerPluginSignature`, `FileExplorerAnyPluginSignature` — TypeScript machinery for plugin composition |
| `src/featureFlags/FeatureFlagConfig.ts` | `FeatureFlag` enum, environment configs, rollout strategy |
| `src/File/File.types.ts` | `FileProps`, `FileSlots`, `FileSlotProps` — slot API consumed by the editor and docs |
| `src/FileExplorerTabs/FileExplorerTabs.types.ts` | `ExplorerPanelProps`, `FileExplorerTabsProps` — tabbed container API used by `EditorFileTabs` |

---

## Change Impact

| Change area | What breaks / must be validated |
|-------------|--------------------------------|
| **`FileBase` model fields** | `EditorFileTabs` in `sui-editor` reads `mediaType`, `name`, `id`; docs demos use `id`/`name`/`children`/`size`/`type`. Adding required fields is a breaking change for all consumers. |
| **Plugin signature types** (`src/internals/models/plugin.types.ts`) | TypeScript errors propagate to every plugin and both `FILE_EXPLORER_PLUGINS`/`SIMPLE_FILE_EXPLORER_VIEW_PLUGINS` arrays. Run `pnpm typescript` across the monorepo. |
| **`FileExplorerProvider` context shape** | All `useFileExplorerContext` calls in `File`, `FileElement`, `FileElementContent`, `FileExplorerGridHeaders` break. Test expansion, selection, focus, and DnD interactions. |
| **`useFileExplorer` return value** (`getRootProps`, `contextValue`, `instance`) | `FileExplorerLegacy` and `FileExplorerBasic` both destructure this; changes require updates to both variants. |
| **DnD plugin** (`useFileExplorerDnd`) | `FileWrapped` and `FileExplorerDndContext` consumers break. Validate internal reorder, external drop, trash in `FileExplorerLegacy`. |
| **Grid plugin** (`useFileExplorerGrid`) | `FileExplorerGridHeaders` rendering breaks; `getColumns`/`setColumns` API on `apiRef` changes; `FileExplorerTabs` passes `gridColumns` to `ExplorerPanelProps`. |
| **Public `apiRef` methods** | `EditorFileTabs` may call `apiRef.current` methods. Any rename or removal requires updating `sui-editor`. |
| **Feature flags** (`FeatureFlagConfig.ts`) | `FileExplorerWithFlags` routing logic changes. Validate that `useMuiXRendering=false` still renders `FileExplorerLegacy` correctly. |
| **Slot API** (`FileSlots`, `FileSlotProps`) | Docs demos (`HeadlessAPI.tsx`, `LabelSlots.tsx`, `LabelSlotProps.tsx`) and `sui-editor` slots break. |
| **`FileExplorerTabs` API** (`FileExplorerTabsProps`) | `EditorFileTabs` passes `currentTab`, `tabData`, `setTabName`, `tabNames`, `drawerOpen`; any change to these props requires updating `sui-editor`. |
| **Package exports** (`src/index.ts`) | Removing or renaming any top-level export is a semver-breaking change; check all 50+ importing files. |
