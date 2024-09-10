import * as React from 'react';
import {SxProps, Theme, useTheme} from "@mui/system";
import {namedId} from "@stoked-ui/media-selector";
import {FileMeta} from '../../models/fileExplorerView';
import {FileExplorerPlugin} from '../../models/plugin';
import type {
  UseFileExplorerFilesDefaultizedParameters,
  UseFileExplorerFilesSignature,
  UseFileExplorerFilesState,
} from './useFileExplorerFiles.types';
import {publishFileExplorerEvent} from '../../utils/publishFileExplorerEvent';
import {FileBase, FileId} from '../../../models';
import {buildSiblingIndexes, FILE_EXPLORER_VIEW_ROOT_PARENT_ID} from './useFileExplorerFiles.utils';
import {FileDepthContext} from '../../FileDepthContext';
import {DndItemState} from '../useFileExplorerDnd/useFileExplorerDnd.types';

interface UpdateNodesStateParameters
  extends Pick<
    UseFileExplorerFilesDefaultizedParameters<FileBase>,
    'items' | 'isItemDisabled' | 'getItemLabel' | 'getItemId'
  > {
  recalcVisibleIndices: (items: FileBase[], force: boolean, index: number) => void;
}

type State = UseFileExplorerFilesState<any>['items'];
const updateItemsState = ({
  items,
  isItemDisabled,
  getItemLabel,
  getItemId,
  recalcVisibleIndices,
}: UpdateNodesStateParameters): UseFileExplorerFilesState<any>['items'] => {
  const itemMetaMap: State['itemMetaMap'] = {};
  const itemMap: State['itemMap'] = {};
  const itemOrderedChildrenIds: State['itemOrderedChildrenIds'] = {
    [FILE_EXPLORER_VIEW_ROOT_PARENT_ID]: [],
  };

  const processItem = (item: FileBase, depth: number, parentId: string | null) => {
    const id = item?.itemId ?? item.id ?? namedId({id:'file', length:4});
    if (itemMetaMap[id]){
      // TODO: FIX THIS SERIOUSLY
      console.warn(`DIRTY HACK: this item id already exists - item: ${JSON.stringify(item, null, 2)}, existing item: ${JSON.stringify(itemMetaMap[id], null, 2)}`)
      return;
    }
    item.id = id;
    item.itemId = item.itemId ?? id;
    item.label = item.label ?? id;

    if (id == null) {
      throw new Error(
        [
          'SUI X: The FileExplorer View component requires all items to have a unique `id` property.',
          'Alternatively, you can use the `getItemId` prop to specify a custom id for each item.',
          'An item was provided without id in the `items` prop:',
          JSON.stringify(item),
        ].join('\n'),
      );
    }

    if (itemMetaMap[id] != null) {
      throw new Error(
        [
          'SUI X: The FileExplorer View component requires all items to have a unique `id` property.',
          'Alternatively, you can use the `getItemId` prop to specify a custom id for each item.',
          `Two items were provided with the same id in the \`items\` prop: "${id}"`,
        ].join('\n'),
      );
    }

    const label = getItemLabel ? getItemLabel(item) : (item as { label: string }).label;
    if (label == null) {
      throw new Error(
        [
          'SUI X: The FileExplorer View component requires all items to have a `label` property.',
          'Alternatively, you can use the `getItemLabel` prop to specify a custom label for each item.',
          'An item was provided without label in the `items` prop:',
          JSON.stringify(item),
        ].join('\n'),
      );
    }
    itemMetaMap[id] = {
      id,
      label,
      parentId,
      idAttribute: undefined,
      expandable: !!item.children?.length,
      disabled: isItemDisabled ? isItemDisabled(item) : false,
      depth,
      dndState: 'idle',
      dndContainer: null,
      dndInstruction: null
    };

    itemMap[id] = item;
    itemOrderedChildrenIds[id] = [];
    const parentIdWithDefault = parentId ?? FILE_EXPLORER_VIEW_ROOT_PARENT_ID;
    if (!itemOrderedChildrenIds[parentIdWithDefault]) {
      itemOrderedChildrenIds[parentIdWithDefault] = [];
    }
    itemOrderedChildrenIds[parentIdWithDefault].push(id);

    item.children?.forEach((child) => processItem(child, depth + 1, id));
  };

  items?.forEach((item) => processItem(item, 0, null));

  const itemChildrenIndexes: State['itemChildrenIndexes'] = {};
  Object.keys(itemOrderedChildrenIds).forEach((parentId) => {
    itemChildrenIndexes[parentId] = buildSiblingIndexes(itemOrderedChildrenIds[parentId]);
  });

  if (items?.length) {
    recalcVisibleIndices([...items], true, 0);
  }

  return {
    itemMetaMap,
    itemMap,
    itemOrderedChildrenIds,
    itemChildrenIndexes,
    indiciesDirty: false,
  };
};

export const useFileExplorerFiles: FileExplorerPlugin<UseFileExplorerFilesSignature> = ({
  instance,
  params,
  state,
  setState,
  experimentalFeatures,
}) => {

  const theme = useTheme()
  const getAlternatingRowStyle = () => {
    return { background: `${theme.palette.mode === 'light'
        ? '#0001'
        : '#FFF1'}` } as SxProps<Theme>;
  }

  const getFiles = () => {
    return state.items.itemOrderedChildrenIds[FILE_EXPLORER_VIEW_ROOT_PARENT_ID].map((id) => state.items.itemMap[id]);
  }

  const recalcVisibleIndices  = (items: FileBase[] = getFiles(), force: boolean = false, index: number = 0) => {
    // console.log('recalc items', items);
    const recalVisibleIndicesBase  = (baseItems: FileBase[], baseIndex: number = 0) => {
      for (let i = 0; i < baseItems.length; i += 1){
        const item = baseItems[i];
        if (item) {
          item.visibleIndex = baseIndex;
          baseIndex += 1;

          if (item.children?.length && instance.isItemExpanded(item.id ?? item.itemId!)) {
            baseIndex = recalVisibleIndicesBase(item.children, baseIndex);
          }
        }
      }
      return baseIndex;
    }
    const initializeVisibleIndices  = (initItems: FileBase[]) => {
      for (let i = 0; i < initItems.length; i += 1){
        const item = initItems[i];
        if (item) {
          item.visibleIndex = -1;

          if (item?.children?.length && instance.isItemExpanded(item.id ?? item.itemId!)) {
            initializeVisibleIndices(item.children);
          }
        }
      }
    }
    if(state.items.indiciesDirty || force) {
      state.items.indiciesDirty = false;
      initializeVisibleIndices(items);
      recalVisibleIndicesBase(items);
    }
  }

  const getItemMeta = React.useCallback(
    (itemId: string): FileMeta => state.items.itemMetaMap[itemId],
    [state.items.itemMetaMap],
  );

  const getItem = React.useCallback(
    (itemId: string) => state.items.itemMap[itemId],
    [state.items.itemMap],
  );

  const isItemDisabled = React.useCallback(
    (itemId: string | null): itemId is string => {
      if (itemId == null) {
        return false;
      }

      let itemMeta = instance.getItemMeta(itemId);

      // This can be called before the item has been added to the item map.
      if (!itemMeta) {
        return false;
      }

      if (itemMeta.disabled) {
        return true;
      }

      while (itemMeta.parentId != null) {
        itemMeta = instance.getItemMeta(itemMeta.parentId);
        if (itemMeta.disabled) {
          return true;
        }
      }

      return false;
    },
    [instance],
  );

  const getItemDOMElement = (itemId: string) => {
    const itemMeta = instance.getItemMeta(itemId);
    if (itemMeta == null) {
      return null;
    }

    return document.getElementById(instance.getFileIdAttribute(itemId, itemMeta.idAttribute));
  };

  const getItemIndex = React.useCallback(
    (itemId: string) => {
      const parentId = instance.getItemMeta(itemId).parentId ?? FILE_EXPLORER_VIEW_ROOT_PARENT_ID;
      return state.items.itemChildrenIndexes[parentId][itemId];
    },
    [instance, state.items.itemChildrenIndexes],
  );

  const getItemOrderedChildrenIds = React.useCallback(
    (itemId: string | null) =>
      state.items.itemOrderedChildrenIds[itemId ?? FILE_EXPLORER_VIEW_ROOT_PARENT_ID] ?? [],
    [state.items.itemOrderedChildrenIds],
  );

  const isItemNavigable = (itemId: string) => {
    if (params.disabledItemsFocusable) {
      return true;
    }
    return !instance.isItemDisabled(itemId);
  };

  const areItemUpdatesPreventedRef = React.useRef(false);
  const preventItemUpdates = React.useCallback(() => {
    areItemUpdatesPreventedRef.current = true;
  }, []);

  const areItemUpdatesPrevented = React.useCallback(() => areItemUpdatesPreventedRef.current, []);
  const updateItems = (items: FileBase[]) => {
    setState((prevState) => {
      const newState = updateItemsState({
        items,
        isItemDisabled: params.isItemDisabled,
        getItemId: params.getItemId,
        getItemLabel: params.getItemLabel,
        recalcVisibleIndices,
      });

      Object.values(prevState.items.itemMetaMap).forEach((item) => {
        if (!newState.itemMetaMap[item.id]) {
          publishFileExplorerEvent(instance, 'removeItem', { id: item.id });
        }
      });

      return { ...prevState, items: newState };
    });
  }

  const getItemDepthIndex = (itemId: string, parentId: string) => {
    const childIds = getItemOrderedChildrenIds(parentId);
    return childIds.indexOf(itemId);
  }

  React.useEffect(() => {
    // if (instance.areItemUpdatesPrevented()) {
    // }
    // ensureTrash();
  }, [
    instance,
    setState,
    params.items,
    params.isItemDisabled,
    params.getItemId,
    params.getItemLabel,
    instance]);

  const getVisibleIndex = (itemId: string) => {
    const initialIndex = state.items.itemMap[itemId]?.visibleIndex;
    if (initialIndex && initialIndex !== -1) {
      return initialIndex;
    }
    // const label = instance.getItem(itemId).label;
    state.items.indiciesDirty = true;
    recalcVisibleIndices();
    return state.items.itemMap[itemId]?.visibleIndex ?? -1;
  }

  const getItemsToRender = () => {
    const getPropsFromItemId = (
      id: FileId,
    ): ReturnType<typeof instance.getItemsToRender>[number] => {
      const item = state.items.itemMetaMap[id];
      return {
        label: item.label!,
        itemId: item.id,
        id: item.idAttribute,
        children: state.items.itemOrderedChildrenIds[id].map(getPropsFromItemId),
      };
    };

    return state.items.itemOrderedChildrenIds[FILE_EXPLORER_VIEW_ROOT_PARENT_ID].map(getPropsFromItemId);
  };
  const updateDndMeta = (itemId: string, dnd: DndItemState) => {
    setState((prevState) => {
      // console.log('itemId', itemId, prevState.items?.itemMetaMap);
      const itemMeta = prevState.items.itemMetaMap[itemId];
      if (!itemMeta) {
        return {...prevState};
      }
      itemMeta.dndState = dnd.dndState;
      itemMeta.dndContainer = dnd.dndContainer;
      itemMeta.dndInstruction = dnd.dndInstruction;
      prevState.items.itemMetaMap[itemId] = {...itemMeta };
      return { ...prevState };
    });
  }
  return {
    getRootProps: () => ({
      style: {
        '--FileExplorer-itemChildrenIndentation':
          typeof params.itemChildrenIndentation === 'number'
            ? `${params.itemChildrenIndentation}px`
            : params.itemChildrenIndentation,
      } as React.CSSProperties,
    }),
    publicAPI: {
      getItem,
      getItemDOMElement,
    },
    instance: {
      getItemDOMElement,
      updateItemsState,
      updateDndMeta,
      getItemMeta,
      getItem,
      getFiles,
      getItemsToRender,
      getItemIndex,
      getItemOrderedChildrenIds,
      isItemDisabled,
      isItemNavigable,
      preventItemUpdates,
      areItemUpdatesPrevented,
      updateItems,
      getItemDepthIndex,
      recalcVisibleIndices,
      getVisibleIndex
    },
    contextValue: {
      disabledItemsFocusable: params.disabledItemsFocusable,
      indentationAtItemLevel: experimentalFeatures.indentationAtItemLevel ?? false,
      alternatingRows: params.alternatingRows === true ? getAlternatingRowStyle() : params.alternatingRows,
    },
  };
};

useFileExplorerFiles.getInitialState = (params) => ({
  items: updateItemsState({
    items: params.items,
    isItemDisabled: params.isItemDisabled,
    getItemId: params.getItemId,
    getItemLabel: params.getItemLabel,
    recalcVisibleIndices: () => 0,
  }),
});

useFileExplorerFiles.getDefaultizedParams = (params) => ({
  ...params,

  disabledItemsFocusable: params.disabledItemsFocusable ?? false,
  itemChildrenIndentation: params.itemChildrenIndentation ?? '12px',
  alternateRows: params.alternatingRows,
});

useFileExplorerFiles.wrapRoot = ({ children, instance }) => {
  return (
    <FileDepthContext.Provider value={(itemId) => instance.getItemMeta(itemId)?.depth ?? 0}>
      {children}
    </FileDepthContext.Provider>
  );
};

useFileExplorerFiles.params = {
  alternatingRows: true,
  disabledItemsFocusable: true,
  items: true,
  isItemDisabled: true,
  getItemLabel: true,
  getItemId: true,
  itemChildrenIndentation: true,
};
