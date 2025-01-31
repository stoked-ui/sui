import * as React from "react";
import invariant from "tiny-invariant";
import { namedId } from "@stoked-ui/common";
import { FileBase } from "../../../models";
import {FileExplorerDndAction} from "./FileExplorerDndAction";


export const fileExplorer = {
  remove<R extends FileBase>(items: R[], id: string): FileBase[] {
    return items
      .filter(item => item?.id !== id)
      .map(item => {
        if (fileExplorer.hasNodes(item)) {
          return {
            ...item,
            children: item.children ? fileExplorer.remove(item.children, id) : []
          };
        }
        return {...item, children: []};
      });
  },
  insertBefore<R extends FileBase>(
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
  insertAfter<R extends FileBase>(
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
  insertChild<R extends FileBase>(
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
  find<R extends FileBase>(items: R[], id: string): R | undefined {

    for (let i = 0; i < items.length; i += 1){
      const item = items[i];
      if (item.id === id) {
        return item;
      }

      if (fileExplorer.hasNodes(item)) {
        const result = fileExplorer.find(item.children ?? [], id);
        if (result) {
          return result as R;
        }
      }
    }
    return undefined;
  },
  createChild<R extends FileBase>(items: R[], newItem: R, targetId: string | null) {
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
              name: path,
              mediaType: 'folder',
              children: [] as R[],
              parent: target ?? null
            } as unknown as R;
            fileExplorer.createChild(items, newPath, target?.id ?? null)
            target = newPath as R;
          }
        });
      }
      if (!target || targetId === null) {
        items.push(newItem);
        return;
      }
      if (!target.children) {
        target.children = new Array<R>() as R[]
      }
      target.children?.push(newItem);
    }
  },
  createChildren(items: FileBase[], newChildren: FileBase[], targetId: string | null) {
    newChildren.forEach((child) => {
      fileExplorer.createChild(items, child, targetId);
    })
  },
  getPathToItem({
                  current,
                  targetId,
                  parentIds = [],
                }: {
    current: FileBase[];
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
  hasNodes(item: FileBase): boolean {
    return !!(item && item.children && item.children.length > 0);
  },
  calculateFolderSize(items: FileBase[], id: string): number {
    const folder = fileExplorer.find(items, id);
    if (folder === undefined || folder.children === undefined) {
      return 0;
    }
    return folder.children
      .reduce(
        (accumulator, currentValue) => {
          if (currentValue.type === 'folder') {
            return fileExplorer.calculateFolderSize(items, currentValue.id! ) + accumulator;
          }
          return accumulator + (currentValue?.size || 0)
        },
        0,
      );
  },
};

export function getFileExplorerStateDefault<R extends FileBase = FileBase>(items: R[] = []): FileExplorerState<R> {
  return {
    lastAction: null,
    items,
  }
}

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


export type FileExplorerState<R extends FileBase = FileBase> = {
  lastAction: FileExplorerDndAction<R> | null;
  items: R[];
};

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

export const FileExplorerDndContext = React.createContext<FileExplorerDndContextValue<FileBase>>({
  dispatch: () => {},
  uniqueContextId: Symbol('uniqueId'),
  getPathToItem: () => [],
  getMoveTargets: () => [],
  getNodesOfItem: () => [],
  registerFile: () => {},
});
