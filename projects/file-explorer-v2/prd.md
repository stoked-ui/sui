# Product Requirements Document: Build File Explorer V2 with MUI X Tree View

| Field       | Value                                             |
|-------------|---------------------------------------------------|
| **Title**   | Build File Explorer V2 with MUI X Tree View       |
| **Slug**    | `file-explorer-v2`                                |
| **Created** | 2026-03-03                                        |
| **Package** | `@stoked-ui/file-explorer-v2`                     |
| **Author**  | Brian Stoker                                      |
| **Status**  | Draft                                             |

---

## 1. Problem Statement

The current `@stoked-ui/file-explorer` package (v0.1.2) is approximately 19,200 lines of TypeScript across 9 custom plugins (`useFileExplorerDnd`, `useFileExplorerExpansion`, `useFileExplorerFiles`, `useFileExplorerFocus`, `useFileExplorerGrid`, `useFileExplorerIcons`, `useFileExplorerJSXItems`, `useFileExplorerKeyboardNavigation`, `useFileExplorerSelection`), a custom plugin architecture, `@atlaskit/pragmatic-drag-and-drop` integration, and significant wrapper logic around `@mui/x-tree-view`.

Since v1 was built, MUI X Tree View has matured significantly. Specifically:

- **`@mui/x-tree-view` v7.22.2** now provides `RichTreeView` with `useTreeItem`, `TreeItemProvider`, composable sub-components (`TreeItemContent`, `TreeItemLabel`, `TreeItemIconContainer`, `TreeItemCheckbox`, `TreeItemDragAndDropOverlay`), and animated group transitions -- all of which v1 reimplemented from scratch.
- **`@mui/x-tree-view-pro`** now provides `RichTreeViewPro` with native `itemsReordering` and `canMoveItemToNewPosition` -- the exact drag-and-drop ordering that motivated building v1's custom DnD system with `@atlaskit`.

The v1 package carries substantial maintenance burden with diminishing returns. A new package built directly on MUI X's native capabilities can deliver the same user-facing functionality in a fraction of the code, with better alignment to MUI's upgrade path.

---

## 2. Goals

1. **Simple, maintainable codebase.** Target under 500 lines of source (excluding tests), compared to v1's ~19,200. Achieve this by delegating to MUI X rather than wrapping it.
2. **Native MUI X Tree View integration.** Use `RichTreeView` and `useTreeItem` directly, with no custom plugin system.
3. **Drag-and-drop via MUI X Pro.** Use `RichTreeViewPro` with `itemsReordering` and `canMoveItemToNewPosition` for native DnD ordering. No `@atlaskit` dependency.
4. **Animated transitions via react-spring.** Use `@react-spring/web` (already at `^9.7.3` in the monorepo) for smooth collapse/expand animations.
5. **Compatible type system.** Define types (`FileType`, `ExtendedTreeItemProps`, `FileItem`) that can be mapped to/from the existing `FileBase` type used by `@stoked-ui/editor`, enabling eventual drop-in replacement.
6. **Follow monorepo patterns.** Package structure, build scripts, babel aliases, turbo pipeline registration, and publishConfig must match the existing `sui-common`/`sui-media` conventions exactly.

---

## 3. Non-Goals

- **NOT migrating v1.** This is a new, parallel package. `@stoked-ui/file-explorer` remains untouched.
- **NOT replacing v1 in `@stoked-ui/editor` immediately.** The `EditorFileTabs` component currently imports `FileExplorerTabs`, `FileBase`, and `ExplorerPanelProps` from v1. Swapping that dependency is a separate future decision.
- **NOT implementing grid view, tabs, or multi-panel layouts.** v1's `FileExplorerTabs`, `FileExplorerGrid`, and `ExplorerPanelProps` are out of scope. v2 is a single tree view component.
- **NOT implementing keyboard navigation or selection plugins.** MUI X Tree View handles these natively.
- **NOT supporting `@stoked-ui/media` `MediaType` directly.** v2 uses its own `FileType` union. An adapter maps between the two systems.

---

## 4. Technical Specifications

### 4.1 Package Identity

| Property            | Value                                  |
|---------------------|----------------------------------------|
| npm name            | `@stoked-ui/file-explorer-v2`         |
| Directory           | `packages/sui-file-explorer-v2`        |
| Entry point         | `src/index.ts`                         |
| publishConfig       | `{ "access": "public", "directory": "build" }` |

### 4.2 Dependencies

**Runtime dependencies:**

| Package                    | Version       | Purpose                         |
|----------------------------|---------------|---------------------------------|
| `@mui/x-tree-view`        | `^7.22.2`    | RichTreeView, useTreeItem, composable tree item sub-components |
| `@mui/x-tree-view-pro`    | `^7.22.2`    | RichTreeViewPro, itemsReordering, useRichTreeViewProApiRef |
| `@react-spring/web`       | `^9.7.3`     | Animated collapse transitions   |
| `@babel/runtime`          | `^7.24.7`    | Babel helpers                   |

**Peer dependencies:**

| Package                    | Version       |
|----------------------------|---------------|
| `react`                   | `18.3.1`     |
| `react-dom`               | `^17.0.0 \|\| ^18.0.0` |
| `@emotion/react`          | `^11.9.0`    |
| `@emotion/styled`         | `^11.8.1`    |
| `@mui/material`           | `^5.15.21`   |
| `@mui/icons-material`     | `^5.15.21`   |

### 4.3 Build System

Identical to `sui-common` and `sui-media`:

```json
{
  "build": "pnpm build:modern && pnpm build:node && pnpm build:stable && pnpm build:types && pnpm build:copy-files",
  "build:modern": "node ../../scripts/build.mjs modern",
  "build:node": "node ../../scripts/build.mjs node",
  "build:stable": "node ../../scripts/build.mjs stable",
  "build:copy-files": "node ../../scripts/copyFiles.mjs",
  "build:types": "node ../../scripts/buildTypes.mjs",
  "prebuild": "rimraf build tsconfig.build.tsbuildinfo"
}
```

### 4.4 TypeScript Configuration

`tsconfig.json` extends `../../tsconfig.x.json`:

```json
{
  "extends": "../../tsconfig.x.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noImplicitAny": false,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.tsx", "**/*.test.ts"]
}
```

`tsconfig.build.json` for declaration emit:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "noEmit": false,
    "emitDeclarationOnly": true,
    "outDir": "build",
    "rootDir": "./src",
    "types": ["node", "@mui/material/themeCssVarsAugmentation", "@emotion/styled"]
  },
  "include": ["src/**/*.ts*"],
  "exclude": ["src/**/*.spec.ts*", "src/**/*.test.ts*", "src/tests/**/*", "build/**/*"]
}
```

### 4.5 Monorepo Registration

- **babel.config.js**: Add alias `'@stoked-ui/file-explorer-v2': resolveAliasPath('./packages/sui-file-explorer-v2')`
- **turbo.json**: No changes needed (turbo auto-discovers packages via pnpm workspace)
- **pnpm-workspace.yaml**: Ensure `packages/sui-file-explorer-v2` is covered by the existing `packages/*` glob

### 4.6 Source File Layout

```
packages/sui-file-explorer-v2/
  src/
    index.ts                    # Barrel exports
    FileExplorerV2.tsx          # Base component (RichTreeView + CustomTreeItem)
    FileExplorerV2Pro.tsx       # DnD component (RichTreeViewPro + itemsReordering)
    CustomTreeItem.tsx          # Shared CustomTreeItem with styled sub-components
    types.ts                    # FileType, ExtendedTreeItemProps, FileItem, component props
    icons.ts                    # getIconFromFileType mapping
    transitions.ts              # TransitionComponent (react-spring animated collapse)
    adapters.ts                 # v1 FileBase <-> v2 FileItem conversion utilities
  package.json
  tsconfig.json
  tsconfig.build.json
```

---

## 5. Phases & Work Items

### Phase 1: Package Setup & Foundation

#### Work Item 1.1: Initialize Package Structure

**Description:** Create the `packages/sui-file-explorer-v2` directory with `package.json`, `tsconfig.json`, `tsconfig.build.json`, and an empty `src/index.ts`. Register the package in the monorepo's babel alias map. Install `@mui/x-tree-view-pro` as a dependency.

**Implementation Details:**

- Create `package.json` following the `sui-common` pattern: same `scripts` block, `publishConfig`, `sideEffects: false`, `engines`, `repository` structure.
- Add `@mui/x-tree-view-pro` to `dependencies` (it is NOT currently installed in the monorepo).
- Add `@mui/x-tree-view` to `dependencies` (carried over from v1's usage).
- Add `@react-spring/web` to `dependencies`.
- Add the babel alias entry in `babel.config.js` for `@stoked-ui/file-explorer-v2`.
- Run `pnpm install` to resolve the new workspace package and its dependencies.

**Acceptance Criteria:**

- **AC-1.1.a:** `pnpm install` completes without errors from the monorepo root, and `node_modules/@stoked-ui/file-explorer-v2` resolves to the workspace package (symlink points to `packages/sui-file-explorer-v2`).
- **AC-1.1.b:** Running `pnpm --filter @stoked-ui/file-explorer-v2 build` executes all five build stages (`build:modern`, `build:node`, `build:stable`, `build:types`, `build:copy-files`) and exits 0, producing a `build/` directory containing at least `modern/index.js`, `node/index.js`, and `index.d.ts`.
- **AC-1.1.c:** The babel alias in `babel.config.js` resolves correctly: importing `@stoked-ui/file-explorer-v2` from another package in dev mode (pre-build) resolves to `packages/sui-file-explorer-v2/src/index.ts`, not to `build/` or `node_modules/`.

**Acceptance Tests:**

- **Test-1.1.a:** From the monorepo root, run `pnpm ls @stoked-ui/file-explorer-v2 --depth 0` and confirm the package is listed as a workspace dependency. Run `ls -la node_modules/@stoked-ui/file-explorer-v2` and confirm it is a symlink to `../../packages/sui-file-explorer-v2`.
- **Test-1.1.b:** Run `pnpm --filter @stoked-ui/file-explorer-v2 build` and assert exit code 0. Assert `packages/sui-file-explorer-v2/build/modern/index.js` exists and is non-empty. Assert `packages/sui-file-explorer-v2/build/index.d.ts` exists.
- **Test-1.1.c:** Create a temporary test file in `packages/sui-common/src/` that contains `import {} from '@stoked-ui/file-explorer-v2'`. Run `pnpm --filter @stoked-ui/common typescript` and confirm it resolves without "Cannot find module" errors. Remove the test file after verification.

---

#### Work Item 1.2: Implement Base FileExplorerV2 Component

**Description:** Build the core `FileExplorerV2` component using `RichTreeView` with a `CustomTreeItem` that includes styled tree items, file type icons, and animated collapse transitions via `@react-spring/web`. This corresponds to the MUI X "File Explorer" customization example.

**Implementation Details:**

- **`types.ts`**: Define `FileType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'pinned' | 'trash'`. Define `ExtendedTreeItemProps = { fileType?: FileType; id: string; label: string }`. Define `FileExplorerV2Props` extending relevant `RichTreeView` props with `items: TreeViewBaseItem<ExtendedTreeItemProps>[]`.
- **`icons.ts`**: Implement `getIconFromFileType(fileType: FileType): React.ElementType` mapping to `ImageIcon`, `PictureAsPdfIcon`, `ArticleIcon`, `VideoCameraBackIcon`, `FolderRounded`, `FolderOpenIcon`, `DeleteIcon`. Implement `DotIcon` component (6x6 warning-colored circle).
- **`transitions.ts`**: Implement `TransitionComponent` using `useSpring` from `@react-spring/web` wrapping a styled `Collapse` component via `animated()`. Animation: opacity 0->1 and translateY 20px->0 on expand.
- **`CustomTreeItem.tsx`**: Implement `CustomTreeItem` using `useTreeItem` hook, `TreeItemProvider`, `TreeItemRoot` (styled `li`), `TreeItemContent` (styled `div` with depth-aware padding via CSS custom properties), `TreeItemIconContainer`, `TreeItemIcon`, `TreeItemCheckbox`, `CustomLabel`, `TreeItemDragAndDropOverlay`, and `TransitionComponent` for group transitions. Expandable items show `FolderRounded`; leaf items use `getIconFromFileType`. Styling supports both light and dark themes via `theme.applyStyles('light', ...)`.
- **`FileExplorerV2.tsx`**: Render `RichTreeView` with `slots={{ item: CustomTreeItem }}`, `itemChildrenIndentation={24}`, and passthrough of `items`, `defaultExpandedItems`, `defaultSelectedItems`, `sx`, and other `RichTreeView` props.

**Acceptance Criteria:**

- **AC-1.2.a:** Rendering `<FileExplorerV2 items={ITEMS} defaultExpandedItems={['1','1.1']} />` with the sample data set produces a tree where "Documents > Company" is expanded, showing 5 child items, each displaying the correct icon for its `fileType` (e.g., "Invoice" shows the PDF icon, "Video conference" shows the video icon).
- **AC-1.2.b:** Clicking a collapsed folder item triggers the react-spring animation: the children container transitions from `opacity: 0, translateY: 20px` to `opacity: 1, translateY: 0`. The `TransitionComponent` receives `in: true` from MUI's collapse system and applies the spring style.
- **AC-1.2.c:** In dark theme, tree item text uses `grey[400]` and selected items use `primary.dark` background. In light theme, tree item text uses `grey[800]` and selected items use `primary.main` background. The expanded folder's vertical connector line uses `grey[700]` in dark and `grey[300]` in light.

**Acceptance Tests:**

- **Test-1.2.a:** Write a unit test that renders `FileExplorerV2` with the standard ITEMS array and asserts: (1) `screen.getByText('Invoice')` is in the document, (2) the element wrapping "Invoice" contains an SVG element (the PDF icon), (3) `screen.getByText('Personal')` is in the document and its parent tree item contains a folder icon SVG. Use `@testing-library/react`.
- **Test-1.2.b:** Write a test that renders with `defaultExpandedItems={[]}`, clicks on "Documents", and asserts that after click the "Company" text becomes visible in the DOM. This validates that expand/collapse transitions work and the `TransitionComponent` renders children when `in` is true.
- **Test-1.2.c:** Write a test that renders `FileExplorerV2` inside a `ThemeProvider` with `createTheme({ palette: { mode: 'dark' } })`. Query the tree item content element for "Documents" and assert its computed `color` style. Repeat with `mode: 'light'` and assert the color differs. (Note: exact color assertion depends on the styled component output; the test validates theme reactivity, not pixel values.)

---

#### Work Item 1.3: Export Barrel, Types, and API Surface

**Description:** Set up `src/index.ts` with named exports for all public components, types, and utilities. Ensure TypeScript declaration files are generated correctly.

**Implementation Details:**

- **`src/index.ts`**:
  ```typescript
  // Components
  export { FileExplorerV2 } from './FileExplorerV2';
  export { CustomTreeItem } from './CustomTreeItem';
  export { TransitionComponent } from './transitions';

  // Types
  export type {
    FileType,
    ExtendedTreeItemProps,
    FileExplorerV2Props,
  } from './types';

  // Utilities
  export { getIconFromFileType, DotIcon } from './icons';
  ```
- All exports are named (no default exports) to match monorepo convention.
- Running `build:types` must produce `.d.ts` files for every exported symbol.

**Acceptance Criteria:**

- **AC-1.3.a:** `import { FileExplorerV2, FileExplorerV2Props, FileType, ExtendedTreeItemProps, CustomTreeItem, getIconFromFileType, DotIcon, TransitionComponent } from '@stoked-ui/file-explorer-v2'` resolves all 8 symbols without TypeScript errors when used from another package in the monorepo.
- **AC-1.3.b:** The generated `build/index.d.ts` contains `export` declarations for `FileExplorerV2`, `FileType`, `ExtendedTreeItemProps`, `FileExplorerV2Props`, `CustomTreeItem`, `getIconFromFileType`, `DotIcon`, and `TransitionComponent`. No symbols are exported as `any`.
- **AC-1.3.c:** `FileExplorerV2Props` is typed such that passing `items={[{ id: '1', label: 'test', fileType: 'invalid' as any }]}` produces a TypeScript error on `fileType` when strict type checking is applied, because `'invalid'` is not in the `FileType` union.

**Acceptance Tests:**

- **Test-1.3.a:** After running `pnpm --filter @stoked-ui/file-explorer-v2 build`, create a temporary `.ts` file that imports all 8 symbols and assigns them to typed variables (e.g., `const ft: FileType = 'pdf'`). Run `tsc --noEmit` on that file. Assert exit code 0.
- **Test-1.3.b:** After build, run `grep -c 'export' packages/sui-file-explorer-v2/build/index.d.ts` and assert the count is >= 8. Run `grep 'any' packages/sui-file-explorer-v2/build/index.d.ts` and assert no matches on exported type declarations.
- **Test-1.3.c:** Create a temporary `.ts` file containing `import { FileExplorerV2Props } from '@stoked-ui/file-explorer-v2'; const bad: FileExplorerV2Props = { items: [{ id: '1', label: 'x', fileType: 'invalid' }] };`. Run `tsc --noEmit --strict`. Assert exit code is non-zero with an error mentioning `fileType`.

---

### Phase 2: Drag & Drop Integration

#### Work Item 2.1: Add RichTreeViewPro with itemsReordering

**Description:** Implement the `FileExplorerV2Pro` component using `RichTreeViewPro` from `@mui/x-tree-view-pro` with native `itemsReordering` and `canMoveItemToNewPosition` constraint logic. This component shares the same `CustomTreeItem` as the base but adds DnD ordering capabilities.

**Implementation Details:**

- **`FileExplorerV2Pro.tsx`**: Import `RichTreeViewPro` from `@mui/x-tree-view-pro/RichTreeViewPro` and `useRichTreeViewProApiRef` from `@mui/x-tree-view-pro/hooks`.
- Define `FileItem = { fileType: FileType; id: string; label: string; children?: FileItem[] }` (all items require `fileType`, unlike the base `ExtendedTreeItemProps` where it is optional).
- Define `FileExplorerV2ProProps` with `items: FileItem[]`, passthrough of `RichTreeViewPro` props, and optional `canMoveItemToNewPosition` override.
- Default `canMoveItemToNewPosition` logic: allow drops only when `newPosition.parentId === null` (root level) OR the target parent's `fileType` is `'folder'` or `'trash'`. Use `apiRef.current.getItem(parentId)` to look up the parent's type.
- The `CustomTreeItem` used here uses `useTreeItemModel<FileItem>` (not `ExtendedTreeItemProps`) so that `item.fileType` is always defined.
- Note: The Pro component does NOT use `TransitionComponent` for group transitions -- it uses `TreeItemGroupTransition` directly, matching the MUI X ordering example. This is because the react-spring animation can interfere with DnD visual feedback during reordering.
- Update `src/index.ts` to export `FileExplorerV2Pro`, `FileExplorerV2ProProps`, and `FileItem`.

**Acceptance Criteria:**

- **AC-2.1.a:** Rendering `<FileExplorerV2Pro items={ITEMS} itemsReordering />` allows dragging "Invoice" (a `pdf` item) from "Company" and dropping it into "Personal" (a `folder` item). After the drop, calling `apiRef.current.getItem('1.1.1')` confirms the item now has `parentId` pointing to "Personal"'s container, and the tree visually renders "Invoice" inside "Personal".
- **AC-2.1.b:** Attempting to drag "Meeting notes" (a `doc` item) and drop it directly onto "Invoice" (a `pdf` item) is rejected -- the `canMoveItemToNewPosition` callback returns `false` because `pdf` is not in `['folder', 'trash']`. The tree structure remains unchanged after the attempted drop.
- **AC-2.1.c:** Dragging an item to root level (outside all folders) is permitted. Dragging a folder into the "Trash" item (fileType `'trash'`) is permitted. Both operations complete without errors and the tree re-renders with the new structure.

**Acceptance Tests:**

- **Test-2.1.a:** Write an integration test that renders `FileExplorerV2Pro` with `itemsReordering` and the standard ITEMS data. Simulate a drag of "Invoice" onto "Personal" using the testing API. Assert that after the operation, querying the DOM shows "Invoice" is now a child node of the "Personal" subtree (e.g., the "Invoice" text element is nested inside the "Personal" tree item's group container).
- **Test-2.1.b:** Write a unit test for the default `canMoveItemToNewPosition` function in isolation. Call it with `{ newPosition: { parentId: 'some-pdf-id' } }` where the API ref returns `{ fileType: 'pdf' }` for that id. Assert it returns `false`. Call it with `{ newPosition: { parentId: 'some-folder-id' } }` where the API ref returns `{ fileType: 'folder' }`. Assert it returns `true`. Call it with `{ newPosition: { parentId: null } }`. Assert it returns `true`.
- **Test-2.1.c:** Write an integration test that renders `FileExplorerV2Pro` and attempts to drag "History" (a folder) into "Trash". Assert the operation succeeds: "History" now appears as a child of "Trash" in the rendered tree. Then attempt to drag "Forums" onto "Travel documents" (a `pdf`). Assert the tree structure is unchanged -- "Forums" remains inside "Bookmarked".

---

#### Work Item 2.2: Verify DnD Functionality and Edge Cases

**Description:** Systematic testing of drag-and-drop behavior to ensure tree structure integrity is preserved across all operations, including moves between nested folders, moves to root, and constraint enforcement.

**Implementation Details:**

- Write a test suite covering:
  - Moving items between sibling folders at the same depth.
  - Moving items from a deeply nested folder to a shallow folder.
  - Moving items to root level.
  - Moving folders (with children) into other folders -- children should follow.
  - Moving items into Trash.
  - Attempting invalid moves (onto leaf items of non-folder types).
  - Rapid sequential moves (move A then move B without waiting).
- Verify that `items` state updates correctly via controlled component pattern (parent manages `items` state and passes updated array after `onItemsChange`).
- Verify the component works in both uncontrolled (internal state) and controlled (external state) modes.

**Acceptance Criteria:**

- **AC-2.2.a:** Moving the "Company" folder (which contains 5 children) into "Bookmarked" results in "Bookmarked" having 5 children (its original 4 plus "Company"), and expanding "Company" within "Bookmarked" still shows all 5 original grandchildren. No items are lost or duplicated.
- **AC-2.2.b:** In controlled mode (parent passes `items` and handles `onItemsChange`), performing a drag-and-drop triggers `onItemsChange` with the updated items array. The parent's state update causes a re-render that reflects the new tree structure. The component does not maintain stale internal state.
- **AC-2.2.c:** After 5 sequential move operations (move item A to folder B, move item C to folder D, move folder B to root, move item A to Trash, move folder D into folder B), the final tree structure is internally consistent: no orphaned items, no circular references, and the total item count matches the original.

**Acceptance Tests:**

- **Test-2.2.a:** Render `FileExplorerV2Pro` with standard ITEMS. Simulate dragging "Company" onto "Bookmarked". After the move, count all visible tree items by querying all `[role="treeitem"]` elements. Assert the count equals the original total (all items preserved, none duplicated). Expand "Bookmarked > Company" and assert all 5 children ("Invoice", "Meeting notes", "Tasks list", "Equipment", "Video conference") are present.
- **Test-2.2.b:** Render `FileExplorerV2Pro` in controlled mode with `items` and `onItemsChange` props. Perform a drag operation. Assert `onItemsChange` was called exactly once. Assert the argument is a new array (not mutated original). Assert the moved item appears in its new position in the returned array.
- **Test-2.2.c:** Render `FileExplorerV2Pro` and perform 5 sequential move operations as described in AC-2.2.c. After all operations, flatten the tree and assert: (1) total unique item count matches original, (2) no item `id` appears more than once, (3) every item is reachable from a root-level node.

---

### Phase 3: API Compatibility & Integration

#### Work Item 3.1: Define FileBase-Compatible Data Model and Adapter

**Description:** Create adapter utilities that convert between v1's `FileBase` type (used by `@stoked-ui/editor`) and v2's `FileItem`/`ExtendedTreeItemProps` types. This enables `@stoked-ui/editor` to eventually consume v2 without rewriting its data layer.

**Implementation Details:**

- **`adapters.ts`**: Implement two functions:
  1. `fileBaseToFileItem(item: FileBase): FileItem` -- Maps `FileBase` fields to `FileItem`. The `FileBase.mediaType` field (which uses `@stoked-ui/media`'s `MediaType`) maps to v2's `FileType` via a lookup: `'image' -> 'image'`, `'video' -> 'video'`, `'application/pdf' -> 'pdf'`, `'project' -> 'folder'`, etc. Unknown types default to `'doc'`. The `FileBase.name` maps to `FileItem.label`. The `FileBase.id` maps to `FileItem.id`. `FileBase.children` are recursively converted.
  2. `fileItemToFileBase(item: FileItem): FileBase` -- Reverse mapping. `FileItem.label` maps to `FileBase.name`. `FileItem.fileType` maps back to `FileBase.mediaType`. `FileItem.id` maps to `FileBase.id`.
- The `v1 FileBase` type is defined in `@stoked-ui/file-explorer` at `src/models/items.ts`. v2 should NOT depend on v1. Instead, define a minimal `FileBaseCompat` interface in `adapters.ts` that mirrors the relevant fields (`id`, `name`, `mediaType`, `children`, `size`, `lastModified`, `type`, `path`). Document that this interface must stay in sync with v1's `FileBase`.
- Export adapter functions and `FileBaseCompat` from `index.ts`.

**Acceptance Criteria:**

- **AC-3.1.a:** `fileBaseToFileItem({ id: '1', name: 'Invoice', mediaType: 'application/pdf', type: 'pdf', children: [] })` returns `{ id: '1', label: 'Invoice', fileType: 'pdf', children: [] }`. The returned object passes TypeScript type checking as a `FileItem`.
- **AC-3.1.b:** Round-tripping is lossless for the shared fields: given a `FileBase` input, `fileItemToFileBase(fileBaseToFileItem(input))` produces an object where `id`, `name`, and `mediaType` match the original input. Fields not present in `FileItem` (like `size`, `lastModified`, `path`) are preserved as `undefined` in the output (they are optional on `FileBase`).
- **AC-3.1.c:** `fileBaseToFileItem` correctly handles nested structures: a `FileBase` with 3 levels of `children` nesting produces a `FileItem` with 3 levels of `children` nesting, with all `name` -> `label` and `mediaType` -> `fileType` mappings applied at every level.

**Acceptance Tests:**

- **Test-3.1.a:** Unit test: call `fileBaseToFileItem` with a flat (no children) `FileBase` object for each known `mediaType` value. Assert each returns the correct `fileType`. Test at least: `'image'` -> `'image'`, `'video'` -> `'video'`, `'application/pdf'` -> `'pdf'`, `'project'` -> `'folder'`, `'text/plain'` -> `'doc'`. Assert the return type satisfies `FileItem` (TypeScript compilation is the test).
- **Test-3.1.b:** Unit test: create a `FileBase` tree with structure `Root (folder) > Child1 (pdf) > Grandchild (image)`. Call `fileBaseToFileItem`. Assert the result has `.children[0].children[0].fileType === 'image'` and `.children[0].children[0].label` matches the grandchild's `name`. Then call `fileItemToFileBase` on the result and assert `name` and `mediaType` match the original at all 3 levels.
- **Test-3.1.c:** Unit test: call `fileBaseToFileItem` with a `FileBase` that has `size: 1024`, `lastModified: 1234567890`, and `path: '/docs/invoice.pdf'`. Assert the returned `FileItem` does not have these properties (they are not part of `FileItem`). Then call `fileItemToFileBase` on the result and assert `size`, `lastModified`, and `path` are `undefined` (documenting that these fields are lost in the round-trip, which is expected and acceptable).

---

#### Work Item 3.2: Build Verification and Monorepo Integration

**Description:** Verify the complete package builds correctly within the turbo pipeline, can be imported from other monorepo packages, and produces valid TypeScript declarations that pass type checking across the dependency graph.

**Implementation Details:**

- Run full turbo build from monorepo root and verify `@stoked-ui/file-explorer-v2` is included in the build graph.
- Create a minimal integration test: import `FileExplorerV2` from the built package in a test file within `sui-common` (or a dedicated test package) and verify it renders without runtime errors.
- Run `tsc --noEmit` across the monorepo to verify no type errors are introduced by the new package.
- Verify the package can be published (dry-run): `pnpm --filter @stoked-ui/file-explorer-v2 pack` produces a valid tarball with the expected file structure under `build/`.

**Acceptance Criteria:**

- **AC-3.2.a:** Running `pnpm turbo run build --filter=@stoked-ui/file-explorer-v2` completes with exit code 0 and the turbo output shows all 5 build stages completed. The `build/` directory contains `modern/`, `node/`, and declaration files (`.d.ts`).
- **AC-3.2.b:** A test file in another monorepo package that does `import { FileExplorerV2, FileExplorerV2Pro, fileBaseToFileItem, fileItemToFileBase, FileType, FileItem } from '@stoked-ui/file-explorer-v2'` compiles without errors under `tsc --noEmit` and, when rendered in a React test environment, produces DOM output containing `role="tree"`.
- **AC-3.2.c:** Running `pnpm --filter @stoked-ui/file-explorer-v2 pack` produces a `.tgz` file. Extracting it shows a `package/` directory containing `package.json` (with correct `name`, `version`, `main`, `types` fields), `modern/index.js`, `node/index.js`, and `index.d.ts`.

**Acceptance Tests:**

- **Test-3.2.a:** Run `pnpm turbo run build --filter=@stoked-ui/file-explorer-v2` and assert exit code 0. Assert `packages/sui-file-explorer-v2/build/modern/index.js` exists and contains the string `RichTreeView` (proving the component code was compiled). Assert `packages/sui-file-explorer-v2/build/index.d.ts` exists and contains `FileExplorerV2`.
- **Test-3.2.b:** Create a test file that imports `FileExplorerV2` and renders it with `@testing-library/react`'s `render()`. Assert `screen.getByRole('tree')` exists. Assert no console errors were logged during render. This validates the component is functional when consumed as a dependency.
- **Test-3.2.c:** Run `pnpm --filter @stoked-ui/file-explorer-v2 pack --pack-destination /tmp/`. Extract the resulting `.tgz`. Assert the extracted `package/package.json` has `"name": "@stoked-ui/file-explorer-v2"`. Assert `package/modern/index.js` is a valid JavaScript file (no syntax errors when parsed by Node.js). Assert `package/index.d.ts` is a valid TypeScript declaration file.

---

## 6. Data Model Reference

### v2 Types (new)

```typescript
type FileType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'pinned' | 'trash';

// For base RichTreeView (fileType optional for folders inferred by children)
type ExtendedTreeItemProps = {
  fileType?: FileType;
  id: string;
  label: string;
};

// For RichTreeViewPro with DnD (fileType required for canMoveItemToNewPosition)
type FileItem = {
  fileType: FileType;
  id: string;
  label: string;
  children?: FileItem[];
};
```

### v1 Types (existing, for reference)

```typescript
// From @stoked-ui/file-explorer/src/models/items.ts
type FileBase<R extends {} = {}> = {
  id: string;
  name: string;
  mediaType: MediaType;  // from @stoked-ui/media
  type: string;
  size?: number;
  lastModified?: number;
  url?: string;
  media?: any;
  created?: number;
  path?: string;
  expanded?: boolean;
  selected?: boolean;
  visibleIndex?: number;
  version?: number;
  children?: FileBase<R>[];
};
```

### Adapter Mapping

| v1 `FileBase` field | v2 `FileItem` field | Mapping                                         |
|---------------------|---------------------|-------------------------------------------------|
| `id`                | `id`                | Direct copy                                     |
| `name`              | `label`             | Direct copy                                     |
| `mediaType`         | `fileType`          | Lookup table (see AC-3.1.a)                     |
| `children`          | `children`          | Recursive conversion                            |
| `size`              | --                  | Not mapped (lost in conversion)                 |
| `lastModified`      | --                  | Not mapped                                      |
| `path`              | --                  | Not mapped                                      |
| `url`               | --                  | Not mapped                                      |
| `expanded`          | --                  | Handled by RichTreeView's `expandedItems` prop  |
| `selected`          | --                  | Handled by RichTreeView's `selectedItems` prop  |

---

## 7. Risk & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `@mui/x-tree-view-pro` requires a MUI X Pro license key at runtime | High | Blocks DnD usage | Verify license situation before Phase 2. If a license key is required, it must be configured via `LicenseInfo.setLicenseKey()`. This is an infrastructure concern, not a code concern. |
| MUI X Tree View API changes in future versions break v2 | Low | Moderate | Pin to `^7.22.2`. MUI X follows semver. Monitor changelogs during minor upgrades. |
| `canMoveItemToNewPosition` is insufficient for complex DnD rules | Low | Low | The default implementation is simple. The prop is exposed for consumer override. |
| react-spring animation interferes with DnD visual feedback | Medium | Low | `FileExplorerV2Pro` uses `TreeItemGroupTransition` (no react-spring) while `FileExplorerV2` uses `TransitionComponent` (with react-spring). Separate components avoid the conflict. |

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Total source lines (excluding tests) | < 500 |
| Number of custom plugins | 0 |
| External DnD library dependencies | 0 (no @atlaskit) |
| Build time (cold, single package) | < 30 seconds |
| Type-check errors introduced to monorepo | 0 |
| v1 API surface coverage (FileExplorerTabs, Grid, etc.) | 0% (intentionally out of scope) |

---

## 9. Open Questions

1. **MUI X Pro License:** Does the project have an active MUI X Pro license? `RichTreeViewPro` and `itemsReordering` require it. If not, Phase 2 is blocked until a license is obtained.
2. **`@stoked-ui/common` peer dependency:** Should v2 take a peer dependency on `@stoked-ui/common` (like v1 does)? Currently not needed since v2 has no common utility usage, but the adapter in Phase 3 may benefit from shared types.
3. **Publishing timeline:** When should v2 be published to npm? It can be workspace-only initially and published when stable.
can
