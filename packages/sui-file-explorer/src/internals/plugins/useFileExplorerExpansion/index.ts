/**
 * Exported hook for managing file explorer expansion.
 */
export { useFileExplorerExpansion } from './useFileExplorerExpansion';

/**
 * Type definition for the useFileExplorerExpansion hook's signature.
 *
 * @type {object}
 * @property {function} [options] - Options object for customizing the file explorer expansion behavior.
 * @property {function} [updateState] - Callback function to update the state of the file explorer expansion.
 */
export type {
  UseFileExplorerExpansionSignature,
  /**
   * Defaultized parameters for the useFileExplorerExpansion hook.
   *
   * @typedef {object} UseFileExplorerExpansionParameters
   * @property {object} [options] - Options object for customizing the file explorer expansion behavior.
   * @property {function} [updateState] - Callback function to update the state of the file explorer expansion.
   */
  UseFileExplorerExpansionParameters,
  /**
   * Defaultized parameters for the useFileExplorerExpansion hook with options and updateState callbacks.
   *
   * @typedef {object} UseFileExplorerExpansionDefaultizedParameters
   * @property {function} [options] - Options object for customizing the file explorer expansion behavior.
   * @property {function} [updateState] - Callback function to update the state of the file explorer expansion.
   */
  UseFileExplorerExpansionDefaultizedParameters,
};