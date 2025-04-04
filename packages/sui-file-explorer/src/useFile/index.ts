/**
 * Exports the useFile hook.
 */
export { useFile } from './useFile';

/**
 * Type definitions for the useFile function.
 *
 * @see ./useFile
 */

/**
 * Interface for the parameters of the useFile function.
 * 
 * @property {object} options - Options object.
 */
export type UseFileParameters = {
  /**
   * The file system root directory.
   */
  fsRoot?: string;

  /**
   * The file system cache directory.
   */
  fsCache?: string;
};

/**
 * Interface for the return value of the useFile function.
 * 
 * @see ./useFile
 */

/**
 * Interface for the return value of the useFile function.
 * 
 * @property {object} content - File content object.
 */
export type UseFileReturnValue = {
  /**
   * The file content string.
   */
  content: string;

  /**
   * A boolean indicating whether the file is cached or not.
   */
  cached?: boolean;
};

/**
 * Interface for the own props of the content slot.
 * 
 * @see ./useFile
 */

export type UseFileContentSlotOwnProps = {
  /**
   * The content slot element.
   */
  elem: HTMLElement;
};