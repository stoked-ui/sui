/**
 * Exported module for using file explorer icons.
 */
export { useFileExplorerIcons } from './useFileExplorerIcons';

/**
 * Type definitions for using file explorer icons.
 * @typedef {Object} UseFileExplorerIconsSignature
 * @property {Function} getIcon - Function to get the icon for a given file type.
 * @property {Function} setCustomIcons - Function to set custom icons for file types.
 */

/**
 * Type definitions for parameters when using file explorer icons.
 * @typedef {Object} UseFileExplorerIconsParameters
 * @property {Object} defaultIcons - Default icons for common file types.
 * @property {Object} customIcons - Custom icons for specific file types.
 */

/**
 * Type definitions for defaultized parameters when using file explorer icons.
 * @typedef {Object} UseFileExplorerIconsDefaultizedParameters
 * @property {Object} defaultIcons - Defaultized icons for common file types.
 * @property {Object} customIcons - Customized icons for specific file types.
 */
export type {
  UseFileExplorerIconsSignature,
  UseFileExplorerIconsParameters,
  UseFileExplorerIconsDefaultizedParameters,
} from './useFileExplorerIcons.types';