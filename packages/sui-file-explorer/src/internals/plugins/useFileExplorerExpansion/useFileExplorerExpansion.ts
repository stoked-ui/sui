/**
 * Custom hook for handling file explorer expansion functionality.
 * 
 * @param {object} props - The properties object.
 * @param {object} props.instance - The instance object.
 * @param {object} props.params - The params object.
 * @param {object} props.models - The models object.
 * @returns {object} Object containing public API, instance, and contextValue for file explorer expansion.
 */
export const useFileExplorerExpansion = ({
  instance,
  params,
  models,
}) => {
  /**
   * Map of expanded items.
   */
  const expandedItemsMap = React.useMemo(() => {
    const temp = new Map<FileId, boolean>();
    models.expandedItems.value.forEach((id) => {
      temp.set(id, true);
    });

    return temp;
  }, [models.expandedItems.value]);

  /**
   * Set expanded items.
   * 
   * @param {React.SyntheticEvent} event - The event.
   * @param {FileId[]} value - The value of expanded items.
   */
  const setExpandedItems = (event: React.SyntheticEvent, value: FileId[]) => {
    params.onExpandedItemsChange?.(event, value);
    models.expandedItems.setControlledValue(value);
  };

  /**
   * Check if an item is expanded.
   * 
   * @param {string} id - The item id.
   * @returns {boolean} Whether the item is expanded.
   */
  const isItemExpanded = React.useCallback(
    (id: string) => {
      return expandedItemsMap.has(id);
    },
    [expandedItemsMap],
  );

  /**
   * Check if an item is expandable.
   * 
   * @param {string} id - The item id.
   * @returns {boolean} Whether the item is expandable.
   */
  const isItemExpandable = React.useCallback(
    (id: string) => {
      return !!instance.getItemMeta(id)?.expandable;
    },
    [instance],
  );

  /**
   * Toggle item expansion.
   * 
   * @param {React.SyntheticEvent} event - The event.
   * @param {FileId} id - The item id.
   */
  const toggleItemExpansion = useEventCallback(
    (event: React.SyntheticEvent, id: FileId) => {
      const isExpandedBefore = instance.isItemExpanded(id);
      console.info('toggle expansion', id, `old: ${isExpandedBefore}, new: ${!isExpandedBefore}`);
      instance.setItemExpansion(event, id, !isExpandedBefore);
    },
  );

  /**
   * Set item expansion.
   * 
   * @param {React.SyntheticEvent} event - The event.
   * @param {FileId} id - The item id.
   * @param {boolean} isExpanded - Whether the item is expanded.
   */
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

  /**
   * Expand all siblings of an item.
   * 
   * @param {React.KeyboardEvent} event - The keyboard event.
   * @param {FileId} id - The item id.
   */
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

  /**
   * Memoized expansion trigger value.
   */
  const expansionTrigger = React.useMemo(() => {
    if (params.expansionTrigger) {
      return params.expansionTrigger;
    }

    return 'content';
  }, [params.expansionTrigger]);

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
    },
    contextValue: {
      expansion: {
        expansionTrigger,
      },
    },
  };
};