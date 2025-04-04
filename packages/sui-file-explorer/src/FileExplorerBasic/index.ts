/**
 * Exports all files and types related to the basic File Explorer.
 */
export * from './FileExplorerBasic';

/**
 * Exports all files and types related to the file explorer with classes.
 */
export * from './fileExplorerBasicClasses';

/**
 * Exports the necessary types for the File Explorer component.
 *
 * @property {object} FileExplorerBasicProps - The props type for the FileExplorerBasic component.
 * @property {object} FileExplorerBasicSlots - The slots type for the FileExplorerBasic component.
 * @property {object} FileExplorerBasicSlotProps - The slot props type for the FileExplorerBasic component.
 */
export type {
  FileExplorerBasicProps,
  FileExplorerBasicSlots,
  FileExplorerBasicSlotProps,
} from './FileExplorerBasic.types';