import * as React from 'react';
import { SlotComponentProps } from '@mui/base/utils';

/**
 * Interface for the parameters used in the useFileExplorerIcons hook.
 */
export interface UseFileExplorerIconsParameters {}

/**
 * Type alias for the defaultized parameters of the useFileExplorerIcons hook.
 */
export type UseFileExplorerIconsDefaultizedParameters = UseFileExplorerIconsParameters;

/**
 * Interface for the slots used in the useFileExplorerIcons hook.
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
 * Interface for the props used in the useFileExplorerIcons hook's slots.
 */
interface UseFileExplorerIconsSlotProps {
  /**
   * The collapse icon prop.
   */
  collapseIcon?: SlotComponentProps<'svg', {}, {}>;
  /**
   * The expand icon prop.
   */
  expandIcon?: SlotComponentProps<'svg', {}, {}>;
  /**
   * The end icon prop.
   */
  endIcon?: SlotComponentProps<'svg', {}, {}>;
}

/**
 * Interface for the context value used in the useFileExplorerIcons hook.
 */
interface UseFileExplorerIconsContextValue {
  /**
   * An object containing the slots and slot props.
   */
  icons: {
    /**
     * The slots used in the hook.
     */
    slots: UseFileExplorerIconsSlots;
    /**
     * The slot props used in the hook.
     */
    slotProps: UseFileExplorerIconsSlotProps;
  };
}

/**
 * Type alias for the signature of the useFileExplorerIcons hook.
 */
export type UseFileExplorerIconsSignature = FileExplorerPluginSignature<{
  /**
   * The parameters used in the hook.
   */
  params: UseFileExplorerIconsParameters;
  /**
   * The defaultized parameters used in the hook.
   */
  defaultizedParams: UseFileExplorerIconsDefaultizedParameters;
  /**
   * The context value used in the hook.
   */
  contextValue: UseFileExplorerIconsContextValue;
  /**
   * The slots used in the hook.
   */
  slots: UseFileExplorerIconsSlots;
  /**
   * The slot props used in the hook.
   */
  slotProps: UseFileExplorerIconsSlotProps;
  /**
   * An array of dependencies used in the hook.
   */
  dependencies: [UseFileExplorerFilesSignature, UseFileExplorerSelectionSignature, UseFileExplorerDndSignature];
}>;