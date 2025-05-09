/** 
 * Exported functions and types related to file explorer IDs
 */

export { useFileExplorerId } from './useFileExplorerId';

/**
 * Type definitions for useFileExplorerId
 * @typedef {Object} UseFileExplorerIdSignature - Signature of the useFileExplorerId function
 * @property {Function} useFileExplorerId - Function to generate a unique file explorer ID
 * 
 * @typedef {Object} UseFileExplorerIdParameters - Parameters for the useFileExplorerId function
 * @property {string} initialId - Initial ID for the file explorer
 * 
 * @typedef {Object} UseFileExplorerIdDefaultizedParameters - Defaultized parameters for the useFileExplorerId function
 * @property {string} initialId - Initial ID for the file explorer
 */

/**
 * Type definitions for useFileExplorerId
 */

export type {
  UseFileExplorerIdSignature,
  UseFileExplorerIdParameters,
  UseFileExplorerIdDefaultizedParameters,
} from './useFileExplorerId.types';