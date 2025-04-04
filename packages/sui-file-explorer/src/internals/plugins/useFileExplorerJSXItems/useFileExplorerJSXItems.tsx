/**
 * The useFileExplorerJSXItems file exports a plugin that provides functionality for managing JSX items in the File Explorer.
 *
 * @module useFileExplorerJSXItems
 */

import React from 'react';
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
  buildSiblingIndexes, FILE_EXPLORER_RDF_ID_ATTR_NAME, FILE_EXPLORER_RDF_TYPE_NAME
} from './utils';

/**
 * Returns true if the provided children are expandable.
 *
 * @param {React.ReactNode} reactChildren The children to check for expandability.
 * @returns {boolean} True if the children are expandable, false otherwise.
 */
const isItemExpandable = (reactChildren: React.ReactNode) => {
  if (Array.isArray(reactChildren)) {
    return reactChildren.length > 0 && reactChildren.some(isItemExpandable);
  }
  return Boolean(reactChildren);
};

/**
 * The useFileExplorerJSXItemsItemPlugin file exports a plugin that provides functionality for managing individual items in the File Explorer.
 *
 * @module useFileExplorerJSXItemsItemPlugin
 */

const isItemExpandable = (reactChildren: React.ReactNode) => {
  if (Array.isArray(reactChildren)) {
    return reactChildren.length > 0 && reactChildren.some(isItemExpandable);
  }
  return Boolean(reactChildren);
};

/**
 * The useFileExplorerJSXItemsItemPlugin plugin provides functionality for managing individual items in the File Explorer.
 *
 * @param {Object} props The plugin's props, including children, rootRef, and contentRef.
 */
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

/**
 * Wraps the provided children in a FileExplorerChildrenItemProvider component.
 *
 * @param {Object} props The wrapper's props, including children and id.
 */
const useFileExplorerJSXItems.wrapItem = ({ children, id }) => {
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

/**
 * Wraps the provided children in a FileExplorerChildrenItemProvider component.
 *
 * @param {Object} props The wrapper's props, including children.
 */
const useFileExplorerJSXItems.wrapRoot = ({ children }) => (
  <FileExplorerChildrenItemProvider>
    <FileDepthContext.Provider value={0}>{children}</FileDepthContext.Provider>
  </FileExplorerChildrenItemProvider>
);

useFileExplorerJSXItems.params = {};