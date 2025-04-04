/**
 * @module FileExplorerChildrenItemProvider
 * @description Provides context for file explorer children items.
 */

import * as React from 'react';
import PropTypes from 'prop-types';
import {useFileExplorerContext} from './useFileExplorerContext';
import {escapeOperandAttributeSelector} from '../utils/utils';
import type {
  UseFileExplorerJSXItemsSignature
} from '../plugins/useFileExplorerJSXItems/useFileExplorerJSXItems.types';
import type {
  UseFileExplorerFilesSignature
} from '../plugins/useFileExplorerFiles/useFileExplorerFiles.types';
import {UseFileExplorerDndSignature} from '../plugins/useFileExplorerDnd/useFileExplorerDnd.types';

/**
 * Context for file explorer children items.
 */
export const FileExplorerChildrenItemContext =
  React.createContext<FileExplorerChildrenItemContextValue | null>(null);

if (process.env.NODE_ENV !== 'production') {
  FileExplorerChildrenItemContext.displayName = 'FileExplorerChildrenItemContext';
}

/**
 * Props for the FileExplorerChildrenItemProvider component.
 *
 * @interface FileExplorerChildrenItemProviderProps
 */
interface FileExplorerChildrenItemProviderProps {
  /**
   * Unique identifier for the provider instance.
   */
  id?: string;
  /**
   * Child elements to be wrapped by the provider context.
   */
  children: React.ReactNode;
}

/**
 * Provides context for file explorer children items and updates the instance accordingly.
 *
 * @function FileExplorerChildrenItemProvider
 * @param {FileExplorerChildrenItemProviderProps} props - Component props.
 * @returns {JSX.Element} Wrapped child elements with provider context.
 */
export function FileExplorerChildrenItemProvider(props: FileExplorerChildrenItemProviderProps) {
  const { children, id = null } = props;

  const { instance, rootRef } =
    useFileExplorerContext<[UseFileExplorerJSXItemsSignature, UseFileExplorerFilesSignature, UseFileExplorerDndSignature]>();
  const childrenIdAttrToIdRef = React.useRef<Map<string, string>>(new Map());

  /**
   * Effect hook to update the instance when child elements change.
   */
  React.useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    let idAttr: string | null = null;
    if (id == null) {
      idAttr = rootRef.current.id;
    } else {
      // Undefined during 1st render
      const itemMeta = instance.getItemMeta(id);
      if (itemMeta !== undefined) {
        idAttr = instance.getFileIdAttribute(id);
      }
    }

    if (idAttr == null) {
      return;
    }

    const previousChildrenIds = instance.getItemOrderedChildrenIds(id ?? null) ?? [];
    const escapedIdAttr = escapeOperandAttributeSelector(idAttr);
    const childrenElements = rootRef.current.querySelectorAll(
      `${id == null ? '' : `*[id="${escapedIdAttr}"] `}[role="fileexploreritem"]:not(*[id="${escapedIdAttr}"] [role="fileexploreritem"] [role="fileexploreritem"])`,
    );
    const childrenIds = Array.from(childrenElements).map(
      (child) => childrenIdAttrToIdRef.current.get(child.id)!,
    );

    const hasChanged =
      childrenIds.length !== previousChildrenIds.length ||
      childrenIds.some((childId, index) => childId !== previousChildrenIds[index]);
    if (hasChanged) {
      instance.setJSXItemsOrderedChildrenIds(id ?? null, childrenIds);
    }
  }, [id]);

  /**
   * Memoized value of the provider context.
   */
  const value = React.useMemo<FileExplorerChildrenItemContextValue>(
    () => ({
      registerChild: (childIdAttribute, childItemId) =>
        childrenIdAttrToIdRef.current.set(childIdAttribute, childItemId),
      unregisterChild: (childIdAttribute) => childrenIdAttrToIdRef.current.delete(childIdAttribute),
      parentId: id,
    }),
    [id],
  );

  return (
    <FileExplorerChildrenItemContext.Provider value={value}>
      {children}
    </FileExplorerChildrenItemContext.Provider>
  );
}

/**
 * Prop types for the FileExplorerChildrenItemProvider component.
 */
FileExplorerChildrenItemProvider.propTypes = {
  /**
   * Child elements to be wrapped by the provider context.
   */
  children: PropTypes.node,
  /**
   * Unique identifier for the provider instance.
   */
  id: PropTypes.string,
} as any;

/**
 * Context value provided by the FileExplorerChildrenItemProvider component.
 *
 * @interface FileExplorerChildrenItemContextValue
 */
interface FileExplorerChildrenItemContextValue {
  /**
   * Registers a child element with the given ID attribute and ID.
   */
  registerChild: (idAttribute: string, id: string) => void;
  /**
   * Unregisters a child element by its ID attribute.
   */
  unregisterChild: (idAttribute: string) => void;
  /**
   * Parent ID of the provider instance.
   */
  parentId: string;
}