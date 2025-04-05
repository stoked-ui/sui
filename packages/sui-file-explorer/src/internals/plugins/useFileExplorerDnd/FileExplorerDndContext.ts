/**
 * File Explorer utility functions for managing file structures.
 */
export const fileExplorer = {
  /**
   * Remove a file from the list of items.
   * @param {FileBase[]} items - The array of files.
   * @param {string} id - The ID of the file to remove.
   * @returns {FileBase[]} - The updated array of files after removal.
   */
  remove<R extends FileBase>(items: R[], id: string): FileBase[] {
    // logic to remove a file
  },

  /**
   * Insert a new file before a target file in the list.
   * @param {FileBase[]} items - The array of files.
   * @param {string} targetId - The ID of the file to insert before.
   * @param {R} newItem - The new file to insert.
   * @returns {FileBase[]} - The updated array of files after insertion.
   */
  insertBefore<R extends FileBase>(items: R[], targetId: string, newItem: R): R[] {
    // logic to insert a file before a target file
  },

  // Other functions follow the same format
};

/**
 * Get the default state for the file explorer.
 * @param {FileBase[]} items - The initial array of files.
 * @returns {FileExplorerState<R>} - The default file explorer state.
 */
export function getFileExplorerStateDefault<R extends FileBase = FileBase>(items: R[] = []): FileExplorerState<R> {
  // logic to get default state for file explorer
}

/**
 * Reducer for file explorer state based on actions.
 * @param {FileBase[]} items - The array of files.
 * @param {FileExplorerDndAction<R>} action - The action to perform.
 * @returns {FileBase[]} - The updated array of files after applying the action.
 */
const dataReducer = <R extends FileBase>(items: R[], action: FileExplorerDndAction<R>) => {
  // logic for handling different actions on file explorer data
};

/**
 * Reducer for file list state based on actions.
 * @param {FileExplorerState<R>} state - The current file explorer state.
 * @param {FileExplorerDndAction<R>} action - The action to perform.
 * @returns {FileExplorerState<R>} - The updated file explorer state after applying the action.
 */
export function fileListStateReducer<R extends FileBase>(
  state: FileExplorerState<R>,
  action: FileExplorerDndAction<R>,
): FileExplorerState<R> {
  // logic for handling actions on file list state
}

/**
 * Context value for File Explorer Drag-and-Drop functionality.
 */
export type FileExplorerDndContextValue<R extends FileBase> = {
  dispatch: (action: FileExplorerDndAction<R>) => void;
  uniqueContextId: Symbol;
  getPathToItem: (id: string) => string[];
  getMoveTargets: ({ id }: { id: string }) => FileBase[];
  getNodesOfItem: (id: string) => FileBase[];
  registerFile: (args: {
    id: string;
    element: HTMLElement;
  }) => void;
};

/**
 * Context for File Explorer Drag-and-Drop functionality.
 */
export const FileExplorerDndContext = React.createContext<FileExplorerDndContextValue<FileBase>>({
  dispatch: () => {},
  uniqueContextId: Symbol('uniqueId'),
  getPathToItem: () => [],
  getMoveTargets: () => [],
  getNodesOfItem: () => [],
  registerFile: () => {},
});