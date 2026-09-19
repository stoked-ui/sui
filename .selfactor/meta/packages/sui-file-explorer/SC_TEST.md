# SC_TEST: @stoked-ui/file-explorer

Testing strategy and implementation plan for the file-explorer package.

**Package:** `@stoked-ui/file-explorer` v0.1.2 (medium priority)
**Location:** `packages/sui-file-explorer/`
**Last updated:** 2026-03-03

---

## 1. Current State

### Existing Test Files (19 files)

| File | Lines | Coverage Scope | Status |
|------|------:|----------------|--------|
| `src/File/File.test.tsx` | 41 | Conformance only | BROKEN: imports from `@mui/x-file-list` |
| `src/FileExplorer/FileExplorer.test.tsx` | 20 | Conformance only | OK |
| `src/FileExplorerBasic/FileExplorerBasic.test.tsx` | 20 | Conformance only | OK |
| `src/FileDropzone/FileDropzone.test.tsx` | 20 | Conformance only | OK |
| `src/FileDropzone/FileDropzone.test.js` | ~20 | Conformance only | OK (JS variant) |
| `src/FileElement/FileElement.test.tsx` | 110 | Conformance + PropTypes | BROKEN: imports from `test/utils/tree-view/` |
| `src/useFile/useFile.test.tsx` | 175 | Role, click, focus | OK |
| `src/featureFlags/FeatureFlagConfig.test.ts` | 258 | Comprehensive | OK |
| `src/featureFlags/FeatureFlagContext.test.tsx` | 459 | Comprehensive | OK |
| `src/internals/plugins/useFileExplorerFiles/useFileExplorerFiles.test.tsx` | 186 | Items CRUD, disabled | OK |
| `src/internals/plugins/useFileExplorerExpansion/useFileExplorerExpansion.test.tsx` | 378 | Expand/collapse, API | OK |
| `src/internals/plugins/useFileExplorerSelection/useFileExplorerSelection.test.tsx` | 797 | Single/multi, range, checkbox | OK |
| `src/internals/plugins/useFileExplorerFocus/useFileExplorerFocus.test.tsx` | 244 | Focus, tabindex, API | OK |
| `src/internals/plugins/useFileExplorerKeyboardNavigation/useFileExplorerKeyboardNavigation.test.tsx` | 1,279 | Arrow keys, type-ahead | OK |
| `src/internals/plugins/useFileExplorerIcons/useFileExplorerIcons.test.tsx` | 195 | Slot precedence | OK |
| `src/internals/plugins/useFileExplorerGrid/useFileExplorerGrid.test.tsx` | 393 | Grid columns/headers | BROKEN: imports from `@mui/x-file-list` and `test/utils/file-list/` |
| `src/internals/plugins/useFileExplorerDnd/fileExportUtils.test.ts` | 258 | Export utils only | BROKEN: uses Jest (`@jest/globals`) instead of Mocha/Chai |
| `src/internals/useFileExplorer/useFileExplorer.test.tsx` | 63 | Role, portal | OK |
| `src/themeAugmentation/themeAugmentation.spec.ts` | 62 | Compilation check | OK |

### Critical Issues Found

#### 1. Broken Import Paths (3 test files non-functional)

**`src/File/File.test.tsx`** — Imports from `@mui/x-file-list` (old package name):
```
import {File, fileClasses as classes} from '@mui/x-file-list/File';
import {FileListContext} from '@mui/x-file-list/internals/FileListProvider/FileListContext';
```
Must be updated to `@stoked-ui/file-explorer`.

**`src/internals/plugins/useFileExplorerGrid/useFileExplorerGrid.test.tsx`** — Multiple broken imports:
```
import {UseFileExplorerExpansionSignature} from '@mui/x-file-list/internals';
import {File, FileProps} from '@mui/x-file-list/File';
import {UseFileContentSlotOwnProps} from '@mui/x-file-list/useFile';
import {useFileUtils} from '@mui/x-file-list/hooks';
```
Also uses wrong test util path: `test/utils/file-list/describeFileExplorer`

**`src/FileElement/FileElement.test.tsx`** — Uses obsolete test util paths:
```
import {describeFileExplorer} from 'test/utils/tree-view/describeFileExplorer';
import {getFakeContextValue} from 'test/utils/tree-view/fakeContextValue';
```

#### 2. Framework Mismatch (1 test file)

**`src/internals/plugins/useFileExplorerDnd/fileExportUtils.test.ts`** — Uses Jest assertions (`@jest/globals`) while the monorepo uses Mocha + Chai. This file will not run under the standard Mocha test runner.

#### 3. Inconsistent `describeFileExplorer` Import Paths

Four different import paths are used across test files:
- `test/utils/fileExplorer-view/describeFileExplorer` — **7 files** (canonical path)
- `test/utils/fileExplorer/describeFileExplorer` — **1 file** (`useFileExplorerFiles.test.tsx`)
- `test/utils/file-list/describeFileExplorer` — **1 file** (`useFileExplorerGrid.test.tsx`)
- `test/utils/tree-view/describeFileExplorer` — **1 file** (`FileElement.test.tsx`)

Only the first is valid. The other three reference non-existent paths.

### Framework & Tooling

| Component | Tool |
|-----------|------|
| **Runner** | Mocha (via monorepo root `.mocharc.js`) |
| **Assertions** | Chai (`expect` + chai-dom) |
| **Mocking** | Sinon (spies, stubs, fakes) |
| **Rendering** | `@stoked-ui/internal-test-utils` wrapping `@testing-library/react` |
| **Coverage** | NYC/Istanbul (`nyc --reporter=text`) |
| **Conformance** | `describeConformance` / `describeSlotsConformance` from `test/utils/` |
| **Plugin tests** | `describeFileExplorer` helper providing `render`, `getItemContent`, `apiRef`, etc. |
| **Timeout** | 2s local / 5s CI |
| **DOM** | JSDOM (via `@stoked-ui/internal-test-utils/setupJSDOM`) |

---

## 2. Gap Analysis

### Well-Covered

- Selection plugin: single/multi, range, checkbox, Ctrl/Shift/Meta modifiers, disabled items, controlled/uncontrolled
- Expansion plugin: toggle, controlled/uncontrolled, API methods, callbacks
- Focus plugin: tabindex management, focus tracking, API methods
- Keyboard navigation: ArrowUp/Down/Left/Right, Home/End, Enter/Space, type-ahead
- Icons plugin: slot precedence (expand/collapse/end/item icon)
- Feature flags: configuration, context, runtime updates, persistence, dependencies, emergency disable
- Component conformance: `FileExplorer`, `FileExplorerBasic`, `FileDropzone` (classes, refs, slots)

### Gaps (Priority Order)

| # | Gap | Risk | Affected Files | Notes |
|---|-----|------|----------------|-------|
| 1 | **Fix broken tests (3 files)** | Critical | `File.test.tsx`, `useFileExplorerGrid.test.tsx`, `FileElement.test.tsx` | Non-functional due to wrong imports |
| 2 | **Fix framework mismatch** | Critical | `fileExportUtils.test.ts` | Uses Jest instead of Mocha/Chai |
| 3 | **File validation** — zero tests | High | `fileValidation.ts` (250 lines, security-critical) | Validates MIME types, extensions, sizes |
| 4 | **DnD interactions** — no behavior tests | High | `useFileExplorerDnd.tsx`, `FileExplorerDndContext.ts` | Core feature, only `fileExportUtils` tested |
| 5 | **DnD state reducer** — untested | High | `FileExplorerDndContext.ts` (`fileListStateReducer`) | Drives all DnD state transitions |
| 6 | **FileExplorerTabs** — zero tests | Medium | `FileExplorerTabs.tsx` | Entire component variant untested |
| 7 | **EventManager** — zero tests | Medium | `EventManager.ts` | Pub/sub infrastructure used by plugins |
| 8 | **useFileUtils hook** — zero tests | Medium | `useFileUtils.tsx` in `hooks/` | Public API hook |
| 9 | **FileExplorerProvider** — no direct tests | Medium | `FileExplorerProvider.tsx` | Context wiring only tested indirectly |
| 10 | **FileExplorer component** — conformance only | Medium | `FileExplorer.test.tsx` (20 lines) | No rendering/behavior tests |
| 11 | **Accessibility** — incomplete | Low | All components | Limited to ARIA attribute spot-checks |
| 12 | **Edge cases** — large trees, empty states | Low | Various | No stress/boundary testing |

---

## 3. Testing Strategy

### 3.1 Framework (No Changes)

Continue with Mocha + Chai + Sinon + `@stoked-ui/internal-test-utils`. All new tests must use this stack — **no Jest imports**.

### 3.2 File Organization

Co-located pattern (already in use):

```
src/
  ComponentName/
    ComponentName.tsx
    ComponentName.test.tsx          # component + behavior tests
  internals/
    plugins/
      usePluginName/
        usePluginName.tsx
        usePluginName.test.tsx      # plugin-specific tests
    utils/
      utilName.ts
      utilName.test.ts              # pure function tests
  featureFlags/
    FeatureFlagConfig.ts
    FeatureFlagConfig.test.ts       # pure function tests
    FeatureFlagContext.tsx
    FeatureFlagContext.test.tsx      # hook/provider tests
```

**Naming:** `{SourceFileName}.test.{ts,tsx}` for unit/integration. `{SourceFileName}.spec.ts` for type-only checks.

### 3.3 Import Conventions

All test files must use these canonical import paths:

```typescript
// Test utilities
import { describeFileExplorer } from 'test/utils/fileExplorer-view/describeFileExplorer';
import { describeConformance } from 'test/utils/describeConformance';
import { describeSlotsConformance } from 'test/utils/describeSlotsConformance';
import { getFakeContextValue } from 'test/utils/fileExplorer-view/fakeContextValue';

// Assertions & mocking
import { expect } from 'chai';
import { spy, stub } from 'sinon';
import { act, fireEvent, createRenderer } from '@stoked-ui/internal-test-utils';

// Package exports
import { ... } from '@stoked-ui/file-explorer';
import { ... } from '@stoked-ui/file-explorer/internals';
import { ... } from '@stoked-ui/file-explorer/File';
```

**Never use:** `@jest/globals`, `@mui/x-file-list`, `test/utils/tree-view/`, `test/utils/file-list/`.

### 3.4 Mock/Stub Strategy

| Dependency | Strategy |
|-----------|----------|
| `@atlaskit/pragmatic-drag-and-drop` | Stub `draggable`, `dropTargetForElements`, `monitorForElements` via sinon; simulate drag events with `fireEvent.dragStart/drop` |
| `@stoked-ui/media` (`MediaFile`, `MediaType`) | Import real types; mock `MediaFile` constructor only if instantiation needed |
| `@mui/x-tree-view` | Already integrated; test via rendered output |
| `localStorage` | Stub via `Object.defineProperty(window, 'localStorage', ...)` (pattern from `FeatureFlagContext.test.tsx`) |
| `URL.createObjectURL` / `URL.revokeObjectURL` | Stub globally in beforeEach; return deterministic `'blob:test'` strings |
| `document.createElement('a')` | Stub for download trigger tests |
| DOM drag events | Use `fireEvent.dragStart`, `fireEvent.dragOver`, `fireEvent.drop`; create `DataTransfer` mocks |

### 3.5 Coverage Targets

For **medium priority** package:

| Metric | Target | Current (estimated) |
|--------|--------|-------------------|
| Line coverage | 70% | ~45% |
| Branch coverage | 60% | ~35% |
| Function coverage | 75% | ~50% |
| Critical paths (validation, DnD state, selection) | 90% | ~70% (selection high, validation/DnD zero) |

---

## 4. Test Cases to Implement (Ordered by Priority)

### P0 — Fix Broken Tests (Implement First)

#### 4.1 Fix `File.test.tsx` imports

**File:** `src/File/File.test.tsx`

Replace:
```typescript
import {File, fileClasses as classes} from '@mui/x-file-list/File';
import {FileListContext} from '@mui/x-file-list/internals/FileListProvider/FileListContext';
```
With:
```typescript
import {File, fileClasses as classes} from '@stoked-ui/file-explorer/File';
import {FileExplorerContext} from '@stoked-ui/file-explorer/internals/FileExplorerProvider/FileExplorerContext';
```
Also update `getFakeContextValue` import from `test/utils/file-list/` to `test/utils/fileExplorer-view/`.

#### 4.2 Fix `useFileExplorerGrid.test.tsx` imports

**File:** `src/internals/plugins/useFileExplorerGrid/useFileExplorerGrid.test.tsx`

Replace all `@mui/x-file-list` imports with `@stoked-ui/file-explorer`.
Replace `test/utils/file-list/describeFileExplorer` with `test/utils/fileExplorer-view/describeFileExplorer`.

#### 4.3 Fix `FileElement.test.tsx` imports

**File:** `src/FileElement/FileElement.test.tsx`

Replace `test/utils/tree-view/` imports with `test/utils/fileExplorer-view/`.

#### 4.4 Fix `fileExportUtils.test.ts` framework

**File:** `src/internals/plugins/useFileExplorerDnd/fileExportUtils.test.ts`

Replace:
```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
// expect(x).toBe(y) → expect(x).to.equal(y)
// expect(x).toBeNull() → expect(x).to.equal(null)
// expect(x).toBeInstanceOf(Blob) → expect(x).to.be.instanceOf(Blob)
// expect(x).toBeTruthy() → expect(x).to.be.ok
```
With:
```typescript
import { expect } from 'chai';
```

### P1 — Security-Critical (New Tests)

#### 4.5 `fileValidation.test.ts`

**File:** `src/internals/plugins/useFileExplorerDnd/fileValidation.test.ts` (NEW)

```
describe('fileValidation')
  describe('isDangerousExtension')
    - returns true for Windows executables (.exe, .dll, .msi, .bat, .cmd, .scr, .vbs, .com, .pif, .reg)
    - returns true for Unix executables (.sh, .bash, .bin, .out, .o)
    - returns true for macOS executables (.app, .deb, .rpm)
    - returns true for script files (.py, .pl, .rb, .php, .asp, .jsp, .cgi)
    - returns true for archive files (.zip, .rar, .7z, .tar, .gz, .bz2, .xz)
    - returns true for macro-enabled Office formats (.xlsm, .docm, .pptm)
    - returns true for .js files (browser scripts)
    - returns false for safe extensions (.txt, .pdf, .png, .jpg, .csv, .md)
    - returns false for files with no extension
    - handles filenames with multiple dots (archive.tar.gz -> checks 'gz')
    - is case-insensitive via lowercase conversion

  describe('isAllowedMimeType')
    - allows default text types (text/plain, text/csv, text/markdown, text/xml, text/html)
    - allows default image types (image/jpeg, image/png, image/gif, image/webp, image/svg+xml)
    - allows default document types (application/pdf, .docx, .xlsx, .pptx MIME types)
    - allows default data types (application/json, application/yaml)
    - rejects unknown MIME types (application/x-executable, application/octet-stream)
    - uses custom allowedTypes when provided
    - custom allowedTypes override defaults entirely (default types rejected)
    - returns false for empty allowedTypes array (uses defaults)

  describe('isAcceptableFileSize')
    - accepts files under 10MB default limit
    - rejects files over 10MB default limit
    - rejects zero-byte files
    - rejects negative file sizes
    - respects custom maxSize parameter
    - accepts file at exactly max size (boundary: fileSize === maxSize)

  describe('validateFile')
    - returns isValid:true for safe file (report.pdf, application/pdf, 1MB)
    - returns isValid:false with extension error for .exe file
    - returns isValid:false with size error for oversized file
    - returns isValid:false with MIME error for unknown type
    - returns multiple errors for multiply-invalid file
    - catches MIME mismatch (image/png with .exe extension)
    - passes custom options through (allowedMimeTypes, maxFileSize)

  describe('validateFiles')
    - separates valid and rejected files in batch
    - handles empty array input
    - handles all-valid batch
    - handles all-rejected batch
    - preserves per-file error details

  describe('getRejectionReason')
    - returns default message for empty errors array
    - returns single error directly
    - joins multiple errors with semicolon
```

**~35 test cases**

### P2 — Core Data Flow

#### 4.6 `FileExplorerDndContext.test.ts`

**File:** `src/internals/plugins/useFileExplorerDnd/FileExplorerDndContext.test.ts` (NEW)

```
describe('fileListStateReducer')
  - handles 'instruction' action (reorder items based on DnD instruction)
  - handles 'create-children' action (add files to a target folder)
  - handles 'modal-move' action (move items via modal dialog)
  - handles 'external-drop' action (add external files from OS)
  - handles 'toggle-expand' action (expand/collapse folder)
  - preserves unaffected items during reorder
  - updates parentId references correctly after move

describe('getFileExplorerStateDefault')
  - creates default state from items array
  - builds correct lastAction record
  - handles empty items array

describe('fileExplorer reducer helper')
  - returns correct initial state shape
```

**~11 test cases**

#### 4.7 EventManager tests

**File:** `src/internals/utils/EventManager.test.ts` (NEW)

```
describe('EventManager')
  describe('on / emit')
    - registers and fires listener on event
    - passes all arguments to listener
    - supports multiple listeners on same event
    - fires high-priority listeners before regular ones
    - fires regular listeners in registration order

  describe('removeListener')
    - removes specific listener by reference
    - no-op if listener not registered
    - no-op if event name not registered

  describe('removeAllListeners')
    - clears all registered events and listeners
```

**~8 test cases**

### P3 — DnD Integration

#### 4.8 `useFileExplorerDnd` interaction tests

**File:** `src/internals/plugins/useFileExplorerDnd/useFileExplorerDnd.test.tsx` (NEW)

This is the most complex test file to write due to the Atlassian Pragmatic DnD dependency. Tests should focus on the state management and callback layer rather than simulating full drag gestures.

```
describe('useFileExplorerDnd')
  describe('createFileRegistry')
    - registerFile adds element to registry
    - cleanup function removes element from registry
    - registry.get returns registered element

  describe('internal drag-and-drop')
    - calls onItemPositionChange callback after reorder
    - prevents dropping item onto itself
    - prevents creating circular parent-child relationship
    - updates item order in state after drop

  describe('external file drop')
    - calls validateFiles for dropped files
    - rejects files with dangerous extensions
    - calls onAddFiles with validated files
    - respects dndFileTypes prop for MIME filtering
    - respects dndMaxFileSize prop

  describe('DnD state (idle/preview/dragging)')
    - defaults to idle state
    - transitions to preview on drag start
    - transitions to dragging after preview
    - resets to idle on drop/cancel
```

**~15 test cases**

### P4 — Component Integration

#### 4.9 Expand `FileExplorer.test.tsx`

**File:** `src/FileExplorer/FileExplorer.test.tsx` (EXTEND)

```
describe('<FileExplorer />')
  // existing conformance tests...

  describe('rendering')
    - renders items from items prop
    - renders nested folder structure with children
    - renders empty when items=[]
    - renders item names as labels

  describe('controlled mode')
    - expandedItems prop controls expansion state
    - selectedItems prop controls selection state
    - fires onExpandedItemsChange when folder toggled
    - fires onSelectedItemsChange when item clicked

  describe('multiSelect')
    - allows multiple selection when multiSelect=true
    - restricts to single selection when multiSelect=false (default)

  describe('apiRef')
    - exposes focusItem method
    - exposes setItemExpansion method
    - exposes getItem method returning FileBase data

  describe('slots')
    - renders custom item slot component
    - passes slotProps to custom item
```

**~14 test cases**

#### 4.10 `FileExplorerTabs.test.tsx`

**File:** `src/FileExplorerTabs/FileExplorerTabs.test.tsx` (NEW)

```
describe('<FileExplorerTabs />')
  - renders tab list from tabNames prop
  - renders correct panel for active tab
  - calls setTabName callback on tab change
  - renders FileExplorer inside each panel
  - renders drawer component
  - handles empty tabNames array
```

**~6 test cases**

#### 4.11 `useFileUtils.test.tsx`

**File:** `src/hooks/useFileUtils/useFileUtils.test.tsx` (NEW)

```
describe('useFileUtils')
  - returns interactions object with handleExpansion
  - returns interactions object with handleSelection
  - handleExpansion toggles item expansion state
  - handleSelection selects item
  - returns correct status object for item
```

**~5 test cases**

### P5 — Edge Cases & Hardening

#### 4.12 Extend `useFileExplorerFiles.test.tsx`

**File:** `src/internals/plugins/useFileExplorerFiles/useFileExplorerFiles.test.tsx` (EXTEND)

```
  // additional edge cases:
  - handles items with special characters in name (/, ., spaces)
  - handles items with unicode names (CJK, emoji, RTL)
  - handles items with empty string name
  - preserves item metadata (size, lastModified, mediaType) through render cycle
  - does not crash with 500+ items (smoke test)
```

**~5 test cases**

#### 4.13 Accessibility tests

**File:** `src/FileExplorer/FileExplorer.a11y.test.tsx` (NEW)

```
describe('FileExplorer accessibility')
  - root element has role="tree"
  - items have role="treeitem"
  - expanded folder has aria-expanded="true"
  - collapsed folder has aria-expanded="false"
  - leaf item does not have aria-expanded attribute
  - selected items have aria-selected="true"
  - disabled items have aria-disabled="true"
  - multiselectable tree has aria-multiselectable="true"
  - focus moves correctly with keyboard arrow keys
  - focused item has tabindex="0", others have tabindex="-1"
```

**~10 test cases**

---

## 5. Implementation Sequence

```
Phase 0 — Fix Broken Tests (prerequisite)
  0a. Fix File.test.tsx imports                     ~15 min
  0b. Fix useFileExplorerGrid.test.tsx imports      ~15 min
  0c. Fix FileElement.test.tsx imports              ~10 min
  0d. Migrate fileExportUtils.test.ts to Mocha/Chai ~30 min
  ──────────────────────────────────────────────────
  Verify: all 19 existing test files pass under Mocha

Phase 1 — Security & Pure Functions (no render needed)
  1. fileValidation.test.ts                          ~35 test cases
  2. EventManager.test.ts                            ~8 test cases

Phase 2 — DnD State Logic (minimal rendering)
  3. FileExplorerDndContext.test.ts                   ~11 test cases
  4. useFileExplorerDnd.test.tsx                      ~15 test cases

Phase 3 — Component Integration (full rendering)
  5. FileExplorer.test.tsx (extend)                   ~14 test cases
  6. FileExplorerTabs.test.tsx                        ~6 test cases
  7. useFileUtils.test.tsx                            ~5 test cases

Phase 4 — Hardening
  8. useFileExplorerFiles edge cases                  ~5 test cases
  9. Accessibility test suite                         ~10 test cases
```

**Estimated total new test cases:** ~109 (plus ~4 broken test fixes)
**Estimated new test lines:** ~2,200-2,800

---

## 6. Test Patterns Reference

### Pure function test (Mocha/Chai)

```typescript
import { expect } from 'chai';
import { isDangerousExtension, validateFile } from './fileValidation';

describe('fileValidation', () => {
  describe('isDangerousExtension', () => {
    it('should return true for .exe files', () => {
      expect(isDangerousExtension('malware.exe')).to.equal(true);
    });

    it('should return false for .pdf files', () => {
      expect(isDangerousExtension('report.pdf')).to.equal(false);
    });
  });

  describe('validateFile', () => {
    it('should return isValid:true for a safe file', () => {
      const result = validateFile('report.pdf', 'application/pdf', 1024 * 1024);
      expect(result.isValid).to.equal(true);
      expect(result.errors).to.have.length(0);
    });
  });
});
```

### Plugin test (using `describeFileExplorer`)

```typescript
import { expect } from 'chai';
import { spy } from 'sinon';
import { fireEvent } from '@stoked-ui/internal-test-utils';
import { describeFileExplorer } from 'test/utils/fileExplorer-view/describeFileExplorer';
import { UseFileExplorerSelectionSignature } from '@stoked-ui/file-explorer/internals';

describeFileExplorer<[UseFileExplorerSelectionSignature]>(
  'plugin test example',
  ({ render }) => {
    it('should select item on click', () => {
      const response = render({
        items: [{ id: '1' }, { id: '2' }],
      });
      fireEvent.click(response.getItemContent('1'));
      expect(response.isItemSelected('1')).to.equal(true);
    });
  },
);
```

### Component integration test

```typescript
import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import { FileExplorer } from '@stoked-ui/file-explorer/FileExplorer';

describe('<FileExplorer />', () => {
  const { render } = createRenderer();

  it('should render items from items prop', () => {
    const { getByText } = render(
      <FileExplorer
        items={[
          { id: '1', name: 'file.txt', mediaType: 'text', type: 'file' },
        ]}
      />,
    );
    expect(getByText('file.txt')).not.to.equal(null);
  });
});
```

### Mocking `URL.createObjectURL` for export tests

```typescript
import { expect } from 'chai';
import { stub, restore } from 'sinon';

describe('createDownloadUrl', () => {
  let createObjectURLStub: sinon.SinonStub;

  beforeEach(() => {
    createObjectURLStub = stub(URL, 'createObjectURL').returns('blob:test-url');
    stub(URL, 'revokeObjectURL');
  });

  afterEach(() => {
    restore();
  });

  it('should create blob URL for file with media', () => {
    const url = createDownloadUrl({
      id: '1', name: 'doc.txt', type: 'file', mediaType: 'doc', media: 'content',
    });
    expect(url).to.equal('blob:test-url');
    expect(createObjectURLStub.calledOnce).to.equal(true);
  });
});
```

---

## 7. CI Integration Notes

- Tests run via monorepo command: `cross-env NODE_ENV=test mocha 'packages/sui-file-explorer/src/**/*.test.{ts,tsx}'`
- Coverage via: `nyc --reporter=text mocha ...`
- Test files excluded from TypeScript build via `tsconfig.build.json` excludes pattern
- New `.test.ts` / `.test.tsx` files are auto-discovered by Mocha glob — no config changes needed
- Timeout: 2s local, 5s on CircleCI (configured in `.mocharc.js`)
- All tests require JSDOM environment (setup via `@stoked-ui/internal-test-utils/setupJSDOM`)

---

## 8. Key Source Files for Reference

| Source File | Lines | What It Does | Test Status |
|-------------|------:|-------------|-------------|
| `src/FileExplorer/FileExplorer.tsx` | ~135 | Main component, plugin orchestration | Conformance only |
| `src/FileExplorerBasic/FileExplorerBasic.tsx` | ~100 | Simplified variant | Conformance only |
| `src/FileExplorerTabs/FileExplorerTabs.tsx` | ~80 | Tabbed variant with drawer | Untested |
| `src/File/File.tsx` | ~200 | File item component | Broken test |
| `src/FileDropzone/FileDropzone.tsx` | ~60 | Upload dropzone | Conformance only |
| `src/internals/plugins/useFileExplorerDnd/useFileExplorerDnd.tsx` | ~400 | DnD plugin (Atlassian) | Only `fileExportUtils` tested (broken) |
| `src/internals/plugins/useFileExplorerDnd/fileValidation.ts` | 250 | Security: file validation | **Untested** |
| `src/internals/plugins/useFileExplorerDnd/fileExportUtils.ts` | 172 | File export/download | Tested (wrong framework) |
| `src/internals/plugins/useFileExplorerDnd/FileExplorerDndContext.ts` | ~200 | DnD state reducer | **Untested** |
| `src/internals/plugins/useFileExplorerSelection/useFileExplorerSelection.ts` | ~300 | Selection logic | Well tested |
| `src/internals/plugins/useFileExplorerExpansion/useFileExplorerExpansion.ts` | ~200 | Expansion logic | Well tested |
| `src/internals/plugins/useFileExplorerKeyboardNavigation/useFileExplorerKeyboardNavigation.ts` | ~400 | Keyboard nav | Well tested |
| `src/featureFlags/FeatureFlagConfig.ts` | 244 | Feature flag definitions | Well tested |
| `src/featureFlags/FeatureFlagContext.tsx` | ~200 | Feature flag React context | Well tested |
| `src/hooks/useFileUtils.tsx` | ~80 | Public utility hook | **Untested** |
| `src/models/items.ts` | 36 | `FileBase`, `FileBaseInput` types | Type-only (no runtime) |
