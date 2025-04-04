/**
 * Re-exports the file explorer icons hook and its types.
 */
export { useFileExplorerIcons } from './useFileExplorerIcons';

/**
 * Type definitions for the file explorer icons hook.
 *
 * @interface UseFileExplorerIconsSignature
 * @see {@link UseFileExplorerIconsParameters} for parameter details.
 * @see {@link UseFileExplorerIconsDefaultizedParameters} for default parameters.
 */
export type {
  /**
   * The signature of the useFileExplorerIcons hook, including its parameters and return value.
   *
   * @param {Object} options - Configuration options for the file explorer icons hook.
   * @returns {Object} - An object containing the file explorer icons.
   */
  UseFileExplorerIconsSignature,
  
  /**
   * The parameters of the useFileExplorerIcons hook, including their types and descriptions.
   *
   * @param {string} iconId - The ID of the icon to use.
   * @param {Object} options - Configuration options for the file explorer icons hook.
   */
  UseFileExplorerIconsParameters,
  
  /**
   * Defaultized parameters for the useFileExplorerIcons hook, including their types and descriptions.
   *
   * @see {@link UseFileExplorerIconsParameters} for parameter details.
   */
  UseFileExplorerIconsDefaultizedParameters,
};