import * as React from 'react';
import useEventCallback from '@mui/utils/useEventCallback';
import useForkRef from '@mui/utils/useForkRef';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { namedId} from '@stoked-ui/common';
import {UseFileExplorerGridSignature} from "../useFileExplorerGrid/useFileExplorerGrid.types";
import {FileExplorerPlugin, FileMeta, FilePlugin} from '../../models';
import {UseFileExplorerJSXItemsSignature} from './useFileExplorerJSXItems.types';
import {publishFileExplorerEvent} from '../../utils/publishFileExplorerEvent';
import {useFileExplorerContext} from '../../FileExplorerProvider/useFileExplorerContext';
import {
  FileExplorerChildrenItemContext, FileExplorerChildrenItemProvider,
} from '../../FileExplorerProvider/FileExplorerChildrenItemProvider';
import {
  buildSiblingIndexes, FILE_EXPLORER_VIEW_ROOT_PARENT_ID,
} from '../useFileExplorerFiles/useFileExplorerFiles.utils';
import {FileDepthContext} from '../../FileDepthContext';

export const useFileExplorerJSXItems: FileExplorerPlugin<UseFileExplorerJSXItemsSignature> = ({
  instance,
  setState,
}) => {
  instance.preventItemUpdates();

  const insertJSXItem = useEventCallback((item: FileMeta) => {
    setState((prevState) => {
      if (prevState.items.itemMetaMap[item.id] != null) {
        throw new Error(
          [
            'SUI X: The FileExplorer View component requires all items to have a unique `id` property.',
            'Alternatively, you can use the `getItemId` prop to specify a custom id for each item.',
            `Two items were provided with the same id in the \`items\` prop: "${item.id}"`,
          ].join('\n'),
        );
      }

      return {
        ...prevState,
        items: {
          ...prevState.items,
          itemMetaMap: { ...prevState.items.itemMetaMap, [item.id]: item },
          // For `FileExplorerBasic`, we don't have a proper `item` object, so we create a very basic one.
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

  const setJSXItemsOrderedChildrenIds = (parentId: string | null, orderedChildrenIds: string[]) => {
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

  const mapFirstCharFromJSX = useEventCallback((id: string, firstChar: string) => {
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

const isItemExpandable = (reactChildren: React.ReactNode) => {
  if (Array.isArray(reactChildren)) {
    return reactChildren.length > 0 && reactChildren.some(isItemExpandable);
  }
  return Boolean(reactChildren);
};

const useFileExplorerJSXItemsItemPlugin: FilePlugin = ({
  props,
  rootRef,
  contentRef,
}) => {
  const { instance } = useFileExplorerContext<[UseFileExplorerGridSignature, UseFileExplorerJSXItemsSignature]>();
  const { children, disabled = false, name: initialName, id: initialId, visibleIndex} = props;
  const id = initialId ?? initialName ?? props.name ?? namedId({id: 'file', length: 4});
  const name = props.name ?? initialName ?? id;

  const parentContext = React.useContext(FileExplorerChildrenItemContext);
  if (parentContext == null) {
    throw new Error(
      [
        'SUI X: Could not find the FileExplorer View Children Item context.',
        'It looks like you rendered your component outside of a FileExplorerBasic parent component.',
        'This can also happen if you are bundling multiple versions of the FileExplorer View.',
      ].join('\n'),
    );
  }
  const { registerChild, unregisterChild, parentId } = parentContext;

  const expandable = isItemExpandable(children);
  const pluginContentRef = React.useRef<HTMLDivElement>(null);
  const handleContentRef = useForkRef(pluginContentRef, contentRef);
  // Prevent any flashing
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

useFileExplorerJSXItems.itemPlugin = useFileExplorerJSXItemsItemPlugin;

useFileExplorerJSXItems.wrapItem = ({ children, id }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const depthContext = React.useContext(FileDepthContext);

  return (
    <FileExplorerChildrenItemProvider id={id}>
      <FileDepthContext.Provider value={(depthContext as number) + 1}>
        {children}
      </FileDepthContext.Provider>
    </FileExplorerChildrenItemProvider>
  );
};

useFileExplorerJSXItems.wrapRoot = ({ children }) => (
  <FileExplorerChildrenItemProvider>
    <FileDepthContext.Provider value={0}>{children}</FileDepthContext.Provider>
  </FileExplorerChildrenItemProvider>
);

useFileExplorerJSXItems.params = {};
