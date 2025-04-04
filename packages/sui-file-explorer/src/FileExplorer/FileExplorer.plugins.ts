import { FileExplorerCorePluginParameters } from '../internals/corePlugins';
/**
 * Import various hooks for file explorer plugins.
 */

import {
  useFileExplorerFiles,
  UseFileExplorerFilesParameters,
} from '../internals/plugins/useFileExplorerFiles';
/**
 * Hook for interacting with files in the file explorer.
 * @param parameters - Configuration options for the hook.
 */
import {
  useFileExplorerExpansion,
  UseFileExplorerExpansionParameters,
} from '../internals/plugins/useFileExplorerExpansion';
/**
 * Hook for expanding and collapsing file explorer items.
 * @param parameters - Configuration options for the hook.
 */

import {
  useFileExplorerSelection,
  UseFileExplorerSelectionParameters,
} from '../internals/plugins/useFileExplorerSelection';
/**
 * Hook for selecting files in the file explorer.
 * @param parameters - Configuration options for the hook.
 */
import {
  useFileExplorerFocus,
  UseFileExplorerFocusParameters,
} from '../internals/plugins/useFileExplorerFocus';
/**
 * Hook for focusing on a specific item in the file explorer.
 * @param parameters - Configuration options for the hook.
 */

import {
  useFileExplorerKeyboardNavigation
} from '../internals/plugins/useFileExplorerKeyboardNavigation';
/**
 * Hook for navigating the file explorer using keyboard shortcuts.
 */
import {
  useFileExplorerIcons,
  UseFileExplorerIconsParameters,
} from '../internals/plugins/useFileExplorerIcons';
/**
 * Hook for rendering icons in the file explorer.
 * @param parameters - Configuration options for the hook.
 */

import { ConvertPluginsIntoSignatures, MergeSignaturesProperty } from '../internals/models';
import {
  useFileExplorerGrid,
  UseFileExplorerGridParameters
} from "../internals/plugins/useFileExplorerGrid";
/**
 * Hook for rendering a grid of files in the file explorer.
 * @param parameters - Configuration options for the hook.
 */

import {
  useFileExplorerDnd,
  UseFileExplorerDndParameters
} from '../internals/plugins/useFileExplorerDnd';

/**
 * Array of file explorer plugins.
 */
export const FILE_EXPLORER_PLUGINS = [
  /**
   * Plugin for interacting with files in the file explorer.
   */
  useFileExplorerFiles,
  /**
   * Plugin for expanding and collapsing file explorer items.
   */
  useFileExplorerExpansion,
  /**
   * Plugin for selecting files in the file explorer.
   */
  useFileExplorerSelection,
  /**
   * Plugin for focusing on a specific item in the file explorer.
   */
  useFileExplorerFocus,
  /**
   * Plugin for navigating the file explorer using keyboard shortcuts.
   */
  useFileExplorerKeyboardNavigation,
  /**
   * Plugin for rendering icons in the file explorer.
   */
  useFileExplorerIcons,
  /**
   * Plugin for rendering a grid of files in the file explorer.
   */
  useFileExplorerGrid,
  /**
   * Plugin for handling drag-and-drop operations in the file explorer.
   */
  useFileExplorerDnd,

] as const;

/**
 * Type alias for the signatures of all plugins in the file explorer.
 */
export type FileExplorerPluginSignatures = ConvertPluginsIntoSignatures<
  typeof FILE_EXPLORER_PLUGINS
>;

/**
 * Type alias for the slots property in a plugin's signature.
 */
export type FileExplorerPluginSlots = MergeSignaturesProperty<
  FileExplorerPluginSignatures,
  'slots'
>;

/**
 * Type alias for the slot props property in a plugin's signature.
 */
export type FileExplorerPluginSlotProps = MergeSignaturesProperty<
  FileExplorerPluginSignatures,
  'slotProps'
>;

/**
 * Interface for parameters of a file explorer plugin.
 * @param Multiple - Whether the plugin supports multiple selections.
 */
export interface FileExplorerPluginParameters<Multiple extends boolean | undefined>
  extends FileExplorerCorePluginParameters,
    UseFileExplorerFilesParameters,
    UseFileExplorerExpansionParameters,
    UseFileExplorerSelectionParameters<Multiple>,
    UseFileExplorerFocusParameters,
    UseFileExplorerIconsParameters,
    UseFileExplorerGridParameters,
    UseFileExplorerDndParameters {}
;