/**
 * Exports the FileExplorerProvider component.
 */
export { FileExplorerProvider } from './FileExplorerProvider';

/**
 * Type definitions for FileExplorerProvider components and context value.
 *
 * @interface FileExplorerProviderProps
 * @property {object} plugins - Array of plugin objects.
 * @property {function} runPlugins - Function to run the plugins.
 * @property {object} fileSystemContext - File system context object.
 */
export type {
  FileExplorerProviderProps,
  /**
   * Context value for FileExplorerProvider.
   *
   * @typedef {Object} FileExplorerContextValue
   * @property {Array<object>} files - Array of file objects.
   * @property {object} fileSystem - File system object.
   */
  FileExplorerContextValue,
  /**
   * Function to run the plugins.
   *
   * @param {object} context - Context object.
   * @returns {Promise<void>}
   */
  FilePluginsRunner,
} from './FileExplorerProvider.types';