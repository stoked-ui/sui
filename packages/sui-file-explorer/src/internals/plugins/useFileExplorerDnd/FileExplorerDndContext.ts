import * as React from "react";
import invariant from "tiny-invariant";
import {IMediaFile2, namedId} from "@stoked-ui/media-selector";
import {FileExplorerDndAction} from "./FileExplorerDndAction";

export const fileExplorer = {
  remove<R extends IMediaFile2>(items: R[], id: string): IMediaFile2[] {
    return items
      .filter(item => item?.id !== id)
      .map(item => {
        if (fileExplorer.hasNodes(item)) {
          return {
            ...item,
            children: item.children ? fileExplorer.remove(item.children, id) : []
          };
        }
        item.children = [];
        return item;
      });
  },
  insertBefore<R extends IMediaFile2>(
    items: R[],
    targetId: string,
    newItem: R,
  ): R[] {
    return items.flatMap(item => {
      if (item.id === targetId) {
        return [newItem, item];
      }
      if (fileExplorer.hasNodes(item)) {
        return {
          ...item,
          children: fileExplorer.insertBefore(item.children ?? [], targetId, newItem),
        };
      }
      return item;
    });
  },
  insertAfter<R extends IMediaFile2>(
    items: R[],
    targetId: string,
    newItem: R,
  ): R[] {
    return items.flatMap(item => {
      if (item.id === targetId) {
        return [item, newItem];
      }

      if (fileExplorer.hasNodes(item)) {
        return {
          ...item,
          children: fileExplorer.insertAfter(item.children ?? [], targetId, newItem),
        };
      }

      return item;
    });
  },
  insertChild<R extends IMediaFile2>(
    items: R[],
    targetId: string,
    newItem: R,
  ): R[] {
    return items.flatMap(item => {
      if (item.id === targetId) {
        // already a parent: add as first child
        return {
          ...item,
          // opening item so you can see where item landed
          expanded: true,
          children: [newItem, ...item.children ?? []],
        };
      }

      if (!fileExplorer.hasNodes(item)) {
        return item;
      }

      return {
        ...item,
        children: fileExplorer.insertChild(item.children ?? [], targetId, newItem),
      };
    });
  },
  find<R extends IMediaFile2>(items: R[], itemId: string): R | undefined {

    for (let i = 0; i < items.length; i += 1){
      const item = items[i];
      if (item.id === itemId) {
        return item;
      }

      if (fileExplorer.hasNodes(item)) {
        const result = fileExplorer.find(item.children ?? [], itemId);
        if (result) {
          return result as R;
        }
      }
    }
    return undefined;
  },
  createChild<R extends IMediaFile2>(items: R[], newItem: R, targetId: string | null) {
    let target = targetId === null ? null : fileExplorer.find(items, targetId);
    if (targetId === null || target !== undefined) {
      if (newItem.path !== undefined) {
        const paths = newItem.path.split('/')
        paths.pop();
        paths.forEach((path: string) => {
          if (path === '') {
            return;
          }
          const pathItem = target!.children?.find((child) => child.name === path);
          if (pathItem !== undefined) {
            target = pathItem as R;
          } else {
            const newId = namedId({id: 'file', length: 5});
            const newPath = {
              id: newId,
              itemId: newId,
              label: path,
              type: 'folder',
              children: [] as R[],
              parent: target ?? null
            } as unknown as R;
            console.log('newItem create child')
            fileExplorer.createChild(items, newPath, target?.id ?? null)
            target = newPath as R;
          }
        });
      }
      if (!target || targetId === null) {
        console.log('newItem2', newItem)
        items.push(newItem);
        return;
      }
      if (!target.children) {
        target.children = new Array<R>();
      }
      console.log('newItem3', newItem)
      target.children?.push(newItem);
    }
  },
  createChildren(items: IMediaFile2[], newChildren: IMediaFile2[], targetId: string | null) {
    newChildren.forEach((child) => {
      fileExplorer.createChild(items, child, targetId);
    })
  },
  getPathToItem({
                  current,
                  targetId,
                  parentIds = [],
                }: {
    current: IMediaFile2[];
    targetId: string;
    parentIds?: string[];
  }): string[] | undefined {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of current) {
      if (!item || !item.children || item.children.length === 0) {
        continue;
      }

      if (item?.id === targetId) {
        return parentIds;
      }

      const nested = fileExplorer.getPathToItem({
        current: item!.children,
        targetId,
        parentIds: [...parentIds!, item.id!],
      });
      if (nested) {
        return nested;
      }
    }
    return undefined;
  },
  hasNodes(item: IMediaFile2): boolean {
    return !!(item && item.children && item.children.length > 0);
  },
  calculateFolderSize(items: IMediaFile2[], id: string): number {
    const folder = fileExplorer.find(items, id);
    if (folder === undefined || folder.children === undefined) {
      return 0;
    }
    return folder.children
      .reduce(
        (accumulator, currentValue) => {
          if (currentValue.type === 'folder') {
            return fileExplorer.calculateFolderSize(items, currentValue.id! ?? currentValue.itemId) + accumulator;
          }
          return accumulator + (currentValue?.size || 0)
        },
        0,
      );
  },
};

export function getFileExplorerStateDefault<R extends IMediaFile2 = IMediaFile2>(items: R[] = []): FileExplorerState<R> {
  return {
    lastAction: null,
    items,
  }
}

const dataReducer = <R extends IMediaFile2>(items: R[], action: FileExplorerDndAction<R>) => {

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

  const item = fileExplorer.find(items, action.itemId);

  if (!item) {
    console.warn(`Task [${action.type}] failed: itemId ${action.itemId} was not found`);
    return items;
  }

  if (action.type === 'remove') {
    const result = fileExplorer.remove(items, action.itemId);
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
      let result = fileExplorer.remove(items, action.itemId);

      result = fileExplorer.insertAfter(result, desiredId, item);
      return result;
    }

    // the rest of the actions require you to drop on something else
    if (action.itemId === action.targetId) {
      return items;
    }

    if (instruction.type === 'reorder-above') {
      let result = fileExplorer.remove(items, action.itemId);
      result = fileExplorer.insertBefore(result, action.targetId, item);
      return result;
    }

    if (instruction.type === 'reorder-below') {
      let result = fileExplorer.remove(items, action.itemId);
      result = fileExplorer.insertAfter(result, action.targetId, item);
      return result;
    }

    if (instruction.type === 'make-child') {
      let result = fileExplorer.remove(items, action.itemId);
      result = fileExplorer.insertChild(result, action.targetId, item);
      return result;
    }

    console.warn('TODO: instruction not implemented', instruction, action);

    return items;
  }
  return items;
};

export function fileListStateReducer<R extends IMediaFile2>(
  state: FileExplorerState<R>,
  action: FileExplorerDndAction<R>,
): FileExplorerState<R> {
  const items = dataReducer(state.items, action);
  return {
    items: items as R[],
    lastAction: action,
  };
}


export type FileExplorerState<R extends IMediaFile2 = IMediaFile2> = {
  lastAction: FileExplorerDndAction<R> | null;
  items: R[];
};

export type FileExplorerDndContextValue<R extends IMediaFile2> = {
  dispatch: (action: FileExplorerDndAction<R>) => void;
  uniqueContextId: Symbol;
  getPathToItem: (itemId: string) => string[];
  getMoveTargets: ({ itemId }: { itemId: string }) => IMediaFile2[];
  getNodesOfItem: (itemId: string) => IMediaFile2[];
  registerFile: (args: {
    itemId: string;
    element: HTMLElement;
  }) => void;
};

export const FileExplorerDndContext = React.createContext<FileExplorerDndContextValue<IMediaFile2>>({
  dispatch: () => {},
  uniqueContextId: Symbol('uniqueId'),
  getPathToItem: () => [],
  getMoveTargets: () => [],
  getNodesOfItem: () => [],
  registerFile: () => {},
});
