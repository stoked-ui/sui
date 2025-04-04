/**
 * @interface UseFileExplorerIdInstance
 * @description Provides methods to get the id attribute of a fileExplorer item.
 */
export interface UseFileExplorerIdInstance {
  /**
   * Get the id attribute (i.e.: the `id` attribute passed to the DOM element) of a fileExplorer
   * item. If the user explicitly defined an id attribute, it will be returned. Otherwise, the
   * method created a unique id for the item based on the FileExplorer View id attribute and the
   * item `id`
   * @param {FileId} id The id of the item to get the id attribute of.
   * @param {string | undefined} idAttribute The id attribute of the item if explicitly defined by
   *   the user.
   * @returns {string} The id attribute of the item.
   */
  getFileIdAttribute: (id: FileId) => string;
}

/**
 * @interface UseFileExplorerIdParameters
 * @description Parameters for the use file explorer id hook.
 */
export interface UseFileExplorerIdParameters {
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id?: string;
}

/**
 * @type {UseFileExplorerIdParameters}
 */
export type UseFileExplorerIdDefaultizedParameters = UseFileExplorerIdParameters;

/**
 * @interface FileExplorerPluginSignature
 * @description Signature for the file explorer plugin.
 * @param {params} params The parameters for the plugin.
 * @param {defaultizedParams} defaultizedParams The defaultized parameters for the plugin.
 * @param {instance} instance The instance of the plugin.
 */
export type UseFileExplorerIdSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerIdParameters;
  defaultizedParams: UseFileExplorerIdDefaultizedParameters;
  instance: UseFileExplorerIdInstance;
}>;