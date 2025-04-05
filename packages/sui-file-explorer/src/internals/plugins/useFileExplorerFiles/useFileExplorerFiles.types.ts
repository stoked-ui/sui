/**
 * Interface for defining the properties of a file in the file explorer.
 * @typedef {Object} FileProps
 * @property {string} name - The name of the file.
 * @property {string} id - The unique identifier of the file.
 * @property {FileProps[]} [children] - Optional children files of this file.
 */

/**
 * Public API interface for handling file operations in the file explorer.
 * @template R
 * @typedef {Object} UseFileExplorerFilesPublicAPI
 * @property {function} getItem - Get the item with the given id.
 * @property {function} getItemDOMElement - Get the DOM element of the item with the given id.
 * @property {function} getItemOrderedChildrenIds - Get the ids of a given item's children.
 */

/**
 * Parameters for updating the state of the file explorer nodes.
 * @typedef {Object} UpdateNodesStateParameters
 * @property {FileBase[]} items - The items to update.
 * @property {function} isItemDisabled - Function to determine if an item is disabled.
 * @property {function} getItemLabel - Function to get the label of an item.
 * @property {function} getItemId - Function to get the id of an item.
 */

/**
 * Type for specifying the mode of an item in the file explorer.
 * @typedef {'standard' | 'last-in-group' | 'expanded'} ItemMode
 */

/**
 * Instance interface for managing file operations in the file explorer.
 * @template R
 * @typedef {Object} UseFileExplorerFilesInstance
 * @property {function} areItemUpdatesPrevented - Check if updates to state based on items prop are prevented.
 * @property {function} getFiles - Get all the files.
 * @property {function} getItemDOMElement - Get the DOM element of the item with the given id.
 * @property {function} getItemIndex - Get the index of an item in its parent's children list.
 * @property {function} getItemMeta - Get the meta-information of an item.
 * @property {function} getItemsToRender - Get the items to render.
 * @property {function} getVisibleIndex - Get the visible index of an item.
 * @property {function} isItemDisabled - Check if an item is disabled.
 * @property {function} isItemNavigable - Check if an item is navigable.
 * @property {function} preventItemUpdates - Prevent future updates to the state based on the items prop.
 * @property {function} recalcVisibleIndices - Recalculate visible indices of items.
 * @property {function} updateDndMeta - Update the drag-and-drop meta of an item.
 * @property {function} updateItems - Update the items in the file explorer.
 */

/**
 * Parameters for configuring the file explorer files.
 * @template R
 * @typedef {Object} UseFileExplorerFilesParameters
 * @property {SxProps<Theme> | true} [alternatingRows] - Styling for alternating rows.
 * @property {boolean} [disabledItemsFocusable=false] - Allow focus on disabled items.
 * @property {function} [getItemId] - Function to get the id of an item.
 * @property {function} [getItemLabel] - Function to get the label of an item.
 * @property {function} [isItemDisabled] - Function to check if an item is disabled.
 * @property {string | number} [itemChildrenIndentation=12px] - Horizontal indentation between item and children.
 * @property {readonly R[]} items - The list of items for the file explorer.
 */

/**
 * Defaultized parameters for file explorer files with default values.
 * @template R
 * @typedef {Object} UseFileExplorerFilesDefaultizedParameters
 */

/**
 * Event lookup interface for file explorer file operations.
 * @typedef {Object} UseFileExplorerFilesEventLookup
 * @property {Object} removeItem - Parameters for removing an item.
 */

/**
 * State interface for managing file explorer files.
 * @template R
 * @typedef {Object} UseFileExplorerFilesState
 * @property {FileMetaMap} itemMetaMap - Map of file metadata.
 * @property {FileMap<R>} itemMap - Map of items.
 * @property {Object} itemOrderedChildrenIds - Map of parent item to children ids.
 * @property {Object} itemChildrenIndexes - Map of parent item to children indexes.
 * @property {boolean} indiciesDirty - Flag indicating dirty indices.
 */

/**
 * Context value interface for the file explorer files.
 * @typedef {Object} UseFileExplorerFilesContextValue
 */

/**
 * Signature for the file explorer plugin.
 * @typedef {Object} UseFileExplorerFilesSignature
 */

/**
 * Map of file metadata.
 * @typedef {Object} FileMetaMap
 */

/**
 * Map of files with unique identifiers.
 * @template R
 * @typedef {Object} FileMap
 */
import {SxProps, Theme} from "@mui/system";
import {DefaultizedProps, FileExplorerPluginSignature, FileMeta} from '../../models';
import { FileId, FileBase} from '../../../models';
import {
  DndItemState, UseFileExplorerDndSignature
} from "../useFileExplorerDnd/useFileExplorerDnd.types";
import {UseFileExplorerExpansionSignature} from "../useFileExplorerExpansion";
import * as React from "react";

/**
 * Interface for defining the properties of a file in the file explorer.
 * @typedef {Object} FileProps
 * @property {string} name - The name of the file.
 * @property {string} id - The unique identifier of the file.
 * @property {FileProps[]} [children] - Optional children files of this file.
 */

/**
 * Public API interface for handling file operations in the file explorer.
 * @template R
 * @typedef {Object} UseFileExplorerFilesPublicAPI
 * @property {function} getItem - Get the item with the given id.
 * @property {function} getItemDOMElement - Get the DOM element of the item with the given id.
 * @property {function} getItemOrderedChildrenIds - Get the ids of a given item's children.
 */

/**
 * Parameters for updating the state of the file explorer nodes.
 * @typedef {Object} UpdateNodesStateParameters
 * @property {FileBase[]} items - The items to update.
 * @property {function} isItemDisabled - Function to determine if an item is disabled.
 * @property {function} getItemLabel - Function to get the label of an item.
 * @property {function} getItemId - Function to get the id of an item.
 */

/**
 * Type for specifying the mode of an item in the file explorer.
 * @typedef {'standard' | 'last-in-group' | 'expanded'} ItemMode
 */

/**
 * Instance interface for managing file operations in the file explorer.
 * @template R
 * @typedef {Object} UseFileExplorerFilesInstance
 * @property {function} areItemUpdatesPrevented - Check if updates to state based on items prop are prevented.
 * @property {function} getFiles - Get all the files.
 * @property {function} getItemDOMElement - Get the DOM element of the item with the given id.
 * @property {function} getItemIndex - Get the index of an item in its parent's children list.
 * @property {function} getItemMeta - Get the meta-information of an item.
 * @property {function} getItemsToRender - Get the items to render.
 * @property {function} getVisibleIndex - Get the visible index of an item.
 * @property {function} isItemDisabled - Check if an item is disabled.
 * @property {function} isItemNavigable - Check if an item is navigable.
 * @property {function} preventItemUpdates - Prevent future updates to the state based on the items prop.
 * @property {function} recalcVisibleIndices - Recalculate visible indices of items.
 * @property {function} updateDndMeta - Update the drag-and-drop meta of an item.
 * @property {function} updateItems - Update the items in the file explorer.
 */

/**
 * Parameters for configuring the file explorer files.
 * @template R
 * @typedef {Object} UseFileExplorerFilesParameters
 * @property {SxProps<Theme> | true} [alternatingRows] - Styling for alternating rows.
 * @property {boolean} [disabledItemsFocusable=false] - Allow focus on disabled items.
 * @property {function} [getItemId] - Function to get the id of an item.
 * @property {function} [getItemLabel] - Function to get the label of an item.
 * @property {function} [isItemDisabled] - Function to check if an item is disabled.
 * @property {string | number} [itemChildrenIndentation=12px] - Horizontal indentation between item and children.
 * @property {readonly R[]} items - The list of items for the file explorer.
 */

/**
 * Defaultized parameters for file explorer files with default values.
 * @template R
 * @typedef {Object} UseFileExplorerFilesDefaultizedParameters
 */

/**
 * Event lookup interface for file explorer file operations.
 * @typedef {Object} UseFileExplorerFilesEventLookup
 * @property {Object} removeItem - Parameters for removing an item.
 */

/**
 * State interface for managing file explorer files.
 * @template R
 * @typedef {Object} UseFileExplorerFilesState
 * @property {FileMetaMap} itemMetaMap - Map of file metadata.
 * @property {FileMap<R>} itemMap - Map of items.
 * @property {Object} itemOrderedChildrenIds - Map of parent item to children ids.
 * @property {Object} itemChildrenIndexes - Map of parent item to children indexes.
 * @property {boolean} indiciesDirty - Flag indicating dirty indices.
 */

/**
 * Context value interface for the file explorer files.
 * @typedef {Object} UseFileExplorerFilesContextValue
 */

/**
 * Signature for the file explorer plugin.
 * @typedef {Object} UseFileExplorerFilesSignature
 */

/**
 * Map of file metadata.
 * @typedef {Object} FileMetaMap
 */

/**
 * Map of files with unique identifiers.
 * @template R
 * @typedef {Object} FileMap
 */
```typescript