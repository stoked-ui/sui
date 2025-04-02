import { FileExplorerCorePluginParameters } from '../internals/corePlugins';
import {
  useFileExplorerFiles,
  UseFileExplorerFilesParameters,
} from '../internals/plugins/useFileExplorerFiles';
import {
  useFileExplorerExpansion,
  UseFileExplorerExpansionParameters,
} from '../internals/plugins/useFileExplorerExpansion';
import {
  useFileExplorerSelection,
  UseFileExplorerSelectionParameters,
} from '../internals/plugins/useFileExplorerSelection';
import {
  useFileExplorerFocus,
  UseFileExplorerFocusParameters,
} from '../internals/plugins/useFileExplorerFocus';
import {
  useFileExplorerKeyboardNavigation
} from '../internals/plugins/useFileExplorerKeyboardNavigation';
import {
  useFileExplorerIcons,
  UseFileExplorerIconsParameters,
} from '../internals/plugins/useFileExplorerIcons';
import { useFileExplorerJSXItems } from '../internals/plugins/useFileExplorerJSXItems';
import { ConvertPluginsIntoSignatures, MergeSignaturesProperty } from '../internals/models';
import { useFileExplorerDnd } from '../internals/plugins/useFileExplorerDnd/useFileExplorerDnd';
import {
  UseFileExplorerDndParameters
} from '../internals/plugins/useFileExplorerDnd/useFileExplorerDnd.types';
import { useFileExplorerGrid, UseFileExplorerGridParameters } from "../internals/plugins/useFileExplorerGrid";

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

export type FileExplorerBasicPluginSignatures = ConvertPluginsIntoSignatures<
  typeof SIMPLE_FILE_EXPLORER_VIEW_PLUGINS
>;

export type FileExplorerBasicPluginSlots = MergeSignaturesProperty<
  FileExplorerBasicPluginSignatures,
  'slots'
>;

export type FileExplorerBasicPluginSlotProps = MergeSignaturesProperty<
  FileExplorerBasicPluginSignatures,
  'slotProps'
>;

// We can't infer this type from the plugin, otherwise we would lose the generics.
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

