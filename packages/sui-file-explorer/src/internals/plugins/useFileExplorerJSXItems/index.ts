/**
 * Exported function to generate JSX items for the file explorer.
 */
export { useFileExplorerJSXItems } from './useFileExplorerJSXItems';

/**
 * Interface and type documentation for the useFileExplorerJSXItems export.
 *
 * @interface UseFileExplorerJSXItemsSignature
 * @description Signature of the useFileExplorerJSXItems function.
 */
export type {
  /**
   * @typedef {Object} UseFileExplorerJSXItemsParameters
   * @property {string[]} items - The list of JSX items to be used in the file explorer.
   * @property {object} options - Optional parameters for customizing the file explorer behavior.
   */
  UseFileExplorerJSXItemsParameters,
  /**
   * @typedef {Object} UseFileExplorerFilesDefaultizedParameters
   * @property {string[]} files - The list of default files to be used in the file explorer.
   */
  UseFileExplorerFilesDefaultizedParameters,
};