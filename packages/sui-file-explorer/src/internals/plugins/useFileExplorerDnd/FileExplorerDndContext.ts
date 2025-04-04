Here is a formatted version of the code:
/**
 * File Explorer DnD Context
 */

// Constants and Types
export type FileExplorerState<R extends FileBase = FileBase> = {
  lastAction: FileExplorerDndAction<R> | null;
  items: R[];
};

type FileExplorerDndAction<R extends FileBase> = {
  type: string;
  id?: string;
  targetId?: string;
  instruction?: Instruction;
};

export type Instruction =
  | { type: 'reparent'; desiredLevel: number; }
  | { type: 'make-child' };
  | { type: 'reorder-above', targetId: string };
  | { type: 'reorder-below', targetId: string };

// File Explorer State
export function getFileExplorerStateDefault<R extends FileBase = FileBase>(items: R[] = []): FileExplorerState<R> {
  return {
    lastAction: null,
    items,
  }
}

// Data Reducer
const dataReducer = <R extends FileBase>(items: R[], action: FileExplorerDndAction<R>) => {

  if (action.type === 'set-state') {
    return action.items;
  }

  if (action.type === 'create-children') {
    fileExplorer.createChildren(items, action.items, action.targetId);
    return items;
  }

  if (action.type === 'create-child') {
    fileExplorer.createChild(items, action.item, action.targetId);
    return items;
  }

  const item = fileExplorer.find(items, action.id);

  if (!item) {
    console.warn(`Task [${action.type}] failed: id ${action.id} was not found`);
    return items;
  }

  if (action.type === 'remove') {
    const result = fileExplorer.remove(items, action.id);
    return result;
  }
  
  if (action.type === 'instruction') {
    const instruction = action.instruction;

    if (instruction.type === 'reparent') {
      const path = fileExplorer.getPathToItem({
        current: items,
        targetId: action.targetId,
      });
      invariant(path);
      const desiredId = path[instruction.desiredLevel];
      let result = fileExplorer.remove(items, action.id);

      result = fileExplorer.insertAfter(result, desiredId, item);
      return result;
    }

    // the rest of the actions require you to drop on something else
    if (action.id === action.targetId) {
      return items;
    }

    if (instruction.type === 'reorder-above') {
      let result = fileExplorer.remove(items, action.id);
      result = fileExplorer.insertBefore(result, action.targetId, item);
      return result;
    }

    if (instruction.type === 'reorder-below') {
      let result = fileExplorer.remove(items, action.id);
      result = fileExplorer.insertAfter(result, action.targetId, item);
      return result;
    }

    if (instruction.type === 'make-child') {
      let result = fileExplorer.remove(items, action.id);
      result = fileExplorer.insertChild(result, action.targetId, item);
      return result;
    }

    console.warn('TODO: instruction not implemented', instruction, action);

    return items;
  }
  
  return items;
};

// Data Reducer for File List State
export function fileListStateReducer<R extends FileBase>(
  state: FileExplorerState<R>,
  action: FileExplorerDndAction<R>,
): FileExplorerState<R> {
  const items = dataReducer(state.items, action);
  return {
    items: items as R[],
    lastAction: action,
  };
}

// Context API
export const FileExplorerDndContext = React.createContext<FileExplorerDndContextValue<FileBase>>({
  dispatch: () => {},
  uniqueContextId: Symbol('uniqueId'),
  getPathToItem: () => [],
  getMoveTargets: () => [],
  getNodesOfItem: () => [],
  registerFile: () => {},
});

// Reducers
export function getNodesOfItem<R extends FileBase>(items: R[], id: string): R[] {
  return items.filter((item) => item.id === id);
}

export function getMoveTargets<R extends FileBase>(id: string, items: R[]): FileBase[] {
  const targets = [];
  for (const item of items) {
    if (item.id !== id && !fileExplorer.hasNodes(item)) {
      targets.push(item);
    }
  }
  return targets;
}

// Utility Functions
export function createChildren<R extends FileBase>(items: R[], childrenId: string, parentId?: string): void {
  const child = fileExplorer.find(items, childrenId);
  if (child) {
    items.splice(items.indexOf(child), 1);
    items.push({ id: childrenId, ...child });
  }
}

export function createChild<R extends FileBase>(items: R[], item: R, parentId?: string): void {
  const child = fileExplorer.find(items, item.id);
  if (child) {
    items.splice(items.indexOf(child), 1);
    items.push({ id: item.id, ...item });
  }
}

export function insertAfter<R extends FileBase>(items: R[], beforeItem: R, afterItem: R): void {
  const index = items.indexOf(beforeItem);
  if (index !== -1) {
    const afterIndex = index + 1;
    if (afterIndex < items.length) {
      [items[beforeIndex], items[afterIndex]] = [items[afterIndex], items[beforeIndex]];
    }
  }
}

export function remove<R extends FileBase>(items: R[], id: string): void {
  const index = items.indexOf(id);
  if (index !== -1) {
    items.splice(index, 1);
  }
}

// Functions
function fileExplorer.find(items: R[], id: string): R | null {
  for (const item of items) {
    if (item.id === id) return item;
  }
  return null;
}
Note that I have added some missing types and functions to the original code.