/**
 * @module FileExplorer
 * 
 * Provides a range of utilities and APIs for building a file explorer component.
 */

export { useFileExplorer } from './useFileExplorer';
export { FileExplorerProvider } from './FileExplorerProvider';

/**
 * Utility functions for handling instance events in the file explorer.
 */
export { unstable_resetCleanupTracking } from './hooks/useInstanceEventHandler';

/**
 * Exported types and interfaces related to the file explorer plugin API.
 */
export type {
  /**
   * The signature of a file explorer plugin.
   */
  FileExplorerPlugin,
  /**
   * Signature for converting plugins into signatures.
   */
  ConvertPluginsIntoSignatures,
  /**
   * Merge function for merging plugin properties.
   */
  MergeSignaturesProperty,
  /**
   * Public API interface for the file explorer.
   */
  FileExplorerPublicAPI,
  /**
   * Experimental features for the file explorer.
   */
  FileExplorerExperimentalFeatures,
} from './models';

/**
 * Parameters and types related to core plugins.
 */
export type { FileExplorerCorePluginParameters } from './corePlugins';

/**
 * Exported utilities for managing file explorer expansions.
 */
export { useFileExplorerExpansion } from './plugins/useFileExplorerExpansion';
export type {
  /**
   * Signature for the useFileExplorerExpansion hook.
   */
  UseFileExplorerExpansionSignature,
  /**
   * Parameters for the useFileExplorerExpansion hook.
   */
  UseFileExplorerExpansionParameters,
} from './plugins/useFileExplorerExpansion';

/**
 * Exported utilities for managing file explorer selections.
 */
export { useFileExplorerSelection } from './plugins/useFileExplorerSelection';
export type {
  /**
   * Signature for the useFileExplorerSelection hook.
   */
  UseFileExplorerSelectionSignature,
  /**
   * Parameters for the useFileExplorerSelection hook.
   */
  UseFileExplorerSelectionParameters,
} from './plugins/useFileExplorerSelection';

/**
 * Exported utilities for managing file explorer focus.
 */
export { useFileExplorerFocus } from './plugins/useFileExplorerFocus';
export type {
  /**
   * Signature for the useFileExplorerFocus hook.
   */
  UseFileExplorerFocusSignature,
  /**
   * Parameters for the useFileExplorerFocus hook.
   */
  UseFileExplorerFocusParameters,
} from './plugins/useFileExplorerFocus';

/**
 * Exported utilities for managing file explorer keyboard navigation.
 */
export { useFileExplorerKeyboardNavigation } from './plugins/useFileExplorerKeyboardNavigation';
export type {
  /**
   * Signature for the useFileExplorerKeyboardNavigation hook.
   */
  UseFileExplorerKeyboardNavigationSignature,
} from './plugins/useFileExplorerKeyboardNavigation/useFileExplorerKeyboardNavigation.types';

/**
 * Exported utilities for managing file explorer icons.
 */
export { useFileExplorerIcons } from './plugins/useFileExplorerIcons';
export type {
  /**
   * Signature for the useFileExplorerIcons hook.
   */
  UseFileExplorerIconsSignature,
  /**
   * Parameters for the useFileExplorerIcons hook.
   */
  UseFileExplorerIconsParameters,
} from './plugins/useFileExplorerIcons';

/**
 * Exported utilities for managing file explorer files.
 */
export { useFileExplorerFiles } from './plugins/useFileExplorerFiles';
export type {
  /**
   * Signature for the useFileExplorerFiles hook.
   */
  UseFileExplorerFilesSignature,
  /**
   * Parameters for the useFileExplorerFiles hook.
   */
  UseFileExplorerFilesParameters,
} from './plugins/useFileExplorerFiles/useFileExplorerFiles.types';

/**
 * Exported utilities for managing file explorer JSX items.
 */
export { useFileExplorerJSXItems } from './plugins/useFileExplorerJSXItems';
export type {
  /**
   * Signature for the useFileExplorerJSXItems hook.
   */
  UseFileExplorerJSXItemsSignature,
  /**
   * Parameters for the useFileExplorerJSXItems hook.
   */
  UseFileExplorerJSXItemsParameters,
} from './plugins/useFileExplorerJSXItems';

/**
 * Exported utilities for managing file explorer grid.
 */
export { useFileExplorerGrid } from './plugins/useFileExplorerGrid';
export type {
  /**
   * Signature for the useFileExplorerGrid hook.
   */
  UseFileExplorerGridSignature,
  /**
   * Parameters for the useFileExplorerGrid hook.
   */
  UseFileExplorerGridParameters,
} from './plugins/useFileExplorerGrid';

/**
 * Exported utilities for managing file providers.
 */
export * from './FileProvider';
export * from './FileIcon';

/**
 * Build warning utility function.
 */
export { buildWarning } from './utils/warning';