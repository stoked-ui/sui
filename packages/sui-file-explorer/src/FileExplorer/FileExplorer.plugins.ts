/**
 * Represents the file explorer plugins used in the file explorer component.
 */
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

/**
 * Type representing the signatures of file explorer plugins.
 * @typedef {ConvertPluginsIntoSignatures<typeof FILE_EXPLORER_PLUGINS>} FileExplorerPluginSignatures
 */

/**
 * Type representing the slots of file explorer plugins.
 * @typedef {MergeSignaturesProperty<FileExplorerPluginSignatures, 'slots'>} FileExplorerPluginSlots
 */

/**
 * Type representing the slot props of file explorer plugins.
 * @typedef {MergeSignaturesProperty<FileExplorerPluginSignatures, 'slotProps'>} FileExplorerPluginSlotProps
 */

/**
 * Interface defining the parameters for file explorer plugins.
 * @interface FileExplorerPluginParameters
 * @extends {FileExplorerCorePluginParameters}
 * @extends {UseFileExplorerFilesParameters}
 * @extends {UseFileExplorerExpansionParameters}
 * @extends {UseFileExplorerSelectionParameters<Multiple>}
 * @extends {UseFileExplorerFocusParameters}
 * @extends {UseFileExplorerIconsParameters}
 * @extends {UseFileExplorerGridParameters}
 * @extends {UseFileExplorerDndParameters}
 * @template Multiple - Represents whether multiple selections are allowed.
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