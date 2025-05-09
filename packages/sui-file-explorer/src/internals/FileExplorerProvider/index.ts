/**
 * Exported module from FileExplorerProvider
 */
export { FileExplorerProvider } from './FileExplorerProvider';

/**
 * Type definitions for FileExplorerProvider module
 * @typedef {Object} FileExplorerProviderProps - Props for FileExplorerProvider
 * @property {string} initialPath - The initial path for the file explorer
 * @property {boolean} showHiddenFiles - Whether to show hidden files in the file explorer
 * @typedef {Object} FileExplorerContextValue - Context value for FileExplorerProvider
 * @property {string} currentPath - The current path in the file explorer
 * @property {string[]} selectedFiles - Array of selected file paths
 * @typedef {Object} FilePluginsRunner - Interface for file plugins runner
 * @property {function} runPlugins - Function to run file plugins
 */
export type {
  FileExplorerProviderProps,
  FileExplorerContextValue,
  FilePluginsRunner,
} from './FileExplorerProvider.types';