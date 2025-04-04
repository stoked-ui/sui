import { 
  FileExplorerBasicPluginSignatures, 
  FileExplorerBasicPluginSlots, 
  FileExplorerBasicPluginSlotProps, 
  FileExplorerCorePluginParameters
} from './internals/models';
import {
  ConvertPluginsIntoSignatures, 
  MergeSignaturesProperty
} from './internals/models';

/**
 * @enum {Array<Function>}
 * @description An array of plugins to be used in the file explorer view.
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
 * @typedef {Object} FileExplorerBasicPluginSignatures
 * @property {Array<Function>} plugins - An array of plugins to be used in the file explorer view.
 */
export type FileExplorerBasicPluginSignatures = ConvertPluginsIntoSignatures<
  typeof SIMPLE_FILE_EXPLORER_VIEW_PLUGINS
>;

/**
 * @typedef {Object} FileExplorerBasicPluginSlots
 * @property {Object} [slots] - An object containing slots for the file explorer view.
 */
export type FileExplorerBasicPluginSlots = MergeSignaturesProperty<
  FileExplorerBasicPluginSignatures,
  'slots'
>;

/**
 * @typedef {Object} FileExplorerBasicPluginSlotProps
 * @property {Object} [slotProps] - An object containing slot props for the file explorer view.
 */
export type FileExplorerBasicPluginSlotProps = MergeSignaturesProperty<
  FileExplorerBasicPluginSignatures,
  'slotProps'
>;

/**
 * @typedef {Object} FileExplorerBasicPluginParameters
 * @param {boolean | undefined} [multiple] - A boolean indicating whether to display multiple items in the file explorer view.
 * @extends FileExplorerCorePluginParameters
 * @extends UseFileExplorerFilesParameters
 * @extends UseFileExplorerExpansionParameters
 * @extends UseFileExplorerFocusParameters
 * @extends UseFileExplorerSelectionParameters<Multiple>
 * @extends UseFileExplorerIconsParameters
 * @extends UseFileExplorerDndParameters
 * @extends UseFileExplorerGridParameters
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