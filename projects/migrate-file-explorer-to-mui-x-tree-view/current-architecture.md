# FileExplorer Current Architecture Documentation

**Project**: GitHub Project #7 - Migrate File Explorer to MUI X Tree View
**Phase**: 1.1 - Current Implementation Audit
**Date**: 2026-01-15
**Status**: Complete

## Executive Summary

This document provides a comprehensive audit of the current FileExplorer architecture, including all 9 plugins (not 8 as initially estimated), their interdependencies, public API surface, and sui-editor integration points.

**Key Findings**:
- **9 Core Plugins** identified (useFileExplorerFiles, useFileExplorerExpansion, useFileExplorerSelection, useFileExplorerFocus, useFileExplorerKeyboardNavigation, useFileExplorerIcons, useFileExplorerGrid, useFileExplorerDnd, useFileExplorerJSXItems)
- **Complex dependency graph** with 4 dependency levels
- **sui-editor integration** through FileExplorerTabs with custom tabbed interface
- **Atlaskit Pragmatic DnD** dependency for drag-and-drop functionality

---

## 1. Plugin Inventory

### 1.1 useFileExplorerFiles

**Location**: `packages/sui-file-explorer/src/internals/plugins/useFileExplorerFiles/`

**Purpose**: Core file data management, item tracking, and metadata storage

**TypeScript Interfaces**:

```typescript
// Parameters
interface UseFileExplorerFilesParameters<R extends FileBase = FileBase> {
  alternatingRows?: SxProps<Theme> | true;
  disabledItemsFocusable?: boolean;
  getItemId?: (item: R) => FileId;
  getItemLabel?: (item: R) => string;
  isItemDisabled?: (item: R) => boolean;
  itemChildrenIndentation?: string | number;
  items: readonly R[];
}

// Public API
interface UseFileExplorerFilesPublicAPI<R extends {}> {
  getItem: (id: FileId) => R;
  getItemDOMElement: (id: FileId) => HTMLElement | null;
  getItemOrderedChildrenIds: (id: FileId | null) => FileId[];
}

// Instance API (Internal + Public)
interface UseFileExplorerFilesInstance<R extends FileBase[] = FileBase[]> {
  areItemUpdatesPrevented: () => boolean;
  getFiles: () => R[];
  getItemDOMElement: (id: FileId) => HTMLElement | null;
  getItemIndex: (id: FileId) => number;
  getItemMeta: (id: FileId) => FileMeta;
  getItemsToRender: () => FileProps[];
  getVisibleIndex: (id: string) => number;
  isItemDisabled: (id: FileId) => boolean;
  isItemNavigable: (id: FileId) => boolean;
  preventItemUpdates: () => void;
  recalcVisibleIndices: (items: FileBase[], force: boolean, index: number) => void;
  updateDndMeta: (id: string, state: DndItemState) => void;
  updateItems: (item: R[]) => void;
}

// State
interface UseFileExplorerFilesState<R extends {}> {
  items: {
    itemMetaMap: FileMetaMap;
    itemMap: FileMap<R>;
    itemOrderedChildrenIds: { [parentItemId: string]: string[] };
    itemChildrenIndexes: { [parentItemId: string]: { [id: string]: number } };
    indiciesDirty: boolean;
  };
}

// Context Value
interface UseFileExplorerFilesContextValue {
  disabledItemsFocusable: boolean;
  indentationAtItemLevel: boolean;
  alternatingRows?: SxProps<Theme>;
}

// Events
interface UseFileExplorerFilesEventLookup {
  removeItem: { params: { id: string } };
}
```

**Dependencies**:
- `UseFileExplorerExpansionSignature`
- `UseFileExplorerDndSignature`

**State Management**:
- `itemMetaMap`: Stores FileMeta for each item
- `itemMap`: Stores actual item data
- `itemOrderedChildrenIds`: Parent-child relationships
- `itemChildrenIndexes`: Child position indices
- `indiciesDirty`: Tracks when visible indices need recalculation

**Key Responsibilities**:
- File item storage and retrieval
- Parent-child relationship management
- Visible index calculation for rendering
- DOM element reference management
- Disabled/navigable state computation

---

### 1.2 useFileExplorerExpansion

**Location**: `packages/sui-file-explorer/src/internals/plugins/useFileExplorerExpansion/`

**Purpose**: Controls folder expansion/collapse state

**TypeScript Interfaces**:

```typescript
// Parameters
interface UseFileExplorerExpansionParameters {
  expandedItems?: string[];
  defaultExpandedItems?: string[];
  onExpandedItemsChange?: (event: React.SyntheticEvent, ids: string[]) => void;
  onItemExpansionToggle?: (event: React.SyntheticEvent, id: string, isExpanded: boolean) => void;
  expansionTrigger?: 'content' | 'iconContainer';
}

// Public API
interface UseFileExplorerExpansionPublicAPI {
  setItemExpansion: (event: React.SyntheticEvent, id: string, isExpanded: boolean) => void;
}

// Instance API
interface UseFileExplorerExpansionInstance {
  isItemExpanded: (id: FileId) => boolean;
  isItemExpandable: (id: FileId) => boolean;
  toggleItemExpansion: (event: React.SyntheticEvent, id: FileId) => void;
  expandAllSiblings: (event: React.KeyboardEvent, id: FileId) => void;
}

// Context Value
interface UseFileExplorerExpansionContextValue {
  expansion: Pick<UseFileExplorerExpansionParameters, 'expansionTrigger'>;
}
```

**Dependencies**:
- `UseFileExplorerFilesSignature`

**Model Names**: `expandedItems` (controlled state)

**Key Responsibilities**:
- Track expanded/collapsed state
- Toggle expansion on user interaction
- Expand all siblings utility
- Determine if item is expandable (has children)

---

### 1.3 useFileExplorerSelection

**Location**: `packages/sui-file-explorer/src/internals/plugins/useFileExplorerSelection/`

**Purpose**: Manages single and multi-selection of items

**TypeScript Interfaces**:

```typescript
// Parameters
interface UseFileExplorerSelectionParameters<Multiple extends boolean | undefined> {
  disableSelection?: boolean;
  defaultSelectedItems?: FileExplorerSelectionValue<Multiple>;
  selectedItems?: FileExplorerSelectionValue<Multiple>;
  multiSelect?: Multiple;
  checkboxSelection?: boolean;
  onSelectedItemsChange?: (event: React.SyntheticEvent, ids: FileExplorerSelectionValue<Multiple>) => void;
  onItemSelectionToggle?: (event: React.SyntheticEvent, id: string, isSelected: boolean) => void;
}

type FileExplorerSelectionValue<Multiple extends boolean | undefined> =
  Multiple extends true ? string[] : string | null;

// Public API
interface UseFileExplorerSelectionPublicAPI {
  selectItem: (params: {
    event: React.SyntheticEvent;
    id: string;
    keepExistingSelection?: boolean;
    newValue?: boolean;
  }) => void;
}

// Instance API
interface UseFileExplorerSelectionInstance {
  isItemSelected: (id: string) => boolean;
  selectItem: (params: {...}) => void;
  selectAllNavigableItems: (event: React.SyntheticEvent) => void;
  expandSelectionRange: (event: React.SyntheticEvent, id: string) => void;
  selectRangeFromStartToItem: (event: React.SyntheticEvent, id: string) => void;
  selectRangeFromItemToEnd: (event: React.SyntheticEvent, id: string) => void;
  selectItemFromArrowNavigation: (event: React.SyntheticEvent, currentItemId: string, nextItemId: string) => void;
}

// Context Value
interface UseFileExplorerSelectionContextValue {
  selection: {
    multiSelect: boolean;
    checkboxSelection: boolean;
    disableSelection: boolean;
  };
}
```

**Dependencies**:
- `UseFileExplorerFilesSignature`
- `UseFileExplorerExpansionSignature`

**Model Names**: `selectedItems` (controlled state)

**Key Responsibilities**:
- Single/multi-selection logic
- Range selection support
- Checkbox selection mode
- Arrow navigation selection updates
- Selection state tracking

---

### 1.4 useFileExplorerFocus

**Location**: `packages/sui-file-explorer/src/internals/plugins/useFileExplorerFocus/`

**Purpose**: Manages keyboard focus and tab navigation

**TypeScript Interfaces**:

```typescript
// Parameters
interface UseFileExplorerFocusParameters {
  onItemFocus?: (event: React.SyntheticEvent, id: string) => void;
}

// Public API
interface UseFileExplorerFocusPublicAPI {
  focusItem: (event: React.SyntheticEvent, id: string) => void;
}

// Instance API
interface UseFileExplorerFocusInstance {
  isItemFocused: (id: FileId) => boolean;
  canItemBeTabbed: (id: FileId) => boolean;
  removeFocusedItem: () => void;
}

// State
interface UseFileExplorerFocusState {
  focusedItemId: string | null;
}
```

**Dependencies**:
- `UseFileExplorerFilesSignature`
- `UseFileExplorerDndSignature`
- `UseFileExplorerSelectionSignature`
- `UseFileExplorerExpansionSignature`

**Key Responsibilities**:
- Track currently focused item
- Determine tab order (sequential focusability)
- Focus management with selection integration
- Remove focus when needed

---

### 1.5 useFileExplorerKeyboardNavigation

**Location**: `packages/sui-file-explorer/src/internals/plugins/useFileExplorerKeyboardNavigation/`

**Purpose**: Handles all keyboard interactions (arrow keys, type-ahead)

**TypeScript Interfaces**:

```typescript
// Instance API
interface UseFileExplorerKeyboardNavigationInstance {
  updateFirstCharMap: (updater: (map: FileExplorerFirstCharMap) => FileExplorerFirstCharMap) => void;
  handleItemKeyDown: (event: React.KeyboardEvent<HTMLElement> & MuiCancellableEvent, id: FileId) => void;
}

type FileExplorerFirstCharMap = { [id: string]: string };
```

**Dependencies**:
- `UseFileExplorerFilesSignature`
- `UseFileExplorerSelectionSignature`
- `UseFileExplorerFocusSignature`
- `UseFileExplorerExpansionSignature`
- `UseFileExplorerDndSignature`

**Key Responsibilities**:
- Arrow key navigation (up, down, left, right)
- Home/End navigation
- Type-ahead search with first character map
- Coordinating with focus, selection, and expansion plugins

---

### 1.6 useFileExplorerIcons

**Location**: `packages/sui-file-explorer/src/internals/plugins/useFileExplorerIcons/`

**Purpose**: Manages expandable/collapsible and end icons

**TypeScript Interfaces**:

```typescript
// Parameters (empty)
interface UseFileExplorerIconsParameters {}

// Slots
interface UseFileExplorerIconsSlots {
  collapseIcon?: React.ElementType;
  expandIcon?: React.ElementType;
  endIcon?: React.ElementType;
}

// Slot Props
interface UseFileExplorerIconsSlotProps {
  collapseIcon?: SlotComponentProps<'svg', {}, {}>;
  expandIcon?: SlotComponentProps<'svg', {}, {}>;
  endIcon?: SlotComponentProps<'svg', {}, {}>;
}

// Context Value
interface UseFileExplorerIconsContextValue {
  icons: {
    slots: UseFileExplorerIconsSlots;
    slotProps: UseFileExplorerIconsSlotProps;
  };
}
```

**Dependencies**:
- `UseFileExplorerFilesSignature`
- `UseFileExplorerSelectionSignature`
- `UseFileExplorerDndSignature`

**Key Responsibilities**:
- Provide slot system for custom icons
- Default expand/collapse icon management
- End icon for leaf items

---

### 1.7 useFileExplorerGrid

**Location**: `packages/sui-file-explorer/src/internals/plugins/useFileExplorerGrid/`

**Purpose**: Advanced grid view with sortable columns and headers

**TypeScript Interfaces**:

```typescript
// Parameters
interface UseFileExplorerGridParameters {
  grid?: boolean;
  gridHeader?: boolean;
  columns?: GridColumns;
  headers?: GridHeaders;
  initializedIndexes?: boolean;
  defaultGridColumns?: GridColumns;
  defaultGridHeaders?: GridHeaders;
  gridColumns?: GridColumnFuncs;
}

type GridColumn = {
  sx: SystemStyleObject;
  renderContent: (content: any) => string;
  evaluator?: (...args: any) => any;
  width: number;
  track: GridColumnRowData;
  waiting: boolean;
  cells: React.ReactElement[];
  children: (cells: React.ReactElement[]) => React.ReactNode;
};

type GridColumns = { [id: string]: GridColumn };

type GridHeader = {
  sx: SystemStyleObject;
  width: number;
  status: UseFileExplorerGridColumnHeaderStatus;
};

type GridHeaders = { [id: string]: GridHeader };

interface UseFileExplorerGridColumnHeaderStatus {
  ascending?: boolean;
  focused: boolean;
  visible: boolean;
  sort: boolean;
}

// Public API
interface UseFileExplorerGridPublicAPI {
  setVisibleOrder: (value: FileId[]) => void;
  setColumns: (value: GridColumns) => void;
  gridEnabled: () => boolean;
}

// Instance API
interface UseFileExplorerGridInstance {
  getItemStatus: (id: FileId, children: React.ReactNode) => UseFileStatus;
  getAltRowClass: (id: FileId) => string;
  getColumns: () => GridColumns;
  getHeaders: () => GridHeaders;
  focusHeader: (event: React.FocusEvent | React.MouseEvent | null, columnName: string) => void;
  blurHeader: (event: React.FocusEvent | null, columnName: string) => void;
  isColumnAscending: (columnName: string) => boolean | null;
  isColumnFocused: (columnName: string) => boolean | null;
  isColumnVisible: (columnName: string) => boolean | null;
  isSortColumn: (columnName: string) => boolean | null;
  getHeaderStatus: (columnName: string) => UseFileExplorerGridColumnHeaderStatus;
  toggleColumnSort: (columnName: string, evaluator?: (item: any, columnName: string) => any) => boolean | null;
  toggleColumnVisible: (columnName: string) => boolean | null;
  gridEnabled: () => boolean;
  getItemMode: (item: any) => ItemMode;
  processColumns: () => void;
}

// State
interface UseFileExplorerGridState {
  grid: {
    columns: GridColumns;
    headers: GridHeaders;
    initializedIndexes: boolean;
  };
  id: string;
}

// Context Value
interface UseFileExplorerGridContextValue {
  grid: boolean;
  gridHeader: boolean;
  columns?: GridColumns;
  headers?: GridHeaders;
  id: string;
}
```

**Dependencies**: None (independent plugin)

**Key Responsibilities**:
- Enable grid layout with columns
- Column sorting (ascending/descending)
- Column visibility toggling
- Header focus management
- Custom column renderers and evaluators
- Alternating row styling

---

### 1.8 useFileExplorerDnd

**Location**: `packages/sui-file-explorer/src/internals/plugins/useFileExplorerDnd/`

**Purpose**: Drag-and-drop functionality using Atlaskit Pragmatic DnD

**TypeScript Interfaces**:

```typescript
// Parameters
interface UseFileExplorerDndParameters {
  dndInternal?: true;
  dndExternal?: true;
  dndFileTypes?: string[];
  dndTrash?: true;
  onAddFiles?: (files: FileBase[]) => void;
}

type DndItemState = {
  dndState: DndState;
  dndContainer: HTMLElement | null;
  dndInstruction: any | null;
};

type ElementDragPayload = {
  element: HTMLElement;
  dragHandle: Element | null;
  data: Record<string, unknown>;
};

type ElementDragType = {
  type: 'element';
  startedFrom: 'internal';
  payload: ElementDragPayload;
};

type DropInternalData = {
  dropped: {
    item: FileBase;
    dnd: ElementDragPayload;
  };
  target: {
    item: FileBase;
    dnd: DragLocation;
  };
  instruction: Instruction;
};

type DndTrashMode = 'remove' | 'collect-remove-restore' | 'collect-restore' | 'collect';

// Instance API
interface UseFileListItemsInstance {
  dndConfig: () => {
    dndInternal?: true;
    dndExternal?: true;
    dndFileTypes?: string[];
    dndTrash?: true;
  } | undefined;
  dndEnabled: () => boolean;
  dndInternalEnabled: () => boolean;
  dndExternalEnabled: () => boolean;
  dndExternalFileTypes: () => string[];
  dndTrash: () => true | undefined;
  getDndContext: FileExplorerDndContextValue<FileBase>;
  dropInternal: (event: BaseEventPayload<ElementDragType>) => void;
  createChildren: (files: FileBase[], targetId: string | null) => void;
  createChild: (item: FileBase, targetId: string | null) => void;
  removeItem: (id: string) => void;
}

// Context Value
interface UseFileExplorerDndContextValue {
  dnd: {
    dndInternal?: true;
    dndExternal?: true;
    dndFileTypes?: string[];
    dndTrash?: true;
  } | undefined;
}
```

**Dependencies**:
- `UseFileExplorerFilesSignature`

**Key Responsibilities**:
- Internal drag-and-drop (reordering)
- External file drop support
- File type filtering for external drops
- Trash/delete via drag-and-drop
- Integration with Atlaskit Pragmatic DnD library

**External Library**: `@atlaskit/pragmatic-drag-and-drop`

---

### 1.9 useFileExplorerJSXItems

**Location**: `packages/sui-file-explorer/src/internals/plugins/useFileExplorerJSXItems/`

**Purpose**: Support for JSX-based item definition (alternative to `items` prop)

**TypeScript Interfaces**:

```typescript
// Parameters (empty)
interface UseFileExplorerJSXItemsParameters {}

// Instance API
interface UseFileExplorerFilesInstance {
  insertJSXItem: (item: FileMeta) => () => void;
  mapFirstCharFromJSX: (id: FileId, firstChar: string) => () => void;
  setJSXItemsOrderedChildrenIds: (parentId: FileId | null, orderedChildrenIds: FileId[]) => void;
}
```

**Dependencies**:
- `UseFileExplorerFilesSignature`
- `UseFileExplorerDndSignature`
- `UseFileExplorerKeyboardNavigationSignature`
- `UseFileExplorerGridSignature`

**Key Responsibilities**:
- Insert items from JSX components
- Map first characters for type-ahead
- Track JSX-based children order
- Prevent conflicts with `items` prop

---

## 2. Plugin Dependency Graph

### Dependency Levels

```
Level 0 (No Dependencies):
  - useFileExplorerGrid

Level 1 (Depends on Level 0 or Files only):
  - useFileExplorerFiles [depends on: useFileExplorerExpansion, useFileExplorerDnd]
  - useFileExplorerExpansion [depends on: useFileExplorerFiles]
  - useFileExplorerDnd [depends on: useFileExplorerFiles]

Level 2 (Depends on Level 1):
  - useFileExplorerSelection [depends on: useFileExplorerFiles, useFileExplorerExpansion]
  - useFileExplorerIcons [depends on: useFileExplorerFiles, useFileExplorerSelection, useFileExplorerDnd]

Level 3 (Depends on Level 2):
  - useFileExplorerFocus [depends on: useFileExplorerFiles, useFileExplorerDnd, useFileExplorerSelection, useFileExplorerExpansion]

Level 4 (Depends on Level 3):
  - useFileExplorerKeyboardNavigation [depends on: useFileExplorerFiles, useFileExplorerSelection, useFileExplorerFocus, useFileExplorerExpansion, useFileExplorerDnd]
  - useFileExplorerJSXItems [depends on: useFileExplorerFiles, useFileExplorerDnd, useFileExplorerKeyboardNavigation, useFileExplorerGrid]
```

### Initialization Order

From `FileExplorer.plugins.ts`:

```typescript
export const FILE_EXPLORER_PLUGINS = [
  useFileExplorerFiles,       // 1
  useFileExplorerExpansion,   // 2
  useFileExplorerSelection,   // 3
  useFileExplorerFocus,       // 4
  useFileExplorerKeyboardNavigation, // 5
  useFileExplorerIcons,       // 6
  useFileExplorerGrid,        // 7
  useFileExplorerDnd,         // 8
  // useFileExplorerJSXItems is not included in core plugins array
] as const;
```

**Note**: `useFileExplorerJSXItems` is NOT in the core plugins array, suggesting it's conditionally activated or used in a different component variant.

### Cross-Plugin Communication

**State Sharing**:
- `useFileExplorerFiles` → provides item data to all plugins
- `useFileExplorerExpansion` → expansion state used by focus, selection
- `useFileExplorerSelection` → selection state used by focus, keyboard navigation
- `useFileExplorerFocus` → focus state used by keyboard navigation
- `useFileExplorerDnd` → DnD state updated in useFileExplorerFiles

**Event Coordination**:
- Keyboard events → orchestrated by useFileExplorerKeyboardNavigation → triggers focus, selection, expansion changes
- Mouse clicks → coordinated between selection, expansion, focus
- DnD events → handled by useFileExplorerDnd → updates file structure via useFileExplorerFiles

---

## 3. Public API Surface

### 3.1 FileExplorerProps

From `FileExplorer.types.ts`:

```typescript
interface FileExplorerProps<Multiple extends boolean | undefined>
  extends FileExplorerPropsBase,
          FileExplorerPluginParameters<Multiple> {

  // API Reference
  apiRef?: React.MutableRefObject<FileExplorerApiRef> | undefined;

  // Experimental Features
  experimentalFeatures?: {
    indentationAtItemLevel?: boolean;
  };

  // Slots
  slots?: FileExplorerSlots;
  slotProps?: FileExplorerSlotProps;
}

interface FileExplorerPropsBase {
  classes?: Partial<FileExplorerClasses>;
  className?: string;
  dropzone?: boolean;
  onAddFiles?: (files: FileBase[]) => void;
  onItemDoubleClick?: (item: FileBase) => void;
  sx?: SxProps<Theme>;
}

// Combines all plugin parameters
interface FileExplorerPluginParameters<Multiple extends boolean | undefined>
  extends FileExplorerCorePluginParameters,
          UseFileExplorerFilesParameters,
          UseFileExplorerExpansionParameters,
          UseFileExplorerSelectionParameters<Multiple>,
          UseFileExplorerFocusParameters,
          UseFileExplorerIconsParameters,
          UseFileExplorerGridParameters,
          UseFileExplorerDndParameters {}
```

### 3.2 Callbacks

```typescript
// File Management
onAddFiles?: (files: FileBase[]) => void;
onItemDoubleClick?: (item: FileBase) => void;

// Expansion
onExpandedItemsChange?: (event: React.SyntheticEvent, ids: string[]) => void;
onItemExpansionToggle?: (event: React.SyntheticEvent, id: string, isExpanded: boolean) => void;

// Selection
onSelectedItemsChange?: (event: React.SyntheticEvent, ids: string[] | string | null) => void;
onItemSelectionToggle?: (event: React.SyntheticEvent, id: string, isSelected: boolean) => void;

// Focus
onItemFocus?: (event: React.SyntheticEvent, id: string) => void;
```

### 3.3 Ref Methods (apiRef)

```typescript
interface FileExplorerApiRef {
  // Files Plugin
  getItem: (id: FileId) => FileBase;
  getItemDOMElement: (id: FileId) => HTMLElement | null;
  getItemOrderedChildrenIds: (id: FileId | null) => FileId[];

  // Expansion Plugin
  setItemExpansion: (event: React.SyntheticEvent, id: string, isExpanded: boolean) => void;

  // Selection Plugin
  selectItem: (params: { event: React.SyntheticEvent; id: string; keepExistingSelection?: boolean; newValue?: boolean }) => void;

  // Focus Plugin
  focusItem: (event: React.SyntheticEvent, id: string) => void;

  // Grid Plugin
  setVisibleOrder: (value: FileId[]) => void;
  setColumns: (value: GridColumns) => void;
  gridEnabled: () => boolean;
}
```

### 3.4 Slots

```typescript
interface FileExplorerSlots {
  root?: React.ElementType;
  item?: React.ElementType;
  collapseIcon?: React.ElementType;
  expandIcon?: React.ElementType;
  endIcon?: React.ElementType;
}

interface FileExplorerSlotProps {
  root?: SlotComponentProps<'ul', {}, {}>;
  item?: SlotComponentProps<'li', {}, FileExplorerItemSlotOwnerState>;
  collapseIcon?: SlotComponentProps<'svg', {}, {}>;
  expandIcon?: SlotComponentProps<'svg', {}, {}>;
  endIcon?: SlotComponentProps<'svg', {}, {}>;
}
```

---

## 4. sui-editor Integration

### 4.1 FileExplorerProvider Consumers

**EditorFileTabs Component** (`packages/sui-editor/src/EditorFileTabs/EditorFileTabs.tsx`):

```typescript
// Uses FileExplorerTabs (different from FileExplorer)
import { FileExplorerTabs, FileExplorerTabsProps } from "@stoked-ui/file-explorer";

export default function EditorFileTabs(inProps: FileExplorerTabsProps) {
  // Custom tabbed interface wrapping FileExplorer
  return <FileExplorerTabs
    role={'file-explorer-tabs'}
    id={'editor-file-explorer-tabs'}
    setTabName={setTabName}
    tabNames={tabNames}
    tabData={tabData}
    currentTab={currentTab}
    variant={'drawer'}
    {...inProps}
  />
}
```

**Editor Component** (`packages/sui-editor/src/Editor/Editor.tsx`):

```typescript
import { FileExplorerProps, FileExplorerTabsProps } from "@stoked-ui/file-explorer";

interface EditorProps {
  fileExplorerProps?: FileExplorerProps<undefined>;
  fileExplorerTabsProps?: FileExplorerTabsProps;
}

// Slot usage
interface EditorPluginSlots {
  fileExplorerTabs?: React.ElementType;
  fileExplorer?: React.ElementType;
}

// In render:
const FileExplorerTabsSlot = slots.fileExplorerTabs ?? EditorFileTabs;
```

### 4.2 Props Passed from Editor to FileExplorer

**From EditorFileTabs.tsx**:

```typescript
// Tab structure
const tabData: Record<string, ExplorerPanelProps> = {
  Projects: {
    name: 'Projects',
    items: projectItems,              // FileBase[]
    gridColumns: {
      version: (item: FileBase) => item?.version?.toString() || '',
      type: (item: FileBase) => item?.mediaType || '',
    },
    selectedId: file?.id,
    expandedItems: expanded,
    onItemDoubleClick: onProjectsDoubleClick
  },
  'Track Files': {
    name: 'Track Files',
    items: MediaFile.toFileBaseArray(trackFiles),
    gridColumns: {
      type: (item: FileBase) => item?.mediaType || '',
    },
    onItemDoubleClick: onTrackFilesDoubleClick
  }
};
```

**Key Props**:
- `items: FileBase[]` - File tree data
- `gridColumns: GridColumnFuncs` - Custom column definitions
- `selectedId: string` - Currently selected project
- `expandedItems: string[]` - Expanded folder IDs
- `onItemDoubleClick: (file: FileBase) => void` - Open project/video handler
- `variant: 'drawer'` - Drawer-style presentation
- `tabNames: string[]` - Tab labels
- `tabData: Record<string, ExplorerPanelProps>` - Tab-specific configurations

### 4.3 Event Handlers

**onProjectsDoubleClick**:
```typescript
const onProjectsDoubleClick = async (clickedFile: FileBase) => {
  if (clickedFile.mediaType === 'project' && clickedFile.name === file?.name) {
    return; // Already loaded
  }

  const urlLookup = await LocalDb.loadByName({
    store: editor.defaultInputFileType.name,
    name: clickedFile.name
  });

  switch(clickedFile.mediaType) {
    case 'project':
      // Load EditorFile from LocalDb
      const editorFile = await EditorFile.fromLocalFile(urlLookup.blob, EditorFile);
      await editorFile.updateStore();
      await editorFile.preload(editorId);
      dispatch({type: 'SET_FILE', payload: editorFile});
      break;

    case 'video':
      // Load video recording
      const recording = new MediaFile([video.blob], video.name, {type: 'video/mp4'});
      await recording.extractMetadata();
      dispatch({type: 'VIDEO_DISPLAY', payload: recording});
      break;

    case 'folder':
      // Currently no-op
      break;
  }
}
```

**onTrackFilesDoubleClick**:
```typescript
const onTrackFilesDoubleClick = async (doubleClickedFile: FileBase) => {
  if (doubleClickedFile.mediaType === 'folder' || !settings.trackFiles) {
    return;
  }

  const index = file?.files.findIndex((trackFile) =>
    (trackFile as IMediaFile).id === doubleClickedFile.id
  );

  if (index !== undefined && index !== -1) {
    const payload = file?.files[index] as IMediaFile;
    await payload.extractMetadata();
    dispatch({ type: 'VIDEO_DISPLAY', payload });
  }
}
```

### 4.4 Data Flow

```
LocalDb (IndexedDB)
  ↓
EditorContext.state
  ↓
EditorFileTabs (builds tabData)
  ↓
FileExplorerTabs (tabbed wrapper)
  ↓
FileExplorer (per-tab instance)
  ↓
User interaction (double-click)
  ↓
EditorContext.dispatch (SET_FILE or VIDEO_DISPLAY)
  ↓
Editor re-renders with new file/video
```

### 4.5 FileExplorerTabs Specific Props

```typescript
interface FileExplorerTabsProps {
  setTabName: (name: string) => void;
  tabNames: string[];
  tabData: Record<string, ExplorerPanelProps>;
  currentTab: { name: string; files?: readonly FileBase[] };
  variant: 'drawer';
  role: string;
  id: string;
}

interface ExplorerPanelProps {
  name: string;
  items: readonly FileBase[];
  gridColumns?: GridColumnFuncs;
  selectedId?: string;
  expandedItems?: string[];
  onItemDoubleClick?: (file: FileBase) => void;
}
```

---

## 5. Potential Migration Risks

### 5.1 High Risk Areas

1. **Atlaskit Pragmatic DnD Dependency**
   - FileExplorer uses `@atlaskit/pragmatic-drag-and-drop`
   - MUI X Tree View has its own DnD system
   - **Risk**: Incompatible DnD APIs, require complete rewrite of useFileExplorerDnd
   - **Mitigation**: Evaluate MUI X DnD capabilities early, plan adapter layer

2. **Grid Layout System**
   - FileExplorer has custom grid with sortable columns
   - MUI X Tree View is primarily hierarchical list
   - **Risk**: Grid features may not be supported
   - **Mitigation**: Check if MUI X Data Grid integration is possible, or implement custom column layout

3. **Plugin Architecture**
   - FileExplorer uses 9 interconnected plugins with dependency graph
   - MUI X Tree View uses different extension model
   - **Risk**: Plugin functionality may not map 1:1 to MUI X hooks/plugins
   - **Mitigation**: Create mapping document of plugin → MUI X feature

4. **FileExplorerTabs Wrapper**
   - sui-editor uses custom tabbed interface around FileExplorer
   - **Risk**: Tabs wrapper may need significant refactoring
   - **Mitigation**: Preserve ExplorerPanelProps interface, implement adapter

### 5.2 Medium Risk Areas

1. **Type-Ahead Search**
   - FileExplorer maintains `firstCharMap` for keyboard search
   - **Risk**: MUI X may not support type-ahead out of the box
   - **Mitigation**: Check MUI X Tree View docs, implement if missing

2. **Controlled vs Uncontrolled State**
   - FileExplorer supports both controlled (`expandedItems`, `selectedItems`) and uncontrolled (`defaultExpandedItems`, `defaultSelectedItems`) props
   - **Risk**: MUI X may have different controlled state patterns
   - **Mitigation**: Review MUI X state management, create adapter layer

3. **Custom Icons Slots**
   - FileExplorer has flexible icon slot system
   - **Risk**: MUI X may have different slot naming or patterns
   - **Mitigation**: Verify slot compatibility early

4. **Indentation Control**
   - FileExplorer supports `itemChildrenIndentation` and experimental `indentationAtItemLevel`
   - **Risk**: MUI X may have different indentation model
   - **Mitigation**: Check MUI X Tree View styling system

### 5.3 Low Risk Areas

1. **Basic Tree Operations**
   - Expand/collapse
   - Single/multi-selection
   - Focus management
   - **Reason**: Core Tree View functionality should be well-supported in MUI X

2. **Styling & Theming**
   - MUI X should have compatible theming system
   - **Reason**: Both use MUI theme system

3. **Accessibility**
   - Both should support ARIA attributes
   - **Reason**: MUI team prioritizes accessibility

---

## 6. File Locations Reference

### Core Files
- `packages/sui-file-explorer/src/FileExplorer/FileExplorer.tsx` (686 lines)
- `packages/sui-file-explorer/src/FileExplorer/FileExplorer.types.ts`
- `packages/sui-file-explorer/src/FileExplorer/FileExplorer.plugins.ts`

### Plugin Implementations
- `packages/sui-file-explorer/src/internals/plugins/useFileExplorerFiles/`
- `packages/sui-file-explorer/src/internals/plugins/useFileExplorerExpansion/`
- `packages/sui-file-explorer/src/internals/plugins/useFileExplorerSelection/`
- `packages/sui-file-explorer/src/internals/plugins/useFileExplorerFocus/`
- `packages/sui-file-explorer/src/internals/plugins/useFileExplorerKeyboardNavigation/`
- `packages/sui-file-explorer/src/internals/plugins/useFileExplorerIcons/`
- `packages/sui-file-explorer/src/internals/plugins/useFileExplorerGrid/`
- `packages/sui-file-explorer/src/internals/plugins/useFileExplorerDnd/`
- `packages/sui-file-explorer/src/internals/plugins/useFileExplorerJSXItems/`

### Plugin Models
- `packages/sui-file-explorer/src/internals/models/plugin.types.ts`
- `packages/sui-file-explorer/src/internals/models/fileExplorerView.ts`

### Editor Integration
- `packages/sui-editor/src/EditorFileTabs/EditorFileTabs.tsx`
- `packages/sui-editor/src/Editor/Editor.tsx`
- `packages/sui-editor/src/Editor/Editor.types.ts`
- `packages/sui-editor/src/internals/useEditor/useEditor.ts`
- `packages/sui-editor/src/internals/useEditor/useEditor.types.ts`

---

## 7. Acceptance Criteria Status

### AC-1.1.a: All 9 plugin interfaces documented with TypeScript types
✅ **Complete** - All 9 plugins documented with full TypeScript interfaces including:
- Parameters
- Public API
- Instance API
- State
- Context Value
- Events
- Dependencies

### AC-1.1.b: Every prop, callback, and ref method listed with types
✅ **Complete** - Documented:
- All props in FileExplorerProps and FileExplorerPluginParameters
- All callbacks (onAddFiles, onItemDoubleClick, onExpandedItemsChange, etc.)
- All apiRef methods (getItem, setItemExpansion, selectItem, focusItem, etc.)

### AC-1.1.c: All FileExplorerProvider consumers identified
✅ **Complete** - Identified:
- EditorFileTabs.tsx (primary consumer)
- Editor.tsx (slot provider)
- Props passed: items, gridColumns, selectedId, expandedItems, onItemDoubleClick, variant
- Event handlers: onProjectsDoubleClick, onTrackFilesDoubleClick

### AC-1.1.d: Plugin dependency graph shows initialization order and state sharing
✅ **Complete** - Documented:
- 5-level dependency graph (Level 0-4)
- Initialization order from FILE_EXPLORER_PLUGINS array
- Cross-plugin communication patterns
- State sharing mechanisms

---

## 8. Next Steps

1. **Phase 1.2**: MUI X Tree View API Analysis
   - Document MUI X Tree View plugin system
   - Map FileExplorer plugins to MUI X features
   - Identify feature gaps

2. **Phase 1.3**: Gap Analysis & Migration Strategy
   - Compare FileExplorer vs MUI X capabilities
   - Design adapter/wrapper strategy
   - Prioritize migration tasks

3. **Phase 2.1**: Prototype Development
   - Build minimal FileExplorer replacement with MUI X
   - Test sui-editor integration
   - Validate DnD functionality

---

**Document Version**: 1.0
**Last Updated**: 2026-01-15
**Author**: Claude (Sonnet 4.5) via stoked-ui-project-7
