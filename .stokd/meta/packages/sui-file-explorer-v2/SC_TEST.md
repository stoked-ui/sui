# SC_TEST: sui-file-explorer-v2 (`@stoked-ui/file-explorer-v2`)

## Package Overview

**Priority:** Medium
**Package path:** `packages/sui-file-explorer-v2`
**Entry point:** `src/index.ts`
**Lines of code:** ~550
**Existing test files:** 0
**Current coverage threshold:** None configured

The package is a file explorer component built on `@mui/x-tree-view` with optional drag-and-drop powered by `@atlaskit/pragmatic-drag-and-drop`. It has four functional layers:

1. **Pure tree operations** (`src/dnd/treeOps.ts`) — 8 recursive utility functions for tree manipulation
2. **V1/V2 adapters** (`src/adapters.ts`) — bidirectional conversion between v1 `FileBase` and v2 `FileItem`
3. **DnD system** (`src/dnd/`) — context, provider, and hook for drag-and-drop reordering
4. **React components** (`FileExplorerV2`, `CustomTreeItem`, icons, transitions)

---

## 1. Current Test Inventory

**None.** Zero test files exist. The `tsconfig.json` excludes `**/*.test.tsx` and `**/*.test.ts`, confirming the test file convention is established but no tests have been written.

---

## 2. Test Framework and Tooling

### Stack (matches monorepo convention from `sui-media`)

| Tool | Version | Purpose |
|------|---------|---------|
| **Jest** | `^29.7.0` | Test runner (per-package config) |
| **ts-jest** | `^29.1.2` | TypeScript transformation |
| **@testing-library/react** | `^14.1.2` | Component rendering and interaction |
| **@testing-library/jest-dom** | `^6.1.5` | Extended DOM matchers |
| **@testing-library/user-event** | `^14.5.1` | User interaction simulation |
| **identity-obj-proxy** | `^3.0.0` | CSS module mocking |

### Configuration to Create

**`packages/sui-file-explorer-v2/jest.config.js`:**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        module: 'commonjs',
        moduleResolution: 'node',
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterSetup: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist/'],
};
```

**`packages/sui-file-explorer-v2/package.json` additions:**

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/jest": "^29.5.11",
    "identity-obj-proxy": "^3.0.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.2"
  }
}
```

---

## 3. Test File Organization

```
packages/sui-file-explorer-v2/
└── src/
    ├── __tests__/
    │   ├── setup.ts                          # Global mocks (MUI, react-spring)
    │   ├── fixtures.ts                       # Shared test data (sample trees)
    │   ├── adapters.test.ts                  # Adapter function tests
    │   └── icons.test.tsx                    # Icon mapping tests
    ├── dnd/
    │   └── __tests__/
    │       ├── treeOps.test.ts               # Pure tree utility tests
    │       ├── DndProvider.test.tsx           # Provider + applyInstruction tests
    │       └── useTreeItemDnd.test.tsx        # DnD hook tests
    ├── FileExplorerV2.test.tsx                # Main component integration tests
    └── CustomTreeItem.test.tsx                # Tree item rendering tests
```

### Naming Conventions

- Unit tests: `<module>.test.ts` or `<Component>.test.tsx`
- Co-located with source in `__tests__/` directories
- Shared fixtures in `src/__tests__/fixtures.ts`
- Setup file at `src/__tests__/setup.ts`

---

## 4. What to Test — Critical Paths

### Priority 0 (Must have — blocks all DnD correctness)

**`src/dnd/treeOps.ts` — 8 pure functions, zero dependencies**

These are the foundation of all drag-and-drop operations. Every DnD move ultimately calls these functions. Pure functions with no React/DOM dependencies — the easiest and highest-value tests.

| Function | Lines | Risk | Test Priority |
|----------|-------|------|---------------|
| `findItem` | 4-13 | Data loss if wrong item found | P0 |
| `removeItem` | 16-22 | Data loss if wrong item removed | P0 |
| `insertBefore` | 25-38 | Item placed wrong position | P0 |
| `insertAfter` | 41-54 | Item placed wrong position | P0 |
| `insertChild` | 57-67 | Item placed wrong parent | P0 |
| `isDescendant` | 70-78 | Circular drops corrupt tree | P0 |
| `buildDepthMap` | 81-93 | Incorrect depth → DnD visual bugs | P1 |
| `findParentId` | 96-105 | Wrong parent → wrong reparent target | P0 |

### Priority 1 (Must have — adapter correctness)

**`src/adapters.ts` — bidirectional conversion**

Adapter bugs silently corrupt data when converting between v1 and v2. Pure functions, easy to test.

| Function | Risk | Test Priority |
|----------|------|---------------|
| `fileBaseToFileItem` | v1 data rendered wrong | P1 |
| `fileItemToFileBase` | v2 data exported wrong | P1 |
| `mediaTypeToFileType` (internal) | Wrong icon/behavior for file type | P1 |

### Priority 2 (Important — DnD orchestration)

**`src/dnd/DndProvider.tsx` — `applyInstruction` and `defaultCanMoveItem`**

The provider orchestrates DnD moves. `applyInstruction` calls treeOps functions with the right arguments. `defaultCanMoveItem` enforces that only folders/trash accept children.

| Concern | Risk | Test Priority |
|---------|------|---------------|
| `defaultCanMoveItem` logic | Files accept drops they shouldn't | P2 |
| `applyInstruction` with `reorder-above` | Item ends up in wrong position | P2 |
| `applyInstruction` with `reorder-below` | Item ends up in wrong position | P2 |
| `applyInstruction` with `make-child` | Item placed in wrong parent | P2 |
| `applyInstruction` with `reparent` | Item moved to wrong level | P2 |
| Circular reference guard | Tree corruption | P2 |
| Custom `canMoveItem` callback | Permission bypass | P2 |

### Priority 3 (Good to have — component rendering)

**`src/icons.tsx` — `getIconFromFileType`**

| Concern | Test Priority |
|---------|---------------|
| Maps all 7 FileType values to correct icons | P3 |
| Default fallback for unknown type | P3 |

**`src/FileExplorerV2.tsx` — main component**

| Concern | Test Priority |
|---------|---------------|
| Renders without crash | P3 |
| Passes items to RichTreeView | P3 |
| `enableDnd=false` renders without DndProvider | P3 |
| `enableDnd=true` wraps in DndProvider | P3 |
| `onItemsChange` fires on item state update | P3 |

**`src/CustomTreeItem.tsx` — tree item**

| Concern | Test Priority |
|---------|---------------|
| Renders label text | P3 |
| Shows correct icon for file type | P3 |
| DotIcon appears when expanded | P3 |

---

## 5. Edge Cases

### Tree Operations

- **Empty tree** — all operations on `[]` should return `[]` or `undefined`
- **Single item** — find, remove, insert operations on `[{id:'a', ...}]`
- **Deep nesting** (3+ levels) — operations on deeply nested items
- **Item not found** — `findItem` returns `undefined`, `removeItem` is no-op, `findParentId` returns `undefined`
- **Duplicate IDs** — behavior when two items share an ID (should find first match)
- **`insertBefore`/`insertAfter` at root level** — sibling insertion at top level
- **`insertChild` on leaf** — target has no children array yet; function creates `[newItem]`
- **`isDescendant` self-reference** — `isDescendant(items, 'a', 'a')` should be false (item is not a descendant of itself)
- **`findParentId` for root item** — returns `null`
- **`findParentId` for nonexistent item** — returns `undefined` (note: function returns `undefined as unknown as string | null` on line 104 — potential bug)

### Adapters

- **Unknown mediaType** — falls through to `'doc'` default
- **MIME subtypes** — `'image/png'`, `'video/mp4'` correctly detected via `startsWith`
- **Empty children** — `children: []` vs `children: undefined`
- **Round-trip fidelity** — `fileBaseToFileItem(fileItemToFileBase(item))` preserves data (with known mapping)

### DnD Provider

- **Drop onto self** — prevented by `useTreeItemDnd` canDrop check
- **Drop parent onto child** — circular reference prevented by `isDescendant` check
- **Drop onto non-container** — blocked by `defaultCanMoveItem` (only folder/trash accept)
- **Source item not found** — `applyInstruction` exits early
- **Unknown instruction type** — switch default returns without modifying tree

---

## 6. Mock/Stub Strategy

### External Dependencies to Mock

| Dependency | Mock Strategy | Reason |
|------------|---------------|--------|
| `@mui/x-tree-view` | Shallow mock of `RichTreeView` | Component tests don't need full MUI tree internals |
| `@mui/material` | `identity-obj-proxy` for styles; shallow mocks for Box, Typography | Avoid styled-components complexity |
| `@react-spring/web` | Mock `useSpring` → returns static style, mock `animated` → identity | Animation irrelevant to logic tests |
| `@atlaskit/pragmatic-drag-and-drop` | Mock `combine`, `draggable`, `dropTargetForElements` | DnD wiring is external; test our logic, not Atlaskit's |
| `@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item` | Mock `attachInstruction`, `extractInstruction` | Control instruction flow in tests |

### What NOT to Mock

- `src/dnd/treeOps.ts` — pure functions, always test with real implementation
- `src/adapters.ts` — pure functions, always test with real implementation
- `src/types.ts` — type-only, nothing to mock
- `React.useState`, `React.useEffect` — test via component rendering, not by mocking React internals

### Test Fixtures (`src/__tests__/fixtures.ts`)

```typescript
import type { FileItem } from '../types';
import type { FileBaseCompat } from '../adapters';

/** Flat tree (no nesting) */
export const flatItems: FileItem[] = [
  { id: '1', label: 'readme.md', fileType: 'doc' },
  { id: '2', label: 'photo.png', fileType: 'image' },
  { id: '3', label: 'report.pdf', fileType: 'pdf' },
];

/** Nested tree (3 levels deep) */
export const nestedItems: FileItem[] = [
  {
    id: 'root',
    label: 'Project',
    fileType: 'folder',
    children: [
      { id: 'doc1', label: 'notes.md', fileType: 'doc' },
      {
        id: 'images',
        label: 'Images',
        fileType: 'folder',
        children: [
          { id: 'img1', label: 'hero.png', fileType: 'image' },
          { id: 'img2', label: 'logo.svg', fileType: 'image' },
        ],
      },
      { id: 'vid1', label: 'demo.mp4', fileType: 'video' },
    ],
  },
  { id: 'trash', label: 'Trash', fileType: 'trash' },
];

/** V1-shaped data for adapter tests */
export const v1Items: FileBaseCompat[] = [
  {
    id: 'p1',
    name: 'My Project',
    mediaType: 'project',
    type: 'project',
    children: [
      { id: 'f1', name: 'photo.jpg', mediaType: 'image/jpeg', type: 'file' },
      { id: 'f2', name: 'clip.mp4', mediaType: 'video/mp4', type: 'file' },
      { id: 'f3', name: 'doc.pdf', mediaType: 'application/pdf', type: 'file' },
    ],
  },
];
```

---

## 7. Coverage Targets

Appropriate for **medium priority** with ~550 LOC and no existing tests:

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Lines** | 75% | Medium priority; pure logic files should hit 95%+, component files lower |
| **Branches** | 70% | Several switch/if branches in adapters and treeOps |
| **Functions** | 75% | All exported functions should be tested |
| **Statements** | 75% | Aligned with lines target |

### Per-File Coverage Goals

| File | Target | Notes |
|------|--------|-------|
| `dnd/treeOps.ts` | 95%+ | Pure functions, every branch testable |
| `adapters.ts` | 95%+ | Pure functions, every branch testable |
| `icons.tsx` | 90%+ | Simple mapping, all cases testable |
| `dnd/DndProvider.tsx` | 70% | `applyInstruction` logic testable; render/memo harder |
| `FileExplorerV2.tsx` | 60% | Thin wrapper; test rendering and DnD toggle |
| `CustomTreeItem.tsx` | 50% | Heavy MUI integration; test label/icon rendering |
| `dnd/useTreeItemDnd.ts` | 40% | Deeply coupled to Atlaskit APIs; mock-heavy |
| `dnd/DndContext.tsx` | 100% | 4 lines; covered by DndProvider tests |
| `transitions.tsx` | Skip | Animation-only; no logic to test |

---

## 8. Specific Test Cases to Implement First

### Phase 1 — Pure Logic (implement first, highest ROI)

#### `src/dnd/__tests__/treeOps.test.ts`

```
describe('findItem')
  ✓ finds root-level item by id
  ✓ finds deeply nested item by id
  ✓ returns undefined for nonexistent id
  ✓ returns undefined for empty array

describe('removeItem')
  ✓ removes root-level item
  ✓ removes nested item
  ✓ returns unchanged array when id not found
  ✓ returns empty array when removing only item
  ✓ preserves sibling order after removal

describe('insertBefore')
  ✓ inserts before root-level item
  ✓ inserts before nested item
  ✓ handles target as first item in array
  ✓ does not insert when targetId not found (no-op)

describe('insertAfter')
  ✓ inserts after root-level item
  ✓ inserts after nested item
  ✓ handles target as last item in array
  ✓ does not insert when targetId not found

describe('insertChild')
  ✓ inserts as first child of target
  ✓ creates children array when target has none
  ✓ preserves existing children when inserting
  ✓ inserts into nested target

describe('isDescendant')
  ✓ returns true for direct child
  ✓ returns true for deeply nested descendant
  ✓ returns false for non-descendant
  ✓ returns false when parent has no children
  ✓ returns false for same id (self-reference)

describe('buildDepthMap')
  ✓ assigns depth 0 to root items
  ✓ increments depth for nested items
  ✓ handles 3+ levels of nesting
  ✓ returns empty map for empty array

describe('findParentId')
  ✓ returns null for root-level item
  ✓ returns parent id for nested item
  ✓ returns correct id for deeply nested item
  ✓ returns undefined for nonexistent item
```

#### `src/__tests__/adapters.test.ts`

```
describe('fileBaseToFileItem')
  ✓ converts id and name→label
  ✓ maps mediaType "image" to fileType "image"
  ✓ maps mediaType "image/jpeg" to fileType "image"
  ✓ maps mediaType "video" to fileType "video"
  ✓ maps mediaType "video/mp4" to fileType "video"
  ✓ maps mediaType "application/pdf" to fileType "pdf"
  ✓ maps mediaType "project" to fileType "folder"
  ✓ maps mediaType "directory" to fileType "folder"
  ✓ maps unknown mediaType to fileType "doc"
  ✓ converts children recursively
  ✓ omits children when source has none
  ✓ omits children when source has empty array

describe('fileItemToFileBase')
  ✓ converts id and label→name
  ✓ maps fileType "image" to mediaType "image"
  ✓ maps fileType "video" to mediaType "video"
  ✓ maps fileType "pdf" to mediaType "application/pdf"
  ✓ maps fileType "folder" to mediaType "project"
  ✓ maps fileType "pinned" to mediaType "project"
  ✓ maps fileType "trash" to mediaType "project"
  ✓ maps fileType "doc" to mediaType "text/plain"
  ✓ converts children recursively
  ✓ omits children when source has none

describe('round-trip conversion')
  ✓ fileBaseToFileItem → fileItemToFileBase preserves structure
  ✓ fileItemToFileBase → fileBaseToFileItem preserves structure
```

### Phase 2 — DnD Provider Logic

#### `src/dnd/__tests__/DndProvider.test.tsx`

```
describe('defaultCanMoveItem')
  ✓ allows move to root (targetParentId === null)
  ✓ allows move into folder
  ✓ allows move into trash
  ✓ blocks move into image file
  ✓ blocks move into doc file
  ✓ blocks move when parent not found

describe('applyInstruction')
  ✓ reorder-above: places source before target
  ✓ reorder-below: places source after target
  ✓ make-child: places source as first child of target
  ✓ reparent: places source after target (at target's level)
  ✓ blocks circular move (source is ancestor of target)
  ✓ no-op when source item not found
  ✓ no-op for unknown instruction type
  ✓ respects custom canMoveItem callback
  ✓ calls onItemsChange with new tree after move
  ✓ clears draggedId and instructionMap after move
```

### Phase 3 — Component Rendering

#### `src/__tests__/icons.test.tsx`

```
describe('getIconFromFileType')
  ✓ returns ImageIcon for "image"
  ✓ returns PictureAsPdfIcon for "pdf"
  ✓ returns ArticleIcon for "doc"
  ✓ returns VideoCameraBackIcon for "video"
  ✓ returns FolderRounded for "folder"
  ✓ returns FolderOpenIcon for "pinned"
  ✓ returns DeleteIcon for "trash"
  ✓ returns ArticleIcon for unknown type (default)

describe('DotIcon')
  ✓ renders without error
```

#### `src/FileExplorerV2.test.tsx`

```
describe('FileExplorerV2')
  ✓ renders without crash
  ✓ renders item labels
  ✓ applies default sx styles
  ✓ merges custom sx with defaults
  ✓ does not wrap in DndProvider when enableDnd is false
  ✓ wraps in DndProvider when enableDnd is true
  ✓ syncs local state when items prop changes
  ✓ calls onItemsChange when items updated internally
  ✓ passes itemChildrenIndentation to RichTreeView
  ✓ passes defaultExpandedItems to RichTreeView
  ✓ passes defaultSelectedItems to RichTreeView
```

---

## 9. Integration Points

### With `@stoked-ui/file-explorer` (v1)

The `adapters.ts` module is the integration point. Test that:
- V1 data converted to V2 renders correctly in `FileExplorerV2`
- V2 data converted back to V1 shape matches expected structure

### With `@mui/x-tree-view`

- `FileExplorerV2` passes `items` in the shape `RichTreeView` expects
- `CustomTreeItem` integrates with `useTreeItem2` hook
- Item `publicAPI.getItem()` returns `ExtendedTreeItemProps` with `fileType`

### With `@atlaskit/pragmatic-drag-and-drop`

- `useTreeItemDnd` registers `draggable` and `dropTargetForElements` correctly
- Instructions extracted from drop events trigger correct tree operations
- Context isolation: drops from different tree instances are rejected

---

## 10. Setup File

### `src/__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom';

// Mock window.matchMedia (required by MUI)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver (required by MUI TreeView)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock @react-spring/web (avoid animation complexity in tests)
jest.mock('@react-spring/web', () => ({
  useSpring: () => ({ opacity: 1, transform: 'translate3d(0,0,0)' }),
  animated: new Proxy({}, {
    get: (_target, prop) => {
      if (typeof prop === 'string') {
        return (props: Record<string, unknown>) => props;
      }
      return undefined;
    },
  }),
}));
```

---

## 11. Known Issues / Bugs to Verify

### `findParentId` return type inconsistency (`src/dnd/treeOps.ts:104`)

```typescript
return undefined as unknown as string | null;
```

The function signature says it returns `string | null`, but the "not found" case returns `undefined` cast to `string | null`. This is a type lie. Tests should verify:
- **Root item returns `null`** (correct per JSDoc)
- **Missing item returns `undefined`** (actual behavior, contradicts type)

Consider filing a bug: `findParentId` should return `string | null | undefined` or throw for missing items.

### `insertBefore` includes target even when no insertion needed

When `targetId` is not found anywhere in the tree, `insertBefore` and `insertAfter` still iterate and rebuild the array (no short-circuit). This is correct behavior (no-op) but wasteful. Not a bug, but worth noting in tests.

---

## 12. Implementation Sequence

| Phase | Scope | Files | Estimated Tests | Effort |
|-------|-------|-------|-----------------|--------|
| **1** | Pure logic | `treeOps.test.ts`, `adapters.test.ts` | ~55 | Low |
| **2** | DnD logic | `DndProvider.test.tsx` | ~16 | Medium |
| **3** | Components | `icons.test.tsx`, `FileExplorerV2.test.tsx` | ~20 | Medium |
| **4** | Complex UI | `CustomTreeItem.test.tsx`, `useTreeItemDnd.test.tsx` | ~10 | High |

**Recommended order:** Phase 1 first — it covers the most critical paths with the least mocking complexity and provides the highest confidence-per-effort ratio. Phase 2 requires rendering a provider with mock children. Phases 3-4 require full MUI mock setup.

Total estimated tests: ~100
