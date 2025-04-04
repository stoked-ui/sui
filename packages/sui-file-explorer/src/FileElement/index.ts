/**
 * Exports necessary components and types for the file element functionality.
 */

export { FileElement } from './FileElement';
export type {
  /**
   * Props used to customize the appearance of the FileElement component.
   */
  FileElementProps,
  
  /**
   * Slots available for use within the FileElement component.
   */
  FileElementSlots,
  
  /**
   * Props used to customize the behavior of a specific slot within the FileElement component.
   */
  FileElementSlotProps
} from './FileElement.types';
export * from './fileElementClasses';
export * from './useFileElementState';
export { FileElementContent } from './FileElementContent';
export type {
  /**
   * Props used to customize the appearance of the FileElementContent component.
   */
  FileElementContentProps,
  
  /**
   * Unique keys for classes within the FileElementContent component.
   */
  FileElementContentClassKey
} from './FileElementContent';