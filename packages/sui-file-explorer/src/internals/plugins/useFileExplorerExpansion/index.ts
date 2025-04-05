/**
 * Exported functions and types related to file explorer expansion functionality.
 */

export { useFileExplorerExpansion } from './useFileExplorerExpansion';

/**
 * Type definitions for file explorer expansion functionality.
 * @typedef {Object} UseFileExplorerExpansionSignature - Signature for the useFileExplorerExpansion hook
 * @property {Function} expandNode - Function to expand a file explorer node
 * @property {Function} collapseNode - Function to collapse a file explorer node
 * @property {Function} toggleNode - Function to toggle the expanded/collapsed state of a node
 * @property {Function} isNodeExpanded - Function to check if a node is expanded
 * @property {Function} isNodeCollapsed - Function to check if a node is collapsed
 * @typedef {Object} UseFileExplorerExpansionParameters - Parameters for the useFileExplorerExpansion hook
 * @property {boolean} defaultExpanded - Default expanded state for nodes
 * @property {boolean} defaultCollapsed - Default collapsed state for nodes
 * @typedef {Object} UseFileExplorerExpansionDefaultizedParameters - Defaultized parameters for the useFileExplorerExpansion hook
 * @property {boolean} expanded - Expanded state for nodes
 * @property {boolean} collapsed - Collapsed state for nodes
 */

export type {
  UseFileExplorerExpansionSignature,
  UseFileExplorerExpansionParameters,
  UseFileExplorerExpansionDefaultizedParameters,
} from './useFileExplorerExpansion.types';