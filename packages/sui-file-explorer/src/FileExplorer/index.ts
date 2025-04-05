/**
 * Exported components and types related to the File Explorer functionality.
 */

export * from './FileExplorer';
export * from './fileExplorerClasses';

/**
 * Type definitions related to File Explorer component.
 * @typedef {object} FileExplorerProps - Props for the File Explorer component.
 * @typedef {object} FileExplorerPropsBase - Base props for the File Explorer component.
 * @typedef {object} FileExplorerSlots - Slots for the File Explorer component.
 * @typedef {object} FileExplorerSlotProps - Props for the slots in the File Explorer component.
 */
export type {
  FileExplorerProps,
  FileExplorerPropsBase,
  FileExplorerSlots,
  FileExplorerSlotProps,
} from './FileExplorer.types';

/**
 * Exported constants related to File Explorer plugins.
 */
export { FILE_EXPLORER_PLUGINS } from './FileExplorer.plugins';

/**
 * Type definitions related to File Explorer plugins.
 * @typedef {object} FileExplorerPluginSlots - Slots for the File Explorer plugins.
 * @typedef {object} FileExplorerPluginSlotProps - Props for the slots in the File Explorer plugins.
 * @typedef {object} FileExplorerPluginParameters - Parameters for the File Explorer plugins.
 */
export type {
  FileExplorerPluginSlots,
  FileExplorerPluginSlotProps,
  FileExplorerPluginParameters,
} from './FileExplorer.plugins';