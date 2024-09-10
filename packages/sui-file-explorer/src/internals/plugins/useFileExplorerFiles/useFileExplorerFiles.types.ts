import {SxProps, Theme} from "@mui/system";
import {DefaultizedProps, FileExplorerPluginSignature, FileMeta} from '../../models';
import {FileBase, FileId} from '../../../models';
import {
  DndItemState, UseFileExplorerDndSignature
} from "../useFileExplorerDnd/useFileExplorerDnd.types";
import {UseFileExplorerExpansionSignature} from "../useFileExplorerExpansion";

interface FileProps {
  label: string;
  itemId: string;
  id: string | undefined;
  children?: FileProps[];
}

export interface UseFileExplorerFilesPublicAPI<R extends {}> {
  /**
   * Get the item with the given id.
   * When used in the `FileExplorerBasic`, it returns an object with the `id` and `label`
   * properties.
   * @param {string} itemId The id of the item to return.
   * @returns {R} The item with the given id.
   */
  getItem: (itemId: FileId) => R;
  /**
   * Get the DOM element of the item with the given id.
   * @param {TreeViewItemId} itemId The id of the item to get the DOM element of.
   * @returns {HTMLElement | null} The DOM element of the item with the given id.
   */
  getItemDOMElement: (itemId: FileId) => HTMLElement | null;
}

export interface UpdateNodesStateParameters
  extends Pick<
    UseFileExplorerFilesDefaultizedParameters<FileBase>,
    'items' | 'isItemDisabled' | 'getItemLabel' | 'getItemId'
  > {
}

export type ItemMode = 'standard' | 'last-in-group' | 'expanded';

export interface UseFileExplorerFilesInstance<R extends FileBase[] = FileBase[]> extends UseFileExplorerFilesPublicAPI<R> {
  recalcVisibleIndices: (items: FileBase[], force: boolean, index: number) => void;
  getVisibleIndex: (itemId: string) => number;
  updateItems: (item: R[]) => void;
  getFiles: () => R[];
  updateDndMeta: (itemId: string, state: DndItemState) => void;
  /**
   * Get the DOM element of the item with the given id.
   * @param {TreeViewItemId} itemId The id of the item to get the DOM element of.
   * @returns {HTMLElement | null} The DOM element of the item with the given id.
   */
  getItemDOMElement: (itemId: FileId) => HTMLElement | null;
  /**
   * Get the meta-information of an item.
   * Check the `FileMeta` type for more information.
   * @param {FileId} itemId The id of the item to get the meta-information of.
   * @returns {FileMeta} The meta-information of the item.
   */
  getItemMeta: (itemId: FileId) => FileMeta;
  /**
   * Get the item that should be rendered.
   * This method is only used on Rich FileExplorer View components.
   * Check the `FileProps` type for more information.
   * @returns {FileProps[]} The items to render.
   */
  getItemsToRender: () => FileProps[];
  /**
   * Get the ids of a given item's children.
   * Those ids are returned in the order they should be rendered.
   * @param {FileId | null} itemId The id of the item to get the children of.
   * @returns {FileId[]} The ids of the item's children.
   */
  getItemOrderedChildrenIds: (itemId: FileId | null) => FileId[];
  /**
   * Check if a given item is disabled.
   * An item is disabled if it was marked as disabled or if one of its ancestors is disabled.
   * @param {FileId} itemId The id of the item to check.
   * @returns {boolean} `true` if the item is disabled, `false` otherwise.
   */
  isItemDisabled: (itemId: FileId) => boolean;
  /**
   * Check if a given item is navigable (i.e.: if it can be accessed through keyboard navigation).
   * An item is navigable if it is not disabled or if the `disabledItemsFocusable` prop is `true`.
   * @param {FileId} itemId The id of the item to check.
   * @returns {boolean} `true` if the item is navigable, `false` otherwise.
   */
  isItemNavigable: (itemId: FileId) => boolean;
  /**
   * Get the index of a given item in its parent's children list.
   * @param {FileId} itemId The id of the item to get the index of.
   * @returns {number} The index of the item in its parent's children list.
   */
  getItemIndex: (itemId: FileId) => number;
  /**
   * Freeze any future update to the state based on the `items` prop.
   * This is useful when `useFileExplorerJSXItems` is used to avoid having conflicting sources of
   * truth.
   */
  preventItemUpdates: () => void;
  /**
   * Check if the updates to the state based on the `items` prop are prevented.
   * This is useful when `useFileExplorerJSXItems` is used to avoid having conflicting sources of
   * truth.
   * @returns {boolean} `true` if the updates to the state based on the `items` prop are prevented.
   */
  areItemUpdatesPrevented: () => boolean;
}

export interface UseFileExplorerFilesParameters<R extends FileBase = FileBase> {

  alternatingRows?: SxProps<Theme> | true;

  /**
   * If `true`, will allow focus on disabled items.
   * @default false
   */
  disabledItemsFocusable?: boolean;
  /**
   * Used to determine the id of a given item.
   *
   * @template R
   * @param {R} item The item to check.
   * @returns {string} The id of the item.
   * @default (item) => item.id
   */
  getItemId?: (item: R) => FileId;
  /**
   * Used to determine the string label for a given item.
   *
   * @template R
   * @param {R} item The item to check.
   * @returns {string} The label of the item.
   * @default (item) => item.label
   */
  getItemLabel?: (item: R) => string;
  /**
   * Used to determine if a given item should be disabled.
   * @template R
   * @param {R} item The item to check.
   * @returns {boolean} `true` if the item should be disabled.
   */
  isItemDisabled?: (item: R) => boolean;
  /**
   * Horizontal indentation between an item and its children.
   * Examples: 24, "24px", "2rem", "2em".
   * @default 12px
   */
  itemChildrenIndentation?: string | number;
  items: readonly R[];
}

export type UseFileExplorerFilesDefaultizedParameters<R extends FileBase> = DefaultizedProps<
  UseFileExplorerFilesParameters<R>,
  'disabledItemsFocusable' | 'itemChildrenIndentation'
>

export interface UseFileExplorerFilesEventLookup {
  removeItem: {
    params: { id: string };
  };
}

export interface UseFileExplorerFilesState<R extends {}> {
  items: {
    itemMetaMap: FileMetaMap;
    itemMap: FileMap<R>;
    itemOrderedChildrenIds: { [parentItemId: string]: string[] };
    itemChildrenIndexes: { [parentItemId: string]: { [itemId: string]: number } };
    indiciesDirty: boolean;
  };
}

export interface UseFileExplorerFilesContextValue
  extends Pick<UseFileExplorerFilesDefaultizedParameters<any>, 'disabledItemsFocusable'> {
  indentationAtItemLevel: boolean;
  alternatingRows?: SxProps<Theme>;
}


export type UseFileExplorerFilesSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerFilesParameters<any>;
  defaultizedParams: UseFileExplorerFilesDefaultizedParameters<any>;
  instance: UseFileExplorerFilesInstance<any>;
  publicAPI: UseFileExplorerFilesPublicAPI<any>;
  events: UseFileExplorerFilesEventLookup;
  state: UseFileExplorerFilesState<any>;
  contextValue: UseFileExplorerFilesContextValue;
  dependencies: [UseFileExplorerExpansionSignature,UseFileExplorerDndSignature]
  experimentalFeatures: 'indentationAtItemLevel';
}>;

export type FileMetaMap = { [itemId: string]: FileMeta };

export type FileMap<R extends {}> = { [itemId: string]: R };
