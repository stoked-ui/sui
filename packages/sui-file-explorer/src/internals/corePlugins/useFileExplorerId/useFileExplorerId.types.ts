import {FileExplorerPluginSignature} from '../../models';
import {FileId} from '../../../models';

export interface UseFileExplorerIdInstance {
  /**
   * Get the id attribute (i.e.: the `id` attribute passed to the DOM element) of a fileExplorer
   * item. If the user explicitly defined an id attribute, it will be returned. Otherwise, the
   * method created a unique id for the item based on the FileExplorer View id attribute and the
   * item `itemId`
   * @param {FileId} itemId The id of the item to get the id attribute of.
   * @param {string | undefined} idAttribute The id attribute of the item if explicitly defined by
   *   the user.
   * @returns {string} The id attribute of the item.
   */
  getFileIdAttribute: (itemId: FileId, idAttribute: string | undefined) => string;
}

export interface UseFileExplorerIdParameters {
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id?: string;
}

export type UseFileExplorerIdDefaultizedParameters = UseFileExplorerIdParameters;

export type UseFileExplorerIdSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerIdParameters;
  defaultizedParams: UseFileExplorerIdDefaultizedParameters;
  instance: UseFileExplorerIdInstance;
}>;
