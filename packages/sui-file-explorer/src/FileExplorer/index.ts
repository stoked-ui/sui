/**
 * Exports all modules from the file explorer package
 */
export * from './FileExplorer';

/**
 * Exports all modules from the file explorer classes package
 */
export * from './fileExplorerClasses';

/**
 * Type definitions for the File Explorer component
 *
 * @interface FileExplorerProps
 * @property {object} props - Properties of the File Explorer component
 * @property {object} slots - Slots of the File Explorer component
 * @description Defines the properties and slots of the File Explorer component
 */
export type {
  /**
   * Base properties for the File Explorer component
   *
   * @interface FileExplorerPropsBase
   * @property {string} baseClass - The base class of the File Explorer component
   */
  FileExplorerPropsBase,

  /**
   * Slots for the File Explorer component
   *
   * @interface FileExplorerSlots
   * @property {object} slots - Slots of the File Explorer component
   */
  FileExplorerSlots,

  /**
   * Props for a specific slot in the File Explorer component
   *
   * @interface FileExplorerSlotProps
   * @property {string} slot - The name of the slot
   * @property {object} props - Properties of the slot
   */
  FileExplorerSlotProps,
};

/**
 * Plugin configuration for the File Explorer package
 *
 * @enum {string}
 * @member FILE_EXPLORER_PLUGINS - Configuration for plugins
 */
export enum FILE_EXPLORER_PLUGINS;

/**
 * Type definitions for File Explorer plugin types
 *
 * @interface FileExplorerPluginParameters
 * @property {object} params - Parameters of the file explorer plugin
 */

export type {
  /**
   * Slots for a file explorer plugin
   *
   * @interface FileExplorerPluginSlots
   */
  FileExplorerPluginSlots,

  /**
   * Props for a specific slot in a file explorer plugin
   *
   * @interface FileExplorerPluginSlotProps
   * @property {string} slot - The name of the slot
   * @property {object} props - Properties of the slot
   */
  FileExplorerPluginSlotProps,
};