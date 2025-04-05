/**
 * @typedef {object} CleanupFn
 * @property {function(): void} CleanupFn - Function to clean up registry item
 */

/**
 * Creates a file registry to store file elements
 * @returns {{registry: Map<string, {element: HTMLElement}>, registerFile: function({id: string, element: HTMLElement}): CleanupFn}}
 */
function createFileRegistry() {
  const registry = new Map<string, { element: HTMLElement }>();

  /**
   * Registers a file element in the registry
   * @param {object} param0
   * @param {string} param0.id - The unique identifier of the file element
   * @param {HTMLElement} param0.element - The HTML element representing the file
   * @returns {CleanupFn} - Function to clean up the registered file
   */
  const registerFile = ({ id, element }) => {
    registry.set(id, { element });
    return () => {
      registry.delete(id);
    };
  };

  return { registry, registerFile };
}

/**
 * Custom hook for file explorer drag and drop functionality
 * @param {object} params - Parameters for file explorer DnD
 * @param {object} params.instance - Instance of the file explorer
 * @param {object} params.params - Additional parameters for DnD
 * @param {React.RefObject<HTMLUListElement>} params.rootRef - Reference to the root HTML element
 * @returns {object} - Object containing DnD functions and context values
 */
export const useFileExplorerDnd = ({
  instance,
  params,
  rootRef,
}) => {
  /**
   * Reducer wrapper for file explorer state management
   * @param {object} wrappedState - Current state of the file explorer
   * @param {object} action - Action to be applied to the state
   * @returns {object} - Updated state after applying the action
   */
  const reducerWrapper = (wrappedState, action) => {
    const reducedState = fileListStateReducer(wrappedState, action);
    instance.updateItems(reducedState.items);
    instance.recalcVisibleIndices(reducedState.items, true, 0)
    if (params !== undefined && action.type === 'create-children') {
      const initialFiles = action.items.map((item) => item)
      const files = initialFiles.filter((item) => item !== undefined) as FileBase[]
    }
    return reducedState;
  }

  // Initial state setup
  const [reducedState, updateState] = React.useReducer(
    reducerWrapper,
    getFileExplorerStateDefault(),
    () => getFileExplorerStateDefault(params.items as FileBase[])
  );
  const [{ registry, registerFile }] = React.useState(createFileRegistry);
  const { items, lastAction } = reducedState;

  // Effect to handle post-move flash based on last action
  React.useEffect(() => {
    if (lastAction === null) {
      return;
    }

    if (lastAction.type === 'instruction') {
      const { element } = registry.get(lastAction.id) ?? {};
      if (element) {
        triggerPostMoveFlash(element);
      }
    }
  }, [lastAction, registry]);

  // Functions for creating children, individual child, and removing items
  const createChildren = React.useCallback(
    (files, targetId) => {
      const childItems = files.flat(Infinity);
      params.onAddFiles?.(files);
      updateState({
        type: 'create-children',
        items: childItems,
        targetId,
        id: childItems[0].id ?? childItems[0].id!,
      });
    },
    [updateState],
  );

  const createChild = React.useCallback(
    (item, targetId) => {
      updateState({
        type: 'create-child',
        item,
        targetId,
        id: item?.id ?? item?.id!,
      });
    },
    [updateState],
  );

  const removeItem = React.useCallback(
    (id) => {
      updateState({
        type: 'remove',
        id
      });
    }, []
  )

  // other DnD related functions and context values
  // ...
};

/**
 * Defaultized DnD parameters for file explorer
 * @param {object} params - Parameters for file explorer DnD
 * @returns {object} - Defaultized DnD parameters
 */
useFileExplorerDnd.getDefaultizedParams = (params) => ({
  ...params,
  dndInternal: params?.dndInternal ? true : undefined,
  dndExternal: params?.dndExternal ? true : undefined,
  dndFileTypes: params?.dndFileTypes ?? [],
  dndTrash: params?.dndTrash,
});

/**
 * Parameters for file explorer DnD
 * @type {object}
 */
useFileExplorerDnd.params = {
  dndInternal: true,
  dndExternal: true,
  dndFileTypes: true,
  dndTrash: true,
  onAddFiles: true,
};

/**
 * Gets the initial state for file explorer DnD
 * @returns {object} - Initial state object
 */
useFileExplorerDnd.getInitialState = () => ({

});