/**
 * Interface representing the parameters for customizing file explorer icons.
 */
export interface UseFileExplorerIconsParameters {}

/**
 * Type representing the defaultized parameters for customizing file explorer icons.
 */
export type UseFileExplorerIconsDefaultizedParameters = UseFileExplorerIconsParameters;

/**
 * Interface defining the slots available for customizing file explorer icons.
 */
interface UseFileExplorerIconsSlots {
  /**
   * The default icon used to collapse the item.
   */
  collapseIcon?: React.ElementType;
  /**
   * The default icon used to expand the item.
   */
  expandIcon?: React.ElementType;
  /**
   * The default icon displayed next to an end item.
   * This is applied to all fileExplorer items and can be overridden by the File `icon` slot prop.
   */
  endIcon?: React.ElementType;
}

/**
 * Interface defining the slot props available for customizing file explorer icons.
 */
interface UseFileExplorerIconsSlotProps {
  collapseIcon?: SlotComponentProps<'svg', {}, {}>;
  expandIcon?: SlotComponentProps<'svg', {}, {}>;
  endIcon?: SlotComponentProps<'svg', {}, {}>;
}

/**
 * Interface representing the context value for file explorer icons customization.
 */
interface UseFileExplorerIconsContextValue {
  icons: {
    slots: UseFileExplorerIconsSlots;
    slotProps: UseFileExplorerIconsSlotProps;
  };
}

/**
 * Type representing the signature for customizing file explorer icons.
 */
export type UseFileExplorerIconsSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerIconsParameters;
  defaultizedParams: UseFileExplorerIconsDefaultizedParameters;
  contextValue: UseFileExplorerIconsContextValue;
  slots: UseFileExplorerIconsSlots;
  slotProps: UseFileExplorerIconsSlotProps;
  dependencies: [UseFileExplorerFilesSignature, UseFileExplorerSelectionSignature, UseFileExplorerDndSignature];
}>;
