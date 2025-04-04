/**
 * Exports the core plugins for the file explorer view.
 */
export { FILE_EXPLORER_VIEW_CORE_PLUGINS } from './corePlugins';

/**
 * Type definitions for the file explorer core plugin signatures and parameters.
 *
 * @typedef {object} FileExplorerCorePluginSignatures
 *   @property {string} name - The name of the plugin.
 *   @property {function} onFileSelected - The function to call when a file is selected.
 *
 * @typedef {object} FileExplorerCorePluginParameters
 *   @property {string} fileName - The name of the file to select.
 *   @property {boolean} isFolder - Whether the selected item is a folder.
 */
export type { FileExplorerCorePluginSignatures, FileExplorerCorePluginParameters } from './corePlugins';