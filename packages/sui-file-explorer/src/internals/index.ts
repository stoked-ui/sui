/**
 * Core plugins
 */
export type { FileExplorerCorePluginParameters } from './corePlugins';

/**
 * Plugins
 */

// useFileExplorerExpansion plugin
export { useFileExplorerExpansion } from './plugins/useFileExplorerExpansion';
export type {
  UseFileExplorerExpansionSignature,
  UseFileExplorerExpansionParameters,
} from './plugins/useFileExplorerExpansion';

// useFileExplorerSelection plugin
export { useFileExplorerSelection } from './plugins/useFileExplorerSelection';
export type {
  UseFileExplorerSelectionSignature,
  UseFileExplorerSelectionParameters,
} from './plugins/useFileExplorerSelection';

// useFileExplorerFocus plugin
export { useFileExplorerFocus } from './plugins/useFileExplorerFocus';
export type {
  UseFileExplorerFocusSignature,
  UseFileExplorerFocusParameters,
} from './plugins/useFileExplorerFocus';

// useFileExplorerKeyboardNavigation plugin
export { useFileExplorerKeyboardNavigation } from './plugins/useFileExplorerKeyboardNavigation';
export type { UseFileExplorerKeyboardNavigationSignature } from './plugins/useFileExplorerKeyboardNavigation/useFileExplorerKeyboardNavigation.types';

// useFileExplorerIcons plugin
export { useFileExplorerIcons } from './plugins/useFileExplorerIcons';
export type {
  UseFileExplorerIconsSignature,
  UseFileExplorerIconsParameters,
} from './plugins/useFileExplorerIcons';

// useFileExplorerFiles plugin
export { useFileExplorerFiles } from './plugins/useFileExplorerFiles';
export type {
  UseFileExplorerFilesSignature,
  UseFileExplorerFilesParameters,
} from './plugins/useFileExplorerFiles/useFileExplorerFiles.types';

// useFileExplorerJSXItems plugin
export { useFileExplorerJSXItems } from './plugins/useFileExplorerJSXItems';
export type {
  UseFileExplorerJSXItemsSignature,
  UseFileExplorerJSXItemsParameters,
} from './plugins/useFileExplorerJSXItems';

// useFileExplorerGrid plugin
export { useFileExplorerGrid } from './plugins/useFileExplorerGrid';
export type {
  UseFileExplorerGridSignature,
  UseFileExplorerGridParameters,
} from './plugins/useFileExplorerGrid';

export * from './FileProvider';
export * from './FileIcon';

/**
 * Exported functions and types
 */
export { buildWarning } from './utils/warning';

/**
 * Exported types
 */
export type {
  FileExplorerPlugin,
  FileExplorerPluginSignature,
  ConvertPluginsIntoSignatures,
  MergeSignaturesProperty,
  FileExplorerPublicAPI,
  FileExplorerExperimentalFeatures,
} from './models';