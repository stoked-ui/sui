import * as React from 'react'
import { namedId } from "@stoked-ui/media-selector";
import {
  GridColumn,
  GridColumns,
  GridHeader,
  GridHeaders,
  UseFileExplorerGridPlugin,
  UseFileExplorerGridState
} from './useFileExplorerGrid.types';
import { FileBase, FileId } from '../../../models';
import { bytesToSize, calcSize, getRelativeTimeString } from "./PropUtils";
import { ItemMode } from "../useFileExplorerFiles/useFileExplorerFiles.types";

const updateGridState = ({ headers, columns, initializedIndexes, id }: { headers: GridHeaders, columns: GridColumns, initializedIndexes: boolean, id?: string } ): UseFileExplorerGridState => {
  const { label, size, modified } = headers;
  const font = { };
  label.sx = {...label.sx, flexGrow: 1, display: 'flex', justifyContent: 'start', ...font }
  size.sx = {...label.sx, display: 'flex',  ...font }
  modified.sx = {...label.sx, display: 'flex',  ...font }
  return {
    grid: {
      headers: headers ?? {},
      columns: columns ?? {},
      initializedIndexes
    },
    id: id ?? namedId({id: 'file', length: 4})
  };
};

export const useFileExplorerGrid: UseFileExplorerGridPlugin = <R extends FileBase>({
  instance,
  state,
  rootRef,
  params,
}) => {

  const getAltRowClass = (itemId: string) => {
    return state.items.itemMetaMap[itemId]?.visibleIndex ? 'Mui-odd' : 'Mui-even';
  }
  const isColumn = (itemId: string) => state.grid.columns.hasOwnProperty(itemId);

  const setVisibleOrder = (value: FileId[]) => {
    state.grid.visibleItems = value;
  };

  const setColumns = (value: GridColumns) => {
    state.grid.columns = value;
  };

  const upsertColumn = (name: string, column: GridColumn) => {
    state.grid.columns[name] = column;
  }
  const getColumns = (): GridColumns => {
    return state.grid.columns;
  }

  const getHeaders = (): GridHeaders => {
    return state.grid.headers;
  }

  React.useEffect(() => {
    const evaluate = (list: R[]) => {
      for (let i = 0; i < list.length; i += 1) {
        const item = list[i];
        Object.entries(state.grid.columns).forEach(([name, data] ) => {
          (data as GridColumn).evaluator?.(item, name);
        });
        if (item.children) {
          evaluate(item.children as R[]);
        }
      }
    }
    evaluate(instance.getItemsToRender());
  }, [instance, params.items, state.grid])

  const processColumns = () => {
    if (rootRef.current && rootRef.current?.id) {
      rootRef.current.id = state.id;
    }
    Object.entries(state.grid.columns).forEach(([name, columnData]) => {
      const data = columnData as GridColumn;
      const columns = document.querySelectorAll(`#${state.id} .column-${name}`);
      let width = data.width !== -1 ? data.width : 0;
      columns.forEach((column) => {
        if (!data.rowData[column.id]) {
          data.rowData[column.id] = {
            width: column.clientWidth
          }
        }
        if (column.clientWidth > width + 8) {
          width = column.clientWidth;
        }
      });

      if (!data.waiting) {
        data.width = width + (data.width === -1 ? 8 : 0);
        data.waiting = true;
      } else if (width === data.width) {
        data.waiting = false;
      }
    });
  }


  React.useEffect(() => {
    processColumns();
  }, [params.items])

  const isColumnAscending = (columnName: string) => {
    return state.grid.headers[columnName]?.status.ascending ?? null;
  }

  const isColumnFocused = (columnName: string) => {
    return state.grid.headers[columnName]?.status.focused ?? null;
  }

  const isColumnVisible = (columnName: string) => {
    return state.grid.headers[columnName]?.status.focused ?? null;
  }

  const sortColumn = (columnName: string, ascending: boolean, items: any[] = [...params.items]) => {
    items = items.sort((a, b) => {
      const valA = ascending ? a[columnName] : b[columnName];
      const valB = ascending ? b[columnName] : a[columnName];
        if (valA > valB) {
          return -1;
        }
        if (valA < valB) {
          return 1;
        }
        return 0
      });
    items.forEach((item) => {
      if (item.children) {
        item.children = sortColumn(columnName, ascending, item.children);
      }
    });
    return items;
  }

  const toggleColumnSort = (columnName: string) => {
    const isAscending = isColumnAscending(columnName);
    if (isAscending === null) {
      return null;
    }
    const isCurrentSort = state.grid.headers[columnName].status.sort;
    state.grid.headers[columnName].status.sort = true;
    if (isCurrentSort){
      state.grid.headers[columnName].status.ascending = !isAscending;
    }
    let sortItems = instance.getFiles();
    const trash = sortItems.find((item) => item.id === 'trash');
    if (trash) {
      sortItems = sortItems.filter((item) => item.id !== 'trash');
    }
    const items =  sortColumn(columnName, state.grid.headers[columnName].status.ascending, sortItems)
    if (trash) {
      items.push(trash);
    }
    instance.updateItems(items);
    instance.recalcVisibleIndices(items, true)
    return !isAscending;
  }

  const getItemMode = React.useCallback((item: any): ItemMode => {
    if (item.expanded === undefined) {
      const meta = instance.getItemMeta(item.id ?? item.itemId);
      item = {...meta, ...item};
    }
    if (item.children.length && item.expanded) {
      return 'expanded';
    }
    const index = instance.getItemDepthIndex(item.parentId);
    if (index === item.children.length - 1) {
      return 'last-in-group';
    }

    return 'standard';
  }, [state.items.itemMap]);

  const toggleColumnVisible = (columnName: string) => {
    const isVisible = isColumnVisible(columnName);
    if (isVisible === null) {
      return null;
    }
    state.grid.headers[columnName].status.visible = !isVisible;
    return !isVisible;
  }

  const focusHeader = (event: React.FocusEvent | React.MouseEvent | null, columnName: string) => {
    const header = state.grid.headers[columnName];
    if (!header) {
      return;
    }
    const headers =  Object.values(state.grid.headers) as GridHeader[];
    headers.forEach((loopHeader: GridHeader) => {
      loopHeader.status.focused = false;
    });
    header.status.focused = true;
  }

  const blurHeader = (event: React.FocusEvent | null, columnName: string) => {
    const column = state.grid.headers[columnName];
    if (column) {
      return;
    }
    column.status.focused = false
  }

  const gridEnabled = () => {
    return !!params.grid;
  }
  const isSortColumn = (columnName: string) => {
    return state.grid.headers[columnName]?.status.sort ?? null;
  }

  const getHeaderStatus = (columnName: string) => {
    return state.grid.headers[columnName]?.status ?? null;
  }

  const getItemStatus = (itemId: FileId, children: React.ReactNode) => {
    const isItemExpandable = (reactChildren: React.ReactNode) => {
      if (Array.isArray(reactChildren)) {
        return reactChildren.length > 0 && reactChildren.some(isItemExpandable);
      }
      return Boolean(reactChildren);
    };
    return {
      expandable: isItemExpandable(children),
      expanded: instance.isItemExpanded(itemId),
      focused: instance.isItemFocused(itemId),
      selected: instance.isItemSelected(itemId),
      disabled: instance.isItemDisabled(itemId),
      visibleIndex: instance.getVisibleIndex(itemId),
      grid: params.grid,
      dndState: state.items.itemMetaMap[itemId]?.dndState ?? 'idle',
      dndInstruction: state.items.itemMetaMap[itemId]?.dndInstruction ?? null,
      dndContainer: state.items.itemMetaMap[itemId]?.dndContainer ?? null,
    }
  }

  return {
    publicAPI: {
      setVisibleOrder,
      setColumns,
      upsertColumn,
      gridEnabled,
    },
    instance: {
      getItemStatus,
      gridEnabled,
      getHeaderStatus,
      isSortColumn,
      isColumnVisible,
      isColumnFocused,
      isColumnAscending,
      toggleColumnSort,
      toggleColumnVisible,
      focusHeader,
      blurHeader,
      isColumn,
      calcSize,
      getAltRowClass,
      setVisibleOrder,
      setColumns,
      getColumns,
      getHeaders,
      getItemMode,
    },
    contextValue: {
      ...state.grid,
      grid: params.grid,
      gridHeader: params.gridHeader,
    },
  };
};

const directRender = (content: any) => content;

const DEFAULT_HEADER_DATA = {
  sx: {
    display: 'flex',
    overflow: 'ellipsis',
    alignItems: 'center',
    justifyContent: 'end',
    paddingRight: '6px',
    paddingLeft: '6px',
  },
  width: -1,
  renderContent: directRender,
  status: {
    ascending: true,
    focused: false,
    visible: true,
    sort: false
  },
}

const DEFAULT_COLUMN_DATA = {
  sx: {
    display: 'flex',
    overflow: 'ellipsis',
    alignItems: 'center',
    justifyContent: 'end',
    paddingRight: '8px'
  },
  width: -1,
  rowData: {},
  waiting: false,
  cells: [],
}

const children = (cells: React.ReactElement[]) => {
  return (
    <React.Fragment>
      {cells}
    </React.Fragment>
  );
}
const DEFAULT_HEADERS: GridHeaders = {
  label: {
    ...JSON.parse(JSON.stringify(DEFAULT_HEADER_DATA)),
    children,
    ...{ status: { sort: true, ascending: true, focused: true, visible: true }}
  },
  size: {
    ...JSON.parse(JSON.stringify(DEFAULT_HEADER_DATA)),
    children,
  },
  modified: {
    ...JSON.parse(JSON.stringify(DEFAULT_HEADER_DATA)),
    children
  }
}

const DEFAULT_COLUMNS: GridColumns = {
  label: {
    ...JSON.parse(JSON.stringify(DEFAULT_COLUMN_DATA)),
  },
  size: {
    ...JSON.parse(JSON.stringify(DEFAULT_COLUMN_DATA)),
    renderContent: bytesToSize,
    evaluator: calcSize
  },
  modified: {
    ...JSON.parse(JSON.stringify(DEFAULT_COLUMN_DATA)),
    renderContent: getRelativeTimeString
  }
}

useFileExplorerGrid.getInitialState = (params) => updateGridState({
  columns: params.defaultGridColumns,
  headers: params.defaultGridHeaders,
  initializedIndexes: false,
  id: params.id
})

useFileExplorerGrid.getDefaultizedParams = (params) => ({
  ...params,
  defaultGridColumns: params.defaultGridColumns ?? DEFAULT_COLUMNS,
  defaultGridHeaders: params.defaultGridHeaders ?? DEFAULT_HEADERS,
  grid: params.grid ?? false,
  initializedIndexes: params.initializedIndexes ?? false,
  gridHeader: params.gridHeader ?? false,
});

useFileExplorerGrid.params = {
  grid: true,
  gridHeader: true,
  initializedIndexes: true,
  columns: true,
  headers: true,
  defaultGridColumns: true,
  defaultGridHeaders: true,
};
