/**
 * File Explorer plugin for handling JSX items.
 * @typedef {import("../useFileExplorerGrid/useFileExplorerGrid.types").UseFileExplorerGridSignature} UseFileExplorerGridSignature
 * @typedef {import("./useFileExplorerJSXItems.types").UseFileExplorerJSXItemsSignature} UseFileExplorerJSXItemsSignature
 * @typedef {import("../../models").FileMeta} FileMeta
 * @typedef {import("../../models").FilePlugin} FilePlugin
 */

import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import useForkRef from '@mui/utils/useForkRef';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { namedId } from '@stoked-ui/common';
import { publishFileExplorerEvent } from '../../utils/publishFileExplorerEvent';
import { useFileExplorerContext } from '../../FileExplorerProvider/useFileExplorerContext';
import {
  FileExplorerChildrenItemContext,
  FileExplorerChildrenItemProvider,
} from '../../FileExplorerProvider/FileExplorerChildrenItemProvider';
import {
  buildSiblingIndexes,
  FILE_EXPLORER_VIEW_ROOT_PARENT_ID,
} from '../useFileExplorerFiles/useFileExplorerFiles.utils';
import { FileDepthContext } from '../../FileDepthContext';

/**
 * File Explorer JSX items hook.
 * @param {UseFileExplorerJSXItemsSignature} param0 - The configuration object.
 * @returns {{ instance: { insertJSXItem: Function, setJSXItemsOrderedChildrenIds: Function, mapFirstCharFromJSX: Function } }} The instance object with methods.
 */
export const useFileExplorerJSXItems = ({ instance, setState }) => {
  instance.preventItemUpdates();

  /**
   * Inserts a JSX item.
   * @param {FileMeta} item - The file metadata to insert.
   * @returns {Function} A function to remove the inserted item.
   */
  const insertJSXItem = useEventCallback((item) => {
    setState((prevState) => {
      if (prevState.items.itemMetaMap[item.id] != null) {
        throw new Error(
          'Stoked UI: The FileExplorer component requires all items to have a unique `id` property.'
        );
      }

      return {
        ...prevState,
        items: {
          ...prevState.items,
          itemMetaMap: { ...prevState.items.itemMetaMap, [item.id]: item },
          itemMap: { ...prevState.items.itemMap, [item.id]: { id: item.id, label: item.name } },
        },
      };
    });

    return () => {
      setState((prevState) => {
        const newItemMetaMap = { ...prevState.items.itemMetaMap };
        const newItemMap = { ...prevState.items.itemMap };
        delete newItemMetaMap[item.id];
        delete newItemMap[item.id];
        return {
          ...prevState,
          items: {
            ...prevState.items,
            itemMetaMap: newItemMetaMap,
            itemMap: newItemMap,
          },
        };
      });
      publishFileExplorerEvent(instance, 'removeItem', { id: item.id });
    };
  });

  /**
   * Sets ordered children IDs for an item.
   * @param {string | null} parentId - The parent item ID.
   * @param {string[]} orderedChildrenIds - The ordered children IDs.
   */
  const setJSXItemsOrderedChildrenIds = (parentId, orderedChildrenIds) => {
    const parentIdWithDefault = parentId ?? FILE_EXPLORER_VIEW_ROOT_PARENT_ID;

    setState((prevState) => ({
      ...prevState,
      items: {
        ...prevState.items,
        itemOrderedChildrenIds: {
          ...prevState.items.itemOrderedChildrenIds,
          [parentIdWithDefault]: orderedChildrenIds,
        },
        itemChildrenIndexes: {
          ...prevState.items.itemChildrenIndexes,
          [parentIdWithDefault]: buildSiblingIndexes(orderedChildrenIds),
        },
      },
    }));
  };

  /**
   * Maps the first character from JSX content.
   * @param {string} id - The item ID.
   * @param {string} firstChar - The first character.
   * @returns {Function} A function to remove the mapped character.
   */
  const mapFirstCharFromJSX = useEventCallback((id, firstChar) => {
    instance.updateFirstCharMap((firstCharMap) => {
      firstCharMap[id] = firstChar;
      return firstCharMap;
    });

    return () => {
      instance.updateFirstCharMap((firstCharMap) => {
        const newMap = { ...firstCharMap };
        delete newMap[id];
        return newMap;
      });
    };
  });

  return {
    instance: {
      insertJSXItem,
      setJSXItemsOrderedChildrenIds,
      mapFirstCharFromJSX,
    },
  };
};

/**
 * Checks if an item is expandable.
 * @param {React.ReactNode} reactChildren - The React children.
 * @returns {boolean} Whether the item is expandable.
 */
const isItemExpandable = (reactChildren) => {
  if (Array.isArray(reactChildren)) {
    return reactChildren.length > 0 && reactChildren.some(isItemExpandable);
  }
  return Boolean(reactChildren);
};

/**
 * File Explorer JSX items item plugin.
 * @param {FilePlugin} param0 - The configuration object.
 * @returns {{ contentRef: React.MutableRefObject<HTMLDivElement | null>, rootRef: React.MutableRefObject<any> }} The refs for content and root elements.
 */
const useFileExplorerJSXItemsItemPlugin = ({ props, rootRef, contentRef }) => {
  const { instance } = useFileExplorerContext<[UseFileExplorerGridSignature, UseFileExplorerJSXItemsSignature]>();
  const { children, disabled = false, name: initialName, id: initialId, visibleIndex } = props;
  const id = initialId ?? initialName ?? props.name ?? namedId({ id: 'file', length: 4 });
  const name = props.name ?? initialName ?? id;

  const parentContext = React.useContext(FileExplorerChildrenItemContext);
  if (parentContext == null) {
    throw new Error('SUI X: Could not find the FileExplorer View Children Item context.');
  }
  const { registerChild, unregisterChild, parentId } = parentContext;

  const expandable = isItemExpandable(children);
  const pluginContentRef = React.useRef<HTMLDivElement>(null);
  const handleContentRef = useForkRef(pluginContentRef, contentRef);

  useEnhancedEffect(() => {
    const idAttributeWithDefault = instance.getFileIdAttribute(id);
    registerChild(idAttributeWithDefault, id);

    return () => {
      unregisterChild(idAttributeWithDefault);
    };
  }, [instance, registerChild, unregisterChild, id]);

  React.useEffect(() => {
    return instance.insertJSXItem({
      id,
      parentId,
      expandable,
      disabled,
      dndState: 'idle',
      dndContainer: null,
      dndInstruction: null,
      visibleIndex
    });
  }, [instance, parentId, expandable, disabled, id, visibleIndex]);

  React.useEffect(() => {
    if (name) {
      return instance.mapFirstCharFromJSX(
        id,
        (pluginContentRef.current?.textContent ?? '').substring(0, 1).toLowerCase(),
      );
    }
    return undefined;
  }, [instance, id, name]);

  return {
    contentRef: handleContentRef,
    rootRef,
  };
};
useFileExplorerJSXItemsItemPlugin;

useFileExplorerJSXItems.itemPlugin = useFileExplorerJSXItemsItemPlugin;

/**
 * Wraps a JSX file item.
 * @param {{ children: React.ReactNode, id: string }} param0 - The children and ID of the item.
 * @returns {JSX.Element} The wrapped JSX element.
 */
useFileExplorerJSXItems.wrapItem = ({ children, id }) => {
  const depthContext = React.useContext(FileDepthContext);

  return (
    <FileExplorerChildrenItemProvider id={id}>
      <FileDepthContext.Provider value={(depthContext as number) + 1}>
        {children}
      </FileDepthContext.Provider>
    </FileExplorerChildrenItemProvider>
  );
};

/**
 * Wraps the root JSX item.
 * @param {{ children: React.ReactNode }} param0 - The children of the root item.
 * @returns {JSX.Element} The wrapped JSX element.
 */
useFileExplorerJSXItems.wrapRoot = ({ children }) => (
  <FileExplorerChildrenItemProvider>
    <FileDepthContext.Provider value={0}>{children}</FileDepthContext.Provider>
  </FileExplorerChildrenItemProvider>
);

useFileExplorerJSXItems.params = {};