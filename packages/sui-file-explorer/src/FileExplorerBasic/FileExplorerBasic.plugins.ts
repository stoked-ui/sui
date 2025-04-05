/**
 * Represents the parameters for a basic file explorer plugin.
 */
export interface FileExplorerBasicPluginParameters<Multiple extends boolean | undefined>
  extends FileExplorerCorePluginParameters,
    Omit<
      UseFileExplorerFilesParameters<any>,
      'items' | 'isItemDisabled' | 'getItemLabel' | 'getItemId'
    >,
    UseFileExplorerExpansionParameters,
    UseFileExplorerFocusParameters,
    UseFileExplorerSelectionParameters<Multiple>,
    UseFileExplorerIconsParameters,
    UseFileExplorerDndParameters,
    UseFileExplorerGridParameters {}

/**
 * Represents the basic plugin signatures for a file explorer.
 */
export type FileExplorerBasicPluginSignatures = ConvertPluginsIntoSignatures<
  typeof SIMPLE_FILE_EXPLORER_VIEW_PLUGINS
>;

/**
 * Represents the slots for basic file explorer plugins.
 */
export type FileExplorerBasicPluginSlots = MergeSignaturesProperty<
  FileExplorerBasicPluginSignatures,
  'slots'
>;

/**
 * Represents the slot props for basic file explorer plugins.
 */
export type FileExplorerBasicPluginSlotProps = MergeSignaturesProperty<
  FileExplorerBasicPluginSignatures,
  'slotProps'
>;

/**
 * List of simple file explorer view plugins used.
 */
export const SIMPLE_FILE_EXPLORER_VIEW_PLUGINS = [
  useFileExplorerFiles,
  useFileExplorerExpansion,
  useFileExplorerSelection,
  useFileExplorerFocus,
  useFileExplorerKeyboardNavigation,
  useFileExplorerIcons,
  useFileExplorerJSXItems,
  useFileExplorerGrid,
  useFileExplorerDnd
] as const;

/**
 * Represents the parameters for a file explorer DnD plugin.
 */
export interface UseFileExplorerDndParameters {}

/**
 * Imports the core plugin parameters for the file explorer.
 */
import { FileExplorerCorePluginParameters } from '../internals/corePlugins';

/**
 * Imports the parameters for using file explorer files.
 */
import { useFileExplorerFiles, UseFileExplorerFilesParameters } from '../internals/plugins/useFileExplorerFiles';

/**
 * Imports the parameters for using file explorer expansion.
 */
import { useFileExplorerExpansion, UseFileExplorerExpansionParameters } from '../internals/plugins/useFileExplorerExpansion';

/**
 * Imports the parameters for using file explorer selection.
 */
import { useFileExplorerSelection, UseFileExplorerSelectionParameters } from '../internals/plugins/useFileExplorerSelection';

/**
 * Imports the parameters for using file explorer focus.
 */
import { useFileExplorerFocus, UseFileExplorerFocusParameters } from '../internals/plugins/useFileExplorerFocus';

/**
 * Imports the parameters for using file explorer keyboard navigation.
 */
import { useFileExplorerKeyboardNavigation } from '../internals/plugins/useFileExplorerKeyboardNavigation';

/**
 * Imports the parameters for using file explorer icons.
 */
import { useFileExplorerIcons, UseFileExplorerIconsParameters } from '../internals/plugins/useFileExplorerIcons';

/**
 * Imports the parameters for using file explorer JSX items.
 */
import { useFileExplorerJSXItems } from '../internals/plugins/useFileExplorerJSXItems';

/**
 * Imports the parameters for using file explorer DnD.
 */
import { useFileExplorerDnd } from '../internals/plugins/useFileExplorerDnd/useFileExplorerDnd';

/**
 * Imports the parameters for using file explorer grid.
 */
import { useFileExplorerGrid, UseFileExplorerGridParameters } from "../internals/plugins/useFileExplorerGrid";

/**
 * Represents the parameters for a file explorer DnD plugin.
 */
export interface UseFileExplorerDndParameters {}