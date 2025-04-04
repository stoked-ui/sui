/**
 * Re-exports the useFileExplorerSelection hook and its types.
 */

 export { 
  /**
   * The useFileExplorerSelection hook, which manages file explorer selection state.
   */
  useFileExplorerSelection 
} from './useFileExplorerSelection';

export type {
  /**
   * The signature of the useFileExplorerSelection hook.
   *
   * @param parameters - The parameters for the useFileExplorerSelection hook.
   * @returns {Object} The returned object with file explorer selection state.
   */
  UseFileExplorerSelectionSignature,

  /**
   * The parameters for the useFileExplorerSelection hook.
   *
   * @typedef {Object} UseFileExplorerSelectionParameters
   * @property {function} [defaultizedParameters] - An optional function to defaultize the parameters.
   */

  /**
   * The defaultized parameters for the useFileExplorerSelection hook.
   *
   * @typedef {Object} UseFileExplorerSelectionDefaultizedParameters
   * @property {Object} [fileSystem] - The file system object.
   * @property {string} [currentPath] - The current path in the file explorer.
   */

  /**
   * The defaultized parameters for the useFileExplorerSelection hook with optional file system and current path properties.
   *
   * @typedef {Object} UseFileExplorerSelectionDefaultizedParameters
   * @property {function} [defaultizedParameters] - An optional function to defaultize the parameters.
   * @property {Object} [fileSystem] - The file system object.
   * @property {string} [currentPath] - The current path in the file explorer.
   */
  UseFileExplorerSelectionDefaultizedParameters
} from './useFileExplorerSelection.types';