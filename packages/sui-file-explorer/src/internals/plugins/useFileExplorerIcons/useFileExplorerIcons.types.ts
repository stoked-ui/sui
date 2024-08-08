import * as React from 'react';
import { SlotComponentProps } from '@mui/base/utils';
import type { FileExplorerPluginSignature } from '../../models';
import type {
  UseFileExplorerFilesSignature
} from '../useFileExplorerFiles/useFileExplorerFiles.types';
import type {
  UseFileExplorerSelectionSignature
} from '../useFileExplorerSelection/useFileExplorerSelection.types';
import type { UseFileExplorerDndSignature } from '../useFileExplorerDnd/useFileExplorerDnd.types';

export interface UseFileExplorerIconsParameters {}

export type UseFileExplorerIconsDefaultizedParameters = UseFileExplorerIconsParameters;

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

interface UseFileExplorerIconsSlotProps {
  collapseIcon?: SlotComponentProps<'svg', {}, {}>;
  expandIcon?: SlotComponentProps<'svg', {}, {}>;
  endIcon?: SlotComponentProps<'svg', {}, {}>;
}

interface UseFileExplorerIconsContextValue {
  icons: {
    slots: UseFileExplorerIconsSlots;
    slotProps: UseFileExplorerIconsSlotProps;
  };
}

export type UseFileExplorerIconsSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerIconsParameters;
  defaultizedParams: UseFileExplorerIconsDefaultizedParameters;
  contextValue: UseFileExplorerIconsContextValue;
  slots: UseFileExplorerIconsSlots;
  slotProps: UseFileExplorerIconsSlotProps;
  dependencies: [UseFileExplorerFilesSignature, UseFileExplorerSelectionSignature, UseFileExplorerDndSignature];
}>;
