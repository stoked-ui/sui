import { FileExplorerPluginSignature } from '../../models';
import { FileId } from '../../../models';

/**
 * Represents an instance of a file explorer with methods related to handling file IDs.
 */
export interface UseFileExplorerIdInstance {
  /**
   * Get the id attribute of a fileExplorer item.
   * If the user explicitly defined an id attribute, it will be returned. Otherwise, a unique id
   * for the item is created based on the FileExplorer View id attribute and the item id.
   * @param {FileId} id The id of the item to get the id attribute of.
   * @param {string | undefined} idAttribute The id attribute of the item if explicitly defined by
   *   the user.
   * @returns {string} The id attribute of the item.
   */
  getFileIdAttribute: (id: FileId) => string;
}

/**
 * Represents the parameters used in the UseFileExplorerId hook.
 */
export interface UseFileExplorerIdParameters {
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop, it falls back to a randomly generated id.
   */
  id?: string;
}

/**
 * Represents the defaultized parameters for the UseFileExplorerId hook.
 */
export type UseFileExplorerIdDefaultizedParameters = UseFileExplorerIdParameters;

/**
 * Represents the signature of the UseFileExplorerId hook.
 */
export type UseFileExplorerIdSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerIdParameters;
  defaultizedParams: UseFileExplorerIdDefaultizedParameters;
  instance: UseFileExplorerIdInstance;
}>;