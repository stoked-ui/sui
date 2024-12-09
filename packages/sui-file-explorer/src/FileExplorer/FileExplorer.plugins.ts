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
import { ConvertPluginsIntoSignatures, MergeSignaturesProperty } from '../internals/models';
import {
  useFileExplorerGrid,
  UseFileExplorerGridParameters
} from "../internals/plugins/useFileExplorerGrid";
import {
  useFileExplorerDnd,
  UseFileExplorerDndParameters
} from '../internals/plugins/useFileExplorerDnd';

export const FILE_EXPLORER_PLUGINS = [
  useFileExplorerFiles,
  useFileExplorerExpansion,
  useFileExplorerSelection,
  useFileExplorerFocus,
  useFileExplorerKeyboardNavigation,
  useFileExplorerIcons,
  useFileExplorerGrid,
  useFileExplorerDnd,

] as const;

export type FileExplorerPluginSignatures = ConvertPluginsIntoSignatures<
  typeof FILE_EXPLORER_PLUGINS
>;

export type FileExplorerPluginSlots = MergeSignaturesProperty<
  FileExplorerPluginSignatures,
  'slots'
>;

export type FileExplorerPluginSlotProps = MergeSignaturesProperty<
  FileExplorerPluginSignatures,
  'slotProps'
>;

// We can't infer this type from the plugin, otherwise we would lose the generics.
export interface FileExplorerPluginParameters<Multiple extends boolean | undefined>
  extends FileExplorerCorePluginParameters,
    UseFileExplorerFilesParameters,
    UseFileExplorerExpansionParameters,
    UseFileExplorerSelectionParameters<Multiple>,
    UseFileExplorerFocusParameters,
    UseFileExplorerIconsParameters,
    UseFileExplorerGridParameters,
    UseFileExplorerDndParameters {}
