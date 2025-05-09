import * as React from 'react';
import PropTypes from 'prop-types';
import { useFileExplorerContext } from './useFileExplorerContext';
import { escapeOperandAttributeSelector } from '../utils/utils';
import type {
  UseFileExplorerJSXItemsSignature
} from '../plugins/useFileExplorerJSXItems/useFileExplorerJSXItems.types';
import type {
  UseFileExplorerFilesSignature
} from '../plugins/useFileExplorerFiles/useFileExplorerFiles.types';
import { UseFileExplorerDndSignature } from '../plugins/useFileExplorerDnd/useFileExplorerDnd.types';

/**
 * Context for children items within the file explorer.
 */
export const FileExplorerChildrenItemContext =
  React.createContext<FileExplorerChildrenItemContextValue | null>(null);

if (process.env.NODE_ENV !== 'production') {
  FileExplorerChildrenItemContext.displayName = 'FileExplorerChildrenItemContext';
}

/**
 * Props for the FileExplorerChildrenItemProvider component.
 */
interface FileExplorerChildrenItemProviderProps {
  id?: string;
  children: React.ReactNode;
}

/**
 * Provides a context for children items within the file explorer.
 * @param {FileExplorerChildrenItemProviderProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export function FileExplorerChildrenItemProvider(props: FileExplorerChildrenItemProviderProps) {
  const { children, id = null } = props;

  const { instance, rootRef } =
    useFileExplorerContext<[UseFileExplorerJSXItemsSignature, UseFileExplorerFilesSignature, UseFileExplorerDndSignature]>();
  const childrenIdAttrToIdRef = React.useRef<Map<string, string>>(new Map());

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
  });

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
 * PropTypes for the FileExplorerChildrenItemProvider component.
 */
FileExplorerChildrenItemProvider.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
} as any;

/**
 * The context value for children items within the file explorer.
 */
interface FileExplorerChildrenItemContextValue {
  registerChild: (idAttribute: string, id: string) => void;
  unregisterChild: (idAttribute: string) => void;
  parentId: string | null;
}