/**
 * Exports the File component.
 */
export {
  File,
} from './File';

/**
 * Type definitions for the File component.
 * 
 * @see {./File.types}
 */
export type { FileProps, FileSlots, FileSlotProps } from './File.types';

/**
 * Re-exports components and hooks from the fileClasses module.
 */
export * from './fileClasses';

/**
 * Re-exports components and hooks from the useFileState module.
 */
export * from './useFileState';

/**
 * Re-exports the FileLabel component.
 */
export * from './FileLabel';

/**
 * Exports the FileIconContainer component.
 * 
 * @see {./FileIconContainer}
 */
export { FileIconContainer } from './FileIconContainer';

/**
 * Exports additional components and utilities for file-related functionality.
 * 
 * @see {./FileExtras}
 */
export {
  FileRoot,
  FileGroupTransition,
  FileCheckbox,
  FileContent,
  TransitionComponent,
} from './FileExtras';