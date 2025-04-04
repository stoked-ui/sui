/**
 * Exports a custom hook for the file explorer grid.
 */
export { useFileExplorerGrid } from './useFileExplorerGrid';

/**
 *
 * @interface UseFileExplorerGridSignature
 * @description Interface representing the signature of the useFileExplorerGrid hook.
 * @property {function} [useFileExplorerGrid] - The actual function exported by this module.
 * @property {object} [parameters] - An object containing parameters used by the hook.
 */
export type {
  UseFileExplorerGridSignature,
  /**
   * Interface representing the parameters of the useFileExplorerGrid hook.
   * @see UseFileExplorerGridSignature
   */
  UseFileExplorerGridParameters,
  /**
   * Interface representing defaultized parameters for the useFileExplorerGrid hook.
   * @see UseFileExplorerGridSignature
   */
  UseFileExplorerGridDefaultizedParameters,
} from './useFileExplorerGrid.types';

/**
 * Exports components related to the file explorer grid.
 */
export * from './FileExplorerGridHeaders';
export * from './FileExplorerGridColumns';