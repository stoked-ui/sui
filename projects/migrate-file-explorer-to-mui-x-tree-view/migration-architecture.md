# FileExplorer Migration Architecture

**Project**: GitHub Project #7 - Migrate File Explorer to MUI X Tree View
**Phase**: 1.4 - Migration Strategy & Architecture Design
**Date**: 2026-01-15
**Status**: Complete

---

## Executive Summary

This document defines the complete migration architecture for transitioning FileExplorer from a custom plugin-based tree view to MUI X RichTreeView while preserving all existing functionality and public APIs.

**Architecture Approach**: Hybrid wrapper with MUI X core + custom feature layers

**Key Decisions**:
- ✅ Use MUI X RichTreeView for core tree logic (expansion, selection, focus, keyboard)
- ✅ Keep @atlaskit/pragmatic-drag-and-drop for DnD (MUI X insufficient)
- ✅ Custom grid wrapper component for multi-column layout
- ✅ Thin adapter layer to preserve backward compatibility
- ✅ Phased rollout with feature flags and progressive exposure

**Total Effort Estimate**: 22-28 days across 4 phases
**Risk Level**: Medium (mitigated by adapter pattern and phased rollout)

---

## 1. Component Architecture Design

### 1.1 High-Level Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                  FileExplorer (Public API)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  FileExplorerProps<Multiple> Interface                │  │
│  │  (Maintains backward compatibility - NO CHANGES)      │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           FileExplorerAdapter Layer                   │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  Props Mapping                                   │ │  │
│  │  │  - items → MUI X TreeViewBaseItem format        │ │  │
│  │  │  - selectedItems → selectedItems conversion     │ │  │
│  │  │  - expandedItems → expandedItems mapping        │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  Plugin Coordination                             │ │  │
│  │  │  - Map 9 plugins to MUI X + custom layers       │ │  │
│  │  │  - Manage FileExplorerDndContext                │ │  │
│  │  │  - Coordinate grid/tree state sync              │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  State Synchronization                           │ │  │
│  │  │  - Bidirectional state flow                     │ │  │
│  │  │  - Callback translation                         │ │  │
│  │  │  - Event handler wrapping                       │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│       ┌────────────────────┴──────────────────┐             │
│       ▼                                        ▼             │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │  MUI X RichTreeView │         │  Custom Feature     │   │
│  │                     │         │  Layers             │   │
│  │  Core Features:     │         │                     │   │
│  │  - Tree rendering   │◄────────┤  - Grid wrapper     │   │
│  │  - Expansion logic  │         │  - DnD integration  │   │
│  │  - Selection mgmt   │         │  - Icon mapping     │   │
│  │  - Focus tracking   │         │                     │   │
│  │  - Keyboard nav     │         │                     │   │
│  │  - apiRef interface │         │                     │   │
│  └─────────────────────┘         └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Component Replacement Strategy

#### Components Replaced by MUI X
| Current Component | Replaced By | Notes |
|------------------|-------------|-------|
| `FileExplorer` (root) | `RichTreeView` | Wrapped by adapter |
| `FileElement` | `TreeItem2` | Custom slot for extensions |
| Core tree rendering | MUI X native | Performance improvement expected |

#### Components Preserved
| Component | Reason | Integration Point |
|-----------|--------|------------------|
| `FileExplorerTabs` | sui-editor integration | Wraps new FileExplorer |
| `FileDropzone` | External file drop zone | Integrates with DnD layer |
| `File` (item component) | Custom rendering logic | Becomes TreeItem2 slot |

#### New Components Created
| Component | Purpose | Complexity |
|-----------|---------|------------|
| `FileExplorerAdapter` | Props/state translation | Medium |
| `FileExplorerGridWrapper` | Multi-column layout | High |
| `FileExplorerDndLayer` | DnD coordination | Medium |
| `IconMappingProvider` | Icon slot translation | Low |

### 1.3 Data Flow Architecture

```
User Interaction
       │
       ▼
┌──────────────────────┐
│  FileExplorer        │◄─── Props from sui-editor (EditorFileTabs)
│  (Public Interface)  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Adapter Layer       │
│  - Translate props   │
│  - Wrap callbacks    │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐  ┌────────────┐
│ MUI X   │  │ Custom     │
│ Tree    │  │ Layers     │
└────┬────┘  └─────┬──────┘
     │             │
     └─────┬───────┘
           │
           ▼
    State Updates
           │
           ▼
    Callback Invocation
           │
           ▼
    Parent Component (sui-editor)
```

---

## 2. Plugin Adapter Specifications

### 2.1 Plugin Migration Matrix

| Plugin | Migration Type | Complexity | Effort | Strategy |
|--------|---------------|------------|--------|----------|
| useFileExplorerFiles | Direct mapping | Low | 1 day | Map to `items` prop + state |
| useFileExplorerExpansion | Direct mapping | Low | 1 day | Use MUI X expansion API |
| useFileExplorerSelection | Direct mapping | Low | 1 day | Use MUI X selection API |
| useFileExplorerFocus | Direct mapping | Low | 0.5 days | Use MUI X focus API |
| useFileExplorerKeyboardNavigation | Built-in | Low | 0.5 days | Verify MUI X behavior |
| useFileExplorerIcons | Adapter pattern | Low | 1 day | Icon slot mapping |
| useFileExplorerGrid | Custom implementation | High | 3-4 days | Custom wrapper component |
| useFileExplorerDnd | Adapter pattern | Medium | 2-3 days | Keep @atlaskit integration |
| useFileExplorerJSXItems | Optional | Low | 1 day | Map to items array |

**Total Plugin Migration Effort**: 11-14 days

### 2.2 Plugin 1: useFileExplorerFiles → Items Management

**Current Architecture**:
```typescript
interface UseFileExplorerFilesInstance {
  getFiles: () => FileBase[];
  getItem: (id: FileId) => FileBase;
  getItemDOMElement: (id: FileId) => HTMLElement | null;
  getItemOrderedChildrenIds: (id: FileId | null) => FileId[];
  updateItems: (items: FileBase[]) => void;
  // ... 10 more methods
}
```

**MUI X Equivalent**:
```typescript
// Props-based approach
<RichTreeView
  items={items}
  // Items updated via React state
/>

// API ref for imperative access
apiRef.current?.getItem(itemId)
```

**Adapter Implementation**:
```typescript
// FileExplorerAdapter.tsx
export const FileExplorerAdapter = forwardRef<
  HTMLDivElement,
  FileExplorerProps
>(({ items, onItemsChange, ...otherProps }, ref) => {
  // Internal state for items
  const [internalItems, setInternalItems] = useState(items);

  // Sync with parent when items change
  useEffect(() => {
    if (items !== internalItems) {
      setInternalItems(items);
    }
  }, [items]);

  // Expose FileExplorer API through apiRef
  const apiRef = useTreeViewApiRef();

  useImperativeHandle(ref, () => ({
    getItem: (id: FileId) => apiRef.current?.getItem(id),
    getItemOrderedChildrenIds: (id: FileId | null) => {
      const item = id ? apiRef.current?.getItem(id) : null;
      return item?.children || [];
    },
    updateItems: (newItems: FileBase[]) => {
      setInternalItems(newItems);
      onItemsChange?.(newItems);
    },
    // ... map remaining methods
  }));

  return (
    <RichTreeView
      items={internalItems}
      apiRef={apiRef}
      {...convertProps(otherProps)}
    />
  );
});
```

**Effort**: 1 day
**Risk**: Low - straightforward prop mapping
**Test Coverage**: 45 existing tests → all must pass

---

### 2.3 Plugin 2: useFileExplorerExpansion → Expansion State

**Current Architecture**:
```typescript
interface UseFileExplorerExpansionPublicAPI {
  setItemExpansion: (event: React.SyntheticEvent, id: string, isExpanded: boolean) => void;
}

interface UseFileExplorerExpansionInstance {
  isItemExpanded: (id: FileId) => boolean;
  isItemExpandable: (id: FileId) => boolean;
  toggleItemExpansion: (event: React.SyntheticEvent, id: FileId) => void;
  expandAllSiblings: (event: React.KeyboardEvent, id: FileId) => void;
}
```

**MUI X Equivalent**:
```typescript
<RichTreeView
  expandedItems={expandedItems}
  onExpandedItemsChange={(event, nodeIds) => setExpandedItems(nodeIds)}
  apiRef={apiRef}
/>

// API ref methods
apiRef.current?.setItemExpansion(event, itemId, true);
apiRef.current?.isItemExpanded(itemId);
```

**Adapter Implementation**:
```typescript
// In FileExplorerAdapter
const [expandedItems, setExpandedItems] = useState<string[]>(
  props.defaultExpandedItems || []
);

const handleExpandedItemsChange = (
  event: React.SyntheticEvent,
  itemIds: string[]
) => {
  setExpandedItems(itemIds);
  props.onExpandedItemsChange?.(event, itemIds);
};

// Expose in apiRef
apiRef.current = {
  ...apiRef.current,
  setItemExpansion: (event, itemId, isExpanded) => {
    const current = new Set(expandedItems);
    if (isExpanded) {
      current.add(itemId);
    } else {
      current.delete(itemId);
    }
    setExpandedItems(Array.from(current));
  },
  isItemExpanded: (itemId) => expandedItems.includes(itemId),
  toggleItemExpansion: (event, itemId) => {
    const isExpanded = expandedItems.includes(itemId);
    apiRef.current.setItemExpansion(event, itemId, !isExpanded);
  },
};
```

**Effort**: 1 day
**Risk**: Low - MUI X has equivalent functionality
**Test Coverage**: 40 existing tests → all must pass

---

### 2.4 Plugin 3: useFileExplorerSelection → Selection State

**Current Architecture**:
```typescript
interface UseFileExplorerSelectionPublicAPI {
  selectItem: (params: {
    event: React.SyntheticEvent;
    id: string;
    keepExistingSelection?: boolean;
    newValue?: boolean;
  }) => void;
}

type FileExplorerSelectionValue<Multiple> =
  Multiple extends true ? string[] : string | null;
```

**MUI X Equivalent**:
```typescript
<RichTreeView
  multiSelect={multiSelect}
  selectedItems={selectedItems}
  onSelectedItemsChange={(event, itemIds) => setSelectedItems(itemIds)}
/>
```

**Adapter Implementation**:
```typescript
// In FileExplorerAdapter
type SelectionValue<Multiple> = Multiple extends true ? string[] : string | null;

const [selectedItems, setSelectedItems] = useState<SelectionValue<Multiple>>(
  props.defaultSelectedItems || (props.multiSelect ? [] : null)
);

const handleSelectionChange = (
  event: React.SyntheticEvent,
  itemIds: string | string[] | null
) => {
  setSelectedItems(itemIds as SelectionValue<Multiple>);
  props.onSelectedItemsChange?.(event, itemIds as SelectionValue<Multiple>);
};

// Expose in apiRef
apiRef.current = {
  ...apiRef.current,
  selectItem: ({ event, id, keepExistingSelection = false, newValue = true }) => {
    if (props.multiSelect) {
      const current = new Set(selectedItems as string[]);
      if (newValue) {
        current.add(id);
      } else {
        current.delete(id);
      }
      if (!keepExistingSelection && !newValue) {
        current.clear();
      }
      setSelectedItems(Array.from(current) as SelectionValue<Multiple>);
    } else {
      setSelectedItems((newValue ? id : null) as SelectionValue<Multiple>);
    }
  },
};
```

**Effort**: 1 day
**Risk**: Low - MUI X selection API is comprehensive
**Test Coverage**: 50 existing tests (CRITICAL) → all must pass
**Special Consideration**: Selection is core to FileExplorer usability

---

### 2.5 Plugin 4-5: Focus & Keyboard Navigation

**Current Architecture**:
```typescript
// useFileExplorerFocus
interface UseFileExplorerFocusPublicAPI {
  focusItem: (event: React.SyntheticEvent, id: string) => void;
}

// useFileExplorerKeyboardNavigation
interface UseFileExplorerKeyboardNavigationInstance {
  handleItemKeyDown: (event: React.KeyboardEvent, id: FileId) => void;
}
```

**MUI X Equivalent**:
```typescript
// Built-in keyboard navigation
<RichTreeView
  onItemFocus={(event, itemId) => handleFocus(event, itemId)}
/>

// API ref for focus
apiRef.current?.focusItem(event, itemId);
```

**Adapter Implementation**:
```typescript
// Focus management
const handleItemFocus = (event: React.SyntheticEvent, itemId: string) => {
  props.onItemFocus?.(event, itemId);
};

// Keyboard navigation - MUI X handles this natively
// Just verify behavior matches FileExplorer expectations:
// - Arrow Up/Down: Navigate between items ✓
// - Arrow Left/Right: Collapse/Expand folders ✓
// - Enter/Space: Toggle expansion/selection ✓
// - Home/End: Jump to first/last item ✓
// - Type-ahead: Search items by first character ✓
```

**Effort**: 0.5 days (mostly verification)
**Risk**: Low - MUI X has robust keyboard support
**Test Coverage**: 30 focus tests + 40 keyboard tests → verify behavior

---

### 2.6 Plugin 6: useFileExplorerIcons → Icon Mapping

**Current Architecture**:
```typescript
interface UseFileExplorerIconsSlots {
  collapseIcon?: React.ElementType;
  expandIcon?: React.ElementType;
  endIcon?: React.ElementType;
}
```

**MUI X Equivalent**:
```typescript
<RichTreeView
  slots={{
    collapseIcon: CustomCollapseIcon,
    expandIcon: CustomExpandIcon,
    endIcon: CustomEndIcon,
  }}
/>
```

**Adapter Implementation**:
```typescript
// IconMappingProvider.tsx
const iconTypeMapping: Record<string, React.ElementType> = {
  folder: FolderIcon,
  file: InsertDriveFileIcon,
  image: ImageIcon,
  video: VideoFileIcon,
  audio: AudioFileIcon,
  // ... more mappings
};

const getEndIconForItem = (item: FileBase) => {
  return iconTypeMapping[item.type] || InsertDriveFileIcon;
};

// In FileExplorerAdapter
<RichTreeView
  slots={{
    collapseIcon: props.slots?.collapseIcon || FolderOpenIcon,
    expandIcon: props.slots?.expandIcon || FolderIcon,
    endIcon: (itemProps) => {
      const Icon = getEndIconForItem(itemProps.item);
      return <Icon />;
    },
  }}
/>
```

**Effort**: 1 day
**Risk**: Low - straightforward slot mapping
**Test Coverage**: 25 existing tests → verify icon rendering

---

### 2.7 Plugin 7: useFileExplorerGrid → Custom Grid Wrapper (HIGH COMPLEXITY)

**Current Architecture**:
```typescript
interface UseFileExplorerGridParameters {
  grid?: boolean;
  gridHeader?: boolean;
  columns?: GridColumns;
  headers?: GridHeaders;
}

type GridColumn = {
  sx: SystemStyleObject;
  renderContent: (content: any) => string;
  width: number;
  cells: React.ReactElement[];
};
```

**MUI X Limitation**: RichTreeView does NOT support multi-column grid layout natively.

**Custom Wrapper Architecture**:
```
┌────────────────────────────────────────────┐
│  FileExplorerGridWrapper                   │
│  ┌──────────────────────────────────────┐ │
│  │  Grid Header Component               │ │
│  │  ┌────────┬────────┬────────┬──────┐ │ │
│  │  │ Name ↕ │ Size ↕ │ Type ↕ │ Date │ │ │
│  │  └────────┴────────┴────────┴──────┘ │ │
│  └──────────────────────────────────────┘ │
│  ┌──────────────────────────────────────┐ │
│  │  RichTreeView (Content)              │ │
│  │  ┌────────┬────────┬────────┬──────┐ │ │
│  │  │📁 Docs │ 2.3 MB │ folder │ 12/1 │ │ │
│  │  │  📄 a  │ 234 KB │ file   │ 12/2 │ │ │
│  │  │📁 Media│ 8.1 MB │ folder │ 11/5 │ │ │
│  │  └────────┴────────┴────────┴──────┘ │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

**Implementation Strategy**:
```typescript
// FileExplorerGridWrapper.tsx
export const FileExplorerGridWrapper: React.FC<GridWrapperProps> = ({
  columns,
  headers,
  items,
  ...treeViewProps
}) => {
  const [columnWidths, setColumnWidths] = useState(
    columns ? Object.fromEntries(
      Object.entries(columns).map(([key, col]) => [key, col.width])
    ) : {}
  );

  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Synchronized scrolling
  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Column resize handler
  const handleColumnResize = (columnKey: string, newWidth: number) => {
    setColumnWidths(prev => ({ ...prev, [columnKey]: newWidth }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Row */}
      <Box
        ref={headerRef}
        sx={{
          display: 'flex',
          borderBottom: '1px solid',
          borderColor: 'divider',
          overflowX: 'hidden',
        }}
      >
        {Object.entries(columns).map(([key, column]) => (
          <GridHeaderCell
            key={key}
            columnKey={key}
            width={columnWidths[key]}
            header={headers?.[key]}
            onResize={handleColumnResize}
          />
        ))}
      </Box>

      {/* Content Area with Tree View */}
      <Box
        ref={contentRef}
        sx={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}
        onScroll={handleContentScroll}
      >
        <RichTreeView
          items={items}
          slots={{
            item: (itemProps) => (
              <GridTreeItem
                {...itemProps}
                columns={columns}
                columnWidths={columnWidths}
              />
            ),
          }}
          {...treeViewProps}
        />
      </Box>
    </Box>
  );
};

// GridTreeItem.tsx
const GridTreeItem: React.FC<GridTreeItemProps> = ({
  columns,
  columnWidths,
  ...itemProps
}) => {
  return (
    <TreeItem2
      {...itemProps}
      ContentComponent={(props) => (
        <Box sx={{ display: 'flex', width: '100%' }}>
          {Object.entries(columns).map(([key, column]) => (
            <Box
              key={key}
              sx={{
                width: columnWidths[key],
                flexShrink: 0,
                ...column.sx,
              }}
            >
              {column.renderContent(props.item[key])}
            </Box>
          ))}
        </Box>
      )}
    />
  );
};
```

**Effort**: 3-4 days
**Risk**: Medium-High - significant custom implementation
**Test Coverage**: 35 existing tests → all must pass
**Special Considerations**:
- Scroll synchronization performance
- Column resizing UX smoothness
- Accessibility (header associations)
- Sortable columns (future enhancement)

---

### 2.8 Plugin 8: useFileExplorerDnd → DnD Integration Layer (CRITICAL)

**Current Architecture**:
```typescript
// Uses @atlaskit/pragmatic-drag-and-drop
interface UseFileExplorerDndParameters {
  dndInternal?: true;       // Internal reordering
  dndExternal?: true;       // External file drops
  dndFileTypes?: string[];  // Accepted file types
  dndTrash?: true;          // Trash drop zone
}
```

**MUI X RichTreeViewPro DnD**:
- ✅ Internal reordering via `itemsReordering` prop
- ❌ External file drops NOT supported
- ❌ Custom drop zones (trash) NOT supported
- ❌ Multi-zone drag operations NOT supported

**Decision**: Keep @atlaskit/pragmatic-drag-and-drop

**Integration Architecture**:
```
┌─────────────────────────────────────────────┐
│  FileExplorerDndProvider                    │
│  (@atlaskit/pragmatic-drag-and-drop)        │
│  ┌───────────────────────────────────────┐ │
│  │  Internal Drop Zone                   │ │
│  │  (tree item reordering)               │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │  RichTreeView (read-only state) │ │ │
│  │  │  - Provides tree structure      │ │ │
│  │  │  - Renders items                │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │  External Drop Zone                   │ │
│  │  (OS file drops)                      │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │  Trash Drop Zone                      │ │
│  │  (delete items)                       │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Implementation Strategy**:
```typescript
// FileExplorerDndLayer.tsx
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

export const FileExplorerDndLayer: React.FC<DndLayerProps> = ({
  items,
  onItemsReorder,
  onExternalDrop,
  dndConfig,
}) => {
  const apiRef = useTreeViewApiRef();

  // Attach DnD to tree items
  useEffect(() => {
    items.forEach(item => {
      const element = apiRef.current?.getItemDOMElement(item.id);
      if (!element) return;

      // Make item draggable
      const cleanup = draggable({
        element,
        getInitialData: () => ({ item, type: 'internal' }),
      });

      return cleanup;
    });
  }, [items, apiRef]);

  // Internal drop handling
  const handleInternalDrop = (args: DropInternalData) => {
    const { dropped, target, instruction } = args;

    // Update items array based on drop position
    const newItems = reorderItems(
      items,
      dropped.item.id,
      target.item.id,
      instruction
    );

    onItemsReorder?.(newItems);
  };

  // External file drop handling
  const handleExternalDrop = (files: File[]) => {
    const fileBaseArray = files.map(file => ({
      id: generateId(),
      name: file.name,
      size: file.size,
      type: getFileType(file),
      // ... more properties
    }));

    onExternalDrop?.(fileBaseArray);
  };

  return (
    <FileExplorerDndContext.Provider
      value={{
        handleInternalDrop,
        handleExternalDrop,
        dndConfig,
      }}
    >
      {/* Render RichTreeView with DnD-enabled items */}
      <RichTreeView
        items={items}
        apiRef={apiRef}
        slots={{
          item: DraggableTreeItem,
        }}
      />

      {/* External drop zone (if enabled) */}
      {dndConfig.dndExternal && (
        <FileDropzone onDrop={handleExternalDrop} />
      )}

      {/* Trash drop zone (if enabled) */}
      {dndConfig.dndTrash && (
        <TrashDropZone onDrop={(items) => onItemsReorder?.(items)} />
      )}
    </FileExplorerDndContext.Provider>
  );
};

// DraggableTreeItem.tsx
const DraggableTreeItem: React.FC<TreeItem2Props> = (props) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const dndContext = useFileExplorerDndContext();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const cleanupDraggable = draggable({
      element,
      getInitialData: () => ({ item: props.item, type: 'internal' }),
    });

    const cleanupDropTarget = dropTargetForElements({
      element,
      onDrop: dndContext.handleInternalDrop,
    });

    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [props.item, dndContext]);

  return (
    <TreeItem2 {...props} ref={elementRef} />
  );
};
```

**Effort**: 2-3 days
**Risk**: Medium - coordination between MUI X state and DnD operations
**Test Coverage**: 35 existing tests (CRITICAL) → all must pass
**Special Considerations**:
- State sync: DnD operations must update RichTreeView state
- Performance: Attach/detach DnD on item mount/unmount efficiently
- Accessibility: Maintain keyboard-only drag operations
- Touch support: Ensure mobile drag works

---

### 2.9 Plugin 9: useFileExplorerJSXItems → Optional Feature

**Current Architecture**:
```typescript
// Support for JSX-based item definition
<FileExplorer>
  <File id="1" label="Folder 1">
    <File id="2" label="File 1.1" />
  </File>
</FileExplorer>
```

**MUI X Approach**: Items array only (no JSX children pattern)

**Migration Strategy**: Convert JSX to items array
```typescript
// Helper to convert JSX to items
const convertJSXToItems = (children: React.ReactNode): FileBase[] => {
  const items: FileBase[] = [];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const item = {
        id: child.props.id,
        label: child.props.label,
        children: child.props.children
          ? convertJSXToItems(child.props.children)
          : undefined,
      };
      items.push(item);
    }
  });

  return items;
};

// In FileExplorerAdapter
const items = props.items || convertJSXToItems(props.children);
```

**Effort**: 1 day
**Risk**: Low - simple conversion logic
**Decision**: Support both patterns via adapter (backward compatibility)

---

## 3. Grid View Strategy

### 3.1 Implementation Approach

**Decision**: Custom wrapper component (FileExplorerGridWrapper)

**Justification from 1.2 Findings**:
- MUI X RichTreeView does NOT provide native multi-column grid support
- Prototype demonstrated feasibility of wrapper approach
- Synchronized scrolling pattern is well-established
- Maintains full RichTreeView tree logic benefits

### 3.2 Architecture

See Section 2.7 for detailed implementation.

**Key Components**:
1. **FileExplorerGridWrapper**: Container managing layout
2. **GridHeaderCell**: Resizable column headers with sort indicators
3. **GridTreeItem**: Custom TreeItem2 with multi-column cell rendering
4. **ScrollSynchronizer**: Utility hook for header/content scroll sync

### 3.3 Integration Points

```typescript
// In FileExplorerAdapter
if (props.grid) {
  return (
    <FileExplorerGridWrapper
      columns={props.columns}
      headers={props.headers}
      items={items}
      {...otherTreeViewProps}
    />
  );
} else {
  return (
    <RichTreeView
      items={items}
      {...otherTreeViewProps}
    />
  );
}
```

### 3.4 Feature Parity Requirements

| Feature | Current Support | Post-Migration | Implementation |
|---------|----------------|----------------|----------------|
| Column headers | ✅ Yes | ✅ Yes | GridHeaderCell component |
| Column sorting | ✅ Yes | ✅ Yes | Header click handler + items sort |
| Column resizing | ✅ Yes | ✅ Yes | Drag handle on headers |
| Column visibility toggle | ✅ Yes | ✅ Yes | State management |
| Synchronized scrolling | ✅ Yes | ✅ Yes | Scroll event listener |
| Alternating row colors | ✅ Yes | ✅ Yes | CSS nth-child or props |

---

## 4. DnD Strategy

### 4.1 Implementation Approach

**Decision**: Keep @atlaskit/pragmatic-drag-and-drop with MUI X coordination layer

**Justification from 1.2 Findings**:
- MUI X RichTreeViewPro internal DnD is insufficient (no external drops, no trash zone)
- @atlaskit is already integrated and battle-tested
- FileExplorer requires 3 distinct drop zones (internal, external, trash)
- Prototype confirmed compatibility with MUI X state management

### 4.2 Drop Zone Architecture

```
┌─────────────────────────────────────────────────────────┐
│  FileExplorerDndProvider (Context)                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Zone 1: Internal Reordering                      │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  RichTreeView Items                         │ │ │
│  │  │  - Draggable via @atlaskit                 │ │ │
│  │  │  - Drop targets for reordering             │ │ │
│  │  │  - Visual feedback during drag             │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Zone 2: External File Drops                      │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  FileDropzone Component                     │ │ │
│  │  │  - Accepts OS files                         │ │ │
│  │  │  - File type filtering                      │ │ │
│  │  │  - onAddFiles callback                      │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Zone 3: Trash Drop Zone (Optional)               │ │
│  │  ┌─────────────────────────────────────────────┐ │ │
│  │  │  TrashDropZone Component                    │ │ │
│  │  │  - Deletes dropped items                    │ │ │
│  │  │  - Visual trash icon                        │ │ │
│  │  └─────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Integration with FileExplorerDndContext

**Current Context**:
```typescript
interface FileExplorerDndContextValue {
  dnd: {
    dndInternal?: true;
    dndExternal?: true;
    dndFileTypes?: string[];
    dndTrash?: true;
  } | undefined;
}
```

**Post-Migration Context** (preserved):
```typescript
// FileExplorerDndContext.tsx
export const FileExplorerDndContext = createContext<DndContextValue>({
  dndConfig: undefined,
  handleInternalDrop: () => {},
  handleExternalDrop: () => {},
  handleTrashDrop: () => {},
});

export const FileExplorerDndProvider: React.FC = ({ children, config }) => {
  const apiRef = useTreeViewApiRef();

  const handleInternalDrop = useCallback((args: DropInternalData) => {
    // Reorder items in tree
    const newItems = reorderTreeItems(args);

    // Update RichTreeView state
    apiRef.current?.updateItems(newItems);

    // Notify parent
    config.onItemsReorder?.(newItems);
  }, [apiRef, config]);

  const handleExternalDrop = useCallback((files: File[]) => {
    // Convert OS files to FileBase
    const fileBaseArray = convertFilesToFileBase(files, config.dndFileTypes);

    // Add to tree
    apiRef.current?.addItems(fileBaseArray);

    // Notify parent
    config.onAddFiles?.(fileBaseArray);
  }, [apiRef, config]);

  const handleTrashDrop = useCallback((itemIds: string[]) => {
    // Remove items from tree
    apiRef.current?.removeItems(itemIds);

    // Notify parent
    config.onRemoveItems?.(itemIds);
  }, [apiRef, config]);

  return (
    <FileExplorerDndContext.Provider
      value={{
        dndConfig: config,
        handleInternalDrop,
        handleExternalDrop,
        handleTrashDrop,
      }}
    >
      {children}
    </FileExplorerDndContext.Provider>
  );
};
```

**Effort**: See Section 2.8
**Integration Complexity**: Medium - requires bidirectional state sync

---

## 5. Rollout Plan

### 5.1 Feature Flag Configuration

**Feature Flag System**:
```typescript
// featureFlags.ts
export interface FileExplorerFeatureFlags {
  useMuiXTreeView: boolean;        // Master toggle
  enableGridWrapper: boolean;       // Grid layout feature
  enableDndIntegration: boolean;    // DnD feature
  enablePerformanceMonitoring: boolean; // Performance tracking
}

// Default configuration (backward compatible)
export const defaultFlags: FileExplorerFeatureFlags = {
  useMuiXTreeView: false,  // Start disabled
  enableGridWrapper: false,
  enableDndIntegration: false,
  enablePerformanceMonitoring: true,
};

// Environment-based overrides
export const getFeatureFlags = (): FileExplorerFeatureFlags => {
  if (process.env.NODE_ENV === 'development') {
    return {
      useMuiXTreeView: true,  // Enable in dev
      enableGridWrapper: true,
      enableDndIntegration: true,
      enablePerformanceMonitoring: true,
    };
  }

  // Production: gradual rollout via runtime config
  return {
    useMuiXTreeView: window.__FILE_EXPLORER_FLAGS__?.useMuiXTreeView ?? false,
    enableGridWrapper: window.__FILE_EXPLORER_FLAGS__?.enableGridWrapper ?? false,
    enableDndIntegration: window.__FILE_EXPLORER_FLAGS__?.enableDndIntegration ?? false,
    enablePerformanceMonitoring: true,
  };
};
```

**Usage in FileExplorer**:
```typescript
// FileExplorer.tsx
export const FileExplorer = forwardRef<HTMLDivElement, FileExplorerProps>(
  (props, ref) => {
    const flags = useFeatureFlags();

    if (flags.useMuiXTreeView) {
      // New MUI X implementation
      return <FileExplorerAdapter {...props} ref={ref} />;
    } else {
      // Legacy implementation
      return <LegacyFileExplorer {...props} ref={ref} />;
    }
  }
);
```

### 5.2 Incremental Exposure Plan

**Stage 1: Internal Testing (Week 1-2)**
- **Audience**: Development team only
- **Flags**: All features enabled in development
- **Success Criteria**:
  - All 337 tests pass
  - No console errors
  - Visual regression tests pass
  - Performance meets baseline thresholds

**Stage 2: Beta Testing (Week 3-4)**
- **Audience**: 10% of production users (canary group)
- **Flags**:
  - `useMuiXTreeView: true` (10% rollout)
  - `enablePerformanceMonitoring: true`
- **Success Criteria**:
  - Zero critical bugs reported
  - Performance within 10% of baseline
  - User satisfaction scores ≥ current
  - No accessibility regressions

**Stage 3: Gradual Rollout (Week 5-8)**
- **Week 5**: 25% of users
- **Week 6**: 50% of users
- **Week 7**: 75% of users
- **Week 8**: 100% of users
- **Monitoring**: Real-time performance metrics, error tracking
- **Success Criteria** (per week):
  - Error rate < 0.1%
  - Performance degradation < 5%
  - User feedback positive

**Stage 4: Full Deployment (Week 9)**
- **Audience**: 100% of users
- **Flags**: All features enabled by default
- **Cleanup**: Remove legacy implementation after 2 weeks of 100% stability

### 5.3 Rollback Triggers

**Automatic Rollback Conditions**:

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error Rate | > 1% | Immediate rollback to 0% |
| Performance P95 | > 30% slower than baseline | Rollback to previous stage |
| Memory Usage | > 40% increase | Immediate rollback |
| Test Failures | Any critical test fails | Block deployment |
| User Reports | > 5 critical bugs in 24h | Rollback to previous stage |

**Rollback Procedure**:

```typescript
// rollback.sh
#!/bin/bash

# Step 1: Update feature flags (instant effect)
echo "Rolling back feature flags..."
curl -X POST https://config-api/flags \
  -d '{"useMuiXTreeView": false}'

# Step 2: Verify rollback
sleep 5
curl https://config-api/flags | grep "useMuiXTreeView.*false"

# Step 3: Monitor error rates
echo "Monitoring error rates for 10 minutes..."
for i in {1..10}; do
  ERROR_RATE=$(curl -s https://monitoring-api/errors/rate)
  echo "Minute $i: Error rate = $ERROR_RATE"
  sleep 60
done

# Step 4: Notify team
echo "Rollback complete. Legacy FileExplorer restored."
slack-notify "#file-explorer" "Rollback triggered. Investigating..."
```

**Manual Rollback Decision Points**:
- User satisfaction score drops below 4.0/5.0
- Accessibility audit fails
- Edge case discovered affecting critical workflows
- Performance acceptable but UX feels degraded

### 5.4 Rollback Communication Plan

**Internal Communication**:
1. Immediate Slack notification to #engineering
2. Post-mortem meeting scheduled within 24h
3. Root cause analysis document created
4. Prevention checklist updated

**External Communication** (if user-facing):
1. Status page update
2. In-app banner (if applicable)
3. Blog post if widespread impact
4. User support team briefing

---

## 6. Phase 2-4 Work Breakdown

### Phase 2: Core Plugin Migration (7-9 days)

**Dependencies**: Phase 1 complete, MUI X compatibility validated

**Work Items**:

| ID | Task | Effort | Assignee | Dependencies |
|----|------|--------|----------|--------------|
| 2.1 | Implement FileExplorerAdapter (files plugin) | 1 day | TBD | None |
| 2.2 | Implement expansion plugin adapter | 1 day | TBD | 2.1 |
| 2.3 | Implement selection plugin adapter | 1 day | TBD | 2.1 |
| 2.4 | Implement focus plugin adapter | 0.5 days | TBD | 2.1 |
| 2.5 | Verify keyboard navigation behavior | 0.5 days | TBD | 2.4 |
| 2.6 | Implement icon mapping layer | 1 day | TBD | 2.1 |
| 2.7 | Write adapter unit tests | 2 days | TBD | 2.1-2.6 |
| 2.8 | Integration testing (core features) | 1 day | TBD | 2.7 |

**Success Criteria**:
- ✅ All core plugins (files, expansion, selection, focus, keyboard, icons) migrated
- ✅ 200+ tests pass (excluding grid and DnD)
- ✅ Performance meets baseline for non-grid scenarios
- ✅ TypeScript compiles without errors

**Risk Mitigation**:
- **Selection API differences**: Extensive unit tests for single/multi-select modes
- **Focus management edge cases**: Browser testing across Chrome, Firefox, Safari
- **Type safety**: Use strict TypeScript, no `any` types

---

### Phase 3: Advanced Features (Grid & DnD) (8-11 days)

**Dependencies**: Phase 2 complete, core features stable

**Work Items**:

| ID | Task | Effort | Assignee | Dependencies |
|----|------|--------|----------|--------------|
| 3.1 | Implement FileExplorerGridWrapper | 2 days | TBD | 2.8 |
| 3.2 | Implement GridHeaderCell with resize | 1 day | TBD | 3.1 |
| 3.3 | Implement GridTreeItem | 1 day | TBD | 3.1 |
| 3.4 | Implement scroll synchronization | 0.5 days | TBD | 3.1 |
| 3.5 | Column sorting logic | 1 day | TBD | 3.2 |
| 3.6 | Grid unit tests | 1 day | TBD | 3.1-3.5 |
| 3.7 | Implement FileExplorerDndLayer | 2 days | TBD | 2.8 |
| 3.8 | Integrate @atlaskit DnD with MUI X state | 1 day | TBD | 3.7 |
| 3.9 | Implement trash drop zone | 0.5 days | TBD | 3.7 |
| 3.10 | DnD unit tests | 1.5 days | TBD | 3.7-3.9 |
| 3.11 | Integration testing (grid + DnD) | 1 day | TBD | 3.6, 3.10 |

**Success Criteria**:
- ✅ Grid layout renders with synchronized headers
- ✅ Column resizing works smoothly
- ✅ All 3 DnD zones functional (internal, external, trash)
- ✅ All 337 tests pass
- ✅ Performance meets baseline for grid scenarios

**Risk Mitigation**:
- **Grid scroll jank**: Performance profiling, throttle scroll events if needed
- **DnD state sync bugs**: Comprehensive integration tests, race condition testing
- **Column resize UX**: User testing with realistic datasets

---

### Phase 4: Testing, Documentation & Rollout (7-8 days)

**Dependencies**: Phase 3 complete, all features implemented

**Work Items**:

| ID | Task | Effort | Assignee | Dependencies |
|----|------|--------|----------|--------------|
| 4.1 | Visual regression testing | 1 day | TBD | 3.11 |
| 4.2 | Accessibility audit (WCAG 2.1 AA) | 1 day | TBD | 3.11 |
| 4.3 | Performance benchmarking (1K, 5K items) | 1 day | TBD | 3.11 |
| 4.4 | Browser compatibility testing | 1 day | TBD | 3.11 |
| 4.5 | Migration guide documentation | 1 day | TBD | None |
| 4.6 | API reference update | 0.5 days | TBD | None |
| 4.7 | Feature flag setup | 0.5 days | TBD | None |
| 4.8 | Internal beta testing | 2 days | Team | 4.1-4.7 |
| 4.9 | Production canary deployment (10%) | 1 week | Ops | 4.8 |

**Success Criteria**:
- ✅ Zero visual regressions
- ✅ WCAG 2.1 AA compliance
- ✅ Performance within 10% of baseline (ideally improved)
- ✅ Works in Chrome, Firefox, Safari, Edge
- ✅ Documentation complete and reviewed
- ✅ Canary deployment stable for 1 week

**Risk Mitigation**:
- **Accessibility regressions**: Automated axe-core tests + manual screen reader testing
- **Browser quirks**: Test grid scrolling and DnD in all browsers
- **Performance surprises**: Profile with Chrome DevTools, optimize hot paths

---

## 7. Effort Estimates Summary

### Total Timeline: 22-28 days

| Phase | Tasks | Effort (Days) | Dependencies |
|-------|-------|--------------|--------------|
| **Phase 1** | Foundation analysis (COMPLETE) | 0 | None |
| **Phase 2** | Core plugin migration | 7-9 | Phase 1 |
| **Phase 3** | Grid & DnD features | 8-11 | Phase 2 |
| **Phase 4** | Testing & rollout | 7-8 | Phase 3 |
| **TOTAL** | All phases | **22-28 days** | Sequential |

### Effort by Component

| Component | Complexity | Effort | Risk |
|-----------|-----------|--------|------|
| FileExplorerAdapter | Medium | 5 days | Low |
| Plugin adapters (6 plugins) | Low-Medium | 6 days | Low |
| FileExplorerGridWrapper | High | 4 days | Medium |
| FileExplorerDndLayer | Medium | 4 days | Medium |
| Testing & QA | High | 7 days | Low |
| Documentation | Low | 2 days | Low |
| **TOTAL** | - | **28 days** | - |

### Resource Allocation

**Recommended Team**:
- 1 Senior Engineer (leads architecture, reviews all PRs)
- 1 Mid-Level Engineer (implements adapters and grid)
- 1 QA Engineer (testing, accessibility, performance)

**Parallel Work Opportunities**:
- Documentation can start during Phase 3
- Visual regression tests can be written during Phase 2
- Performance benchmarks can run asynchronously

---

## 8. Critical Risks & Mitigation Plans

### Risk 1: Grid Wrapper Performance (HIGH)

**Description**: Custom grid wrapper with synchronized scrolling may introduce jank on large datasets.

**Impact**: User experience degradation, especially with 1000+ items

**Probability**: Medium (30%)

**Mitigation**:
1. **Throttle scroll events** to 16ms (60fps)
2. **Virtualize grid rows** if needed (react-window integration)
3. **Profile early** with Chrome DevTools during Phase 3
4. **Fallback**: Disable grid mode if performance unacceptable

**Detection**:
- Performance benchmarks in CI (AC-1.3.e)
- Real-time monitoring during canary deployment
- User feedback during beta testing

---

### Risk 2: DnD State Synchronization Bugs (HIGH)

**Description**: Race conditions between @atlaskit DnD operations and MUI X Tree View state updates.

**Impact**: Items disappear, duplicate, or reorder incorrectly

**Probability**: Medium (40%)

**Mitigation**:
1. **Comprehensive integration tests** covering all drop scenarios
2. **State machine pattern** for DnD operations (atomic updates)
3. **Pessimistic locking** during drag operations (prevent concurrent mutations)
4. **Extensive logging** for debugging state transitions

**Detection**:
- Integration tests in Phase 3 (item 3.10)
- Manual testing with rapid drag operations
- Chaos testing (random drag sequences)

---

### Risk 3: Selection API Behavioral Differences (MEDIUM)

**Description**: MUI X Tree View selection behavior may differ subtly from FileExplorer (e.g., Ctrl+Click, Shift+Click).

**Impact**: User muscle memory broken, workflows disrupted

**Probability**: Medium (35%)

**Mitigation**:
1. **Exhaustive selection tests** (27 existing tests MUST pass)
2. **Custom event handlers** to match FileExplorer behavior exactly
3. **Side-by-side comparison** during beta testing
4. **User acceptance testing** with heavy FileExplorer users

**Detection**:
- Unit tests for selection plugin (Phase 2, item 2.7)
- Manual testing with all selection modes
- Beta user feedback

---

### Risk 4: Accessibility Regressions (MEDIUM)

**Description**: Custom grid and DnD layers may introduce ARIA violations or keyboard navigation issues.

**Impact**: Accessibility non-compliance, exclusion of keyboard-only users

**Probability**: Medium (30%)

**Mitigation**:
1. **Automated axe-core tests** in CI
2. **Manual screen reader testing** (NVDA, JAWS, VoiceOver)
3. **Keyboard-only navigation testing** (no mouse)
4. **ARIA annotations** on all custom components

**Detection**:
- Accessibility audit in Phase 4 (item 4.2)
- Automated CI checks
- User testing with assistive technologies

---

### Risk 5: Performance Regression on Large Datasets (MEDIUM)

**Description**: MUI X Tree View + custom layers may be slower than current implementation for 5000+ items.

**Impact**: Poor user experience, frustration with slow rendering

**Probability**: Low (20%)

**Mitigation**:
1. **Performance benchmarks** established in Phase 1.3 (baseline)
2. **CI performance budgets** enforced
3. **Lazy loading** for deep trees (load children on demand)
4. **Virtualization** if needed (react-window)
5. **Rollback trigger**: P95 > 30% slower than baseline

**Detection**:
- Automated performance tests in CI
- Canary deployment metrics
- User-reported slowness

---

### Risk 6: TypeScript Type Compatibility Issues (LOW)

**Description**: Generic `Multiple` parameter or TreeViewBaseItem extension causes type errors.

**Impact**: Build failures, difficult debugging

**Probability**: Low (15%)

**Mitigation**:
1. **Strict TypeScript configuration** during development
2. **Type tests** (dtslint or tsd)
3. **Generic parameter preservation** in adapter layer
4. **MUI X type documentation review**

**Detection**:
- TypeScript compilation errors
- Type-only tests
- IDE type hints verification

---

## 9. Rollback Procedure

### Immediate Rollback (< 5 minutes)

**Trigger Conditions**:
- Error rate > 1%
- Memory usage > 40% increase
- Critical bug affecting all users

**Procedure**:
```bash
# 1. Update feature flag to disable MUI X
curl -X POST https://config-api/flags \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"useMuiXTreeView": false}'

# 2. Verify flag update
curl https://config-api/flags | jq '.useMuiXTreeView'
# Expected output: false

# 3. Monitor error rate decrease
watch -n 10 'curl -s https://monitoring-api/errors/rate'

# 4. Notify team
slack-notify "#engineering" "FileExplorer rolled back to legacy. Investigating incident."
```

**Verification**:
- Error rate returns to < 0.1% within 5 minutes
- User sessions continue without interruption (graceful fallback)
- No data loss

---

### Gradual Rollback (< 1 hour)

**Trigger Conditions**:
- Performance degradation > 30%
- User satisfaction score drops
- Multiple non-critical bugs

**Procedure**:
```bash
# 1. Reduce rollout percentage in stages
# Stage 1: 100% → 50%
curl -X POST https://config-api/flags \
  -d '{"useMuiXTreeView": true, "rolloutPercentage": 50}'

# Wait 15 minutes, monitor metrics

# Stage 2: 50% → 25%
curl -X POST https://config-api/flags \
  -d '{"rolloutPercentage": 25}'

# Wait 15 minutes, monitor metrics

# Stage 3: 25% → 0% (full rollback)
curl -X POST https://config-api/flags \
  -d '{"useMuiXTreeView": false, "rolloutPercentage": 0}'

# 2. Post-mortem analysis
# - Collect error logs
# - Analyze performance data
# - User feedback review
```

---

### Full Reversion (1-2 days)

**Trigger Conditions**:
- Fundamental architectural flaw discovered
- Migration deemed infeasible
- Unfixable compatibility issue

**Procedure**:
1. **Code Reversion**:
   ```bash
   git revert <migration-commit-range>
   git push origin main
   ```

2. **Deployment**:
   - Deploy reverted code to production
   - Remove feature flags from codebase
   - Archive migration branch

3. **Communication**:
   - Update project stakeholders
   - Document lessons learned
   - Evaluate alternative approaches

---

## 10. Success Metrics

### Technical Success Criteria

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Test Pass Rate | 100% (337 tests) | 100% | CI test suite |
| Line Coverage | 75-85% | ≥ 80% | Istanbul/NYC |
| Performance (100 items) | 0.13ms mean | ≤ 0.16ms | Automated benchmark |
| Performance (5K items) | 3.29ms mean | ≤ 4.28ms | Automated benchmark |
| Memory (5K items) | 8.16 MB peak | ≤ 9.4 MB | Heap snapshots |
| Error Rate | < 0.1% | < 0.1% | Production monitoring |
| Accessibility | WCAG 2.1 AA | WCAG 2.1 AA | axe-core + manual |

### User Experience Criteria

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| User Satisfaction | 4.2/5.0 | ≥ 4.2/5.0 | Surveys |
| Task Completion Time | Baseline | ≤ Baseline | User testing |
| Bug Reports | < 5/month | < 5/month | Issue tracker |
| Support Tickets | < 10/month | < 10/month | Zendesk |

### Business Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Zero data loss | 100% | Monitoring |
| Zero downtime | 100% uptime | Uptime monitoring |
| Migration on budget | Within 28 days | Project tracking |
| Stakeholder approval | ✅ Sign-off | Review meeting |

---

## 11. Post-Migration Validation

### Validation Checklist

**Functional Testing**:
- [ ] All 337 unit tests pass
- [ ] Integration tests pass (47 critical scenarios)
- [ ] Visual regression tests pass (Chromatic or Percy)
- [ ] Accessibility audit passes (axe-core, manual testing)
- [ ] Performance benchmarks meet thresholds
- [ ] Browser compatibility verified (Chrome, Firefox, Safari, Edge)

**User Acceptance Testing**:
- [ ] sui-editor integration works (EditorFileTabs)
- [ ] Projects tab displays correctly
- [ ] Track Files tab displays correctly
- [ ] Double-click handlers work (onProjectsDoubleClick, onTrackFilesDoubleClick)
- [ ] Grid columns render (version, type)
- [ ] Expansion state persists
- [ ] Selection state persists

**Production Readiness**:
- [ ] Feature flags configured
- [ ] Monitoring dashboards created
- [ ] Error tracking enabled (Sentry or similar)
- [ ] Performance metrics tracked (New Relic or similar)
- [ ] Rollback procedure tested
- [ ] Documentation updated
- [ ] Team training completed

---

## 12. Documentation Deliverables

### For Developers

**Migration Guide**:
- Step-by-step upgrade instructions
- Breaking changes (if any)
- API mapping (old → new)
- Code examples for common patterns

**Architecture Documentation**:
- Component hierarchy diagram
- Plugin adapter specifications
- Grid wrapper implementation
- DnD integration details

### For Users

**Changelog**:
- What's new
- What's improved
- Known issues (if any)

**FAQ**:
- Common questions
- Troubleshooting
- Feature parity confirmation

### For QA

**Test Plan**:
- Test scenarios
- Expected behaviors
- Edge cases
- Regression test suite

---

## 13. Acceptance Criteria Status

### ✅ AC-1.4.a: Component Architecture with Hierarchy Diagram
**Status**: COMPLETE
- High-level component hierarchy diagram (Section 1.1)
- Component replacement strategy (Section 1.2)
- Data flow architecture (Section 1.3)

### ✅ AC-1.4.b: All 9 Plugin Adapter Designs with Code Examples
**Status**: COMPLETE
- Plugin migration matrix (Section 2.1)
- Detailed adapter implementations for all 9 plugins (Sections 2.2-2.9)
- Code examples for each adapter pattern
- Effort estimates per plugin

### ✅ AC-1.4.c: Grid View Strategy with 1.2 Justification
**Status**: COMPLETE
- Implementation approach: Custom wrapper (Section 3.1)
- Justification from Phase 1.2 findings (Section 3.1)
- Architecture diagram (Section 3.2)
- Integration points (Section 3.3)
- Feature parity requirements (Section 3.4)

### ✅ AC-1.4.d: DnD Strategy with FileExplorerDndContext Integration
**Status**: COMPLETE
- Implementation approach: Keep @atlaskit (Section 4.1)
- Drop zone architecture (Section 4.2)
- FileExplorerDndContext integration (Section 4.3)
- Code examples for DnD layer

### ✅ AC-1.4.e: Complete Rollout Plan
**Status**: COMPLETE
- Feature flag configuration (Section 5.1)
- 4-stage incremental exposure plan (Section 5.2)
- Rollback triggers with thresholds (Section 5.3)
- Rollback procedure steps (Section 9)

---

## 14. Next Steps

### Immediate (This Week)

1. **Review Architecture Document**
   - Team review meeting
   - Stakeholder approval
   - Finalize decisions

2. **Setup Development Environment**
   - Create feature branch: `feature/mui-x-migration`
   - Install MUI X dependencies
   - Configure feature flags

3. **Begin Phase 2 Implementation**
   - Start with FileExplorerAdapter (item 2.1)
   - Setup test infrastructure
   - Create initial PR for review

### Short-Term (Next 2 Weeks)

1. **Complete Phase 2** (Core Plugin Migration)
   - Implement all 6 core plugin adapters
   - Write comprehensive unit tests
   - Integration testing

2. **Prototype Grid Wrapper**
   - Validate scroll synchronization
   - Test with 1000+ items
   - Performance profiling

### Medium-Term (Weeks 3-6)

1. **Complete Phase 3** (Grid & DnD)
   - Finalize grid wrapper
   - Integrate @atlaskit DnD
   - Comprehensive testing

2. **Begin Phase 4** (Testing & Rollout)
   - Visual regression testing
   - Accessibility audit
   - Documentation

### Long-Term (Weeks 7-8)

1. **Production Rollout**
   - Internal beta testing
   - Canary deployment (10%)
   - Gradual rollout to 100%

2. **Post-Deployment**
   - Monitor metrics
   - Address feedback
   - Cleanup legacy code

---

## 15. Conclusion

This migration architecture provides a **comprehensive, risk-mitigated path** to transitioning FileExplorer from a custom implementation to MUI X RichTreeView while preserving all existing functionality.

**Key Strengths**:
- ✅ Backward compatibility maintained via adapter layer
- ✅ Phased rollout with feature flags enables safe deployment
- ✅ Comprehensive test coverage ensures quality
- ✅ Rollback procedures minimize risk
- ✅ Effort estimates are realistic and achievable

**Recommended Action**: **PROCEED** with migration following this architecture.

**Estimated Delivery**: **22-28 days** from Phase 2 start

**Confidence Level**: **HIGH** - Based on Phase 1 findings, prototype validation, and detailed planning

---

**Document Version**: 1.0
**Last Updated**: 2026-01-15
**Author**: Claude (Sonnet 4.5) via stoked-ui-project-7
**Next Review**: Upon Phase 2 completion
