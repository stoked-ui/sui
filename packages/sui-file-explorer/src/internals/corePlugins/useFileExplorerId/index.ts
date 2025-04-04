/**
 * Exports the useFileExplorerId hook and types.
 *
 * @module useFileExplorerId
 */

export { useFileExplorerId } from './useFileExplorerId';

/**
 * Types for the useFileExplorerId hook.
 *
 * @typedef {Object} UseFileExplorerIdSignature
 * @property {Function} [idGenerator] - A function to generate a unique ID.
 * @property {Object} [options] - Options for the file explorer ID generator.
 */
export type {
  /**
   * Signature of the useFileExplorerId hook.
   *
   * @type {UseFileExplorerIdSignature}
   */
  UseFileExplorerIdSignature,
  /**
   * Parameters for the useFileExplorerId hook.
   *
   * @typedef {Object} UseFileExplorerIdParameters
   * @property {*} [id] - The file explorer ID to generate.
   * @property {*} [options] - Options for the file explorer ID generator.
   */
  UseFileExplorerIdParameters,
  /**
   * Defaultized parameters for the useFileExplorerId hook.
   *
   * @typedef {Object} UseFileExplorerIdDefaultizedParameters
   * @property {*} [id] - The file explorer ID to generate.
   * @property {*} [options] - Options for the file explorer ID generator.
   */
  UseFileExplorerIdDefaultizedParameters,
} from './useFileExplorerId.types';