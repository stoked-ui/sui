import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import {FileExplorerPlugin} from '../../models/plugin';
import {UseFileExplorerExpansionSignature} from './useFileExplorerExpansion.types';
import {FileId} from '../../../models';

export const useFileExplorerExpansion: FileExplorerPlugin<UseFileExplorerExpansionSignature> = ({
  instance,
  params,
  models,
}) => {
  const expandedItemsMap = React.useMemo(() => {
    const temp = new Map<FileId, boolean>();
    models.expandedItems.value.forEach((id) => {
      temp.set(id, true);
    });

    return temp;
  }, [models.expandedItems.value]);

  const setExpandedItems = React.useCallback((event: React.SyntheticEvent, value: FileId[]) => {
    params.onExpandedItemsChange?.(event, value);
    models.expandedItems.setControlledValue(value);
  }, [params, models.expandedItems]);

  const isItemExpanded = React.useCallback(
    (id: string) => {
      return expandedItemsMap.has(id)
    },
    [expandedItemsMap],
  );

  const isItemExpandable = React.useCallback(
    (id: string) => {
      return !!instance.getItemMeta(id)?.expandable
    },
    [instance],
  );

  const toggleItemExpansion = useEventCallback(
    (event: React.SyntheticEvent, id: FileId) => {
      const isExpandedBefore = instance.isItemExpanded(id);
      console.info('toggle expansion', id, `old: ${isExpandedBefore}, new: ${!isExpandedBefore}`);
      instance.setItemExpansion(event, id, !isExpandedBefore);
    },
  );

  const setItemExpansion = useEventCallback(
    (event: React.SyntheticEvent, id: FileId, isExpanded: boolean) => {
      const isExpandedBefore = instance.isItemExpanded(id);
      if (isExpandedBefore === isExpanded) {
        return;
      }

      let newExpanded: string[];
      if (isExpanded) {
        newExpanded = [id].concat(models.expandedItems.value);
      } else {
        newExpanded = models.expandedItems.value.filter((expandedId) => expandedId !== id);
      }

      if (params.onItemExpansionToggle) {
        params.onItemExpansionToggle(event, id, isExpanded);
      }

      setExpandedItems(event, newExpanded);
    },
  );

  const expandAllSiblings = (event: React.KeyboardEvent, id: FileId) => {
    const itemMeta = instance.getItemMeta(id);
    const siblings = instance.getItemOrderedChildrenIds(itemMeta.parentId);

    const diff = siblings.filter(
      (child) => instance.isItemExpandable(child) && !instance.isItemExpanded(child),
    );

    const newExpanded = models.expandedItems.value.concat(diff);

    if (diff.length > 0) {
      if (params.onItemExpansionToggle) {
        diff.forEach((newlyExpandedItemId) => {
          params.onItemExpansionToggle!(event, newlyExpandedItemId, true);
        });
      }

      setExpandedItems(event, newExpanded);
    }
  };

  const expansionTrigger = React.useMemo(() => {
    if (params.expansionTrigger) {
      return params.expansionTrigger;
    }

    return 'content';
  }, [params.expansionTrigger]);

  const getExpandedItems = React.useCallback(() => {
    return models.expandedItems.value;
  }, [models.expandedItems.value]);

  return {
    publicAPI: {
      setItemExpansion,
    },
    instance: {
      isItemExpanded,
      isItemExpandable,
      setItemExpansion,
      toggleItemExpansion,
      expandAllSiblings,
      getExpandedItems,
      setExpandedItems,
    },
    contextValue: {
      expansion: {
        expansionTrigger,
      },
    },
  };
};
useFileExplorerExpansion.models = {
  expandedItems: {
    getDefaultValue: (params) => params.defaultExpandedItems,
  },
};

const DEFAULT_EXPANDED_ITEMS: string[] = [];

useFileExplorerExpansion.getDefaultizedParams = (params) => ({
  ...params,
  defaultExpandedItems: params.defaultExpandedItems ?? DEFAULT_EXPANDED_ITEMS,
});

useFileExplorerExpansion.params = {
  expandedItems: true,
  defaultExpandedItems: true,
  onExpandedItemsChange: true,
  onItemExpansionToggle: true,
  expansionTrigger: true,
};
