import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { SlotComponentProps } from '@mui/base/utils';
import { ITimelineAction } from '@stoked-ui/timeline'
import { IMediaFile, MediaFile } from '@stoked-ui/media-selector';
import { FileDetailClasses } from './fileDetailClasses';
import {
  SlotComponentPropsFromProps,
} from '../internals/models';

export interface FileDetailSlots {
  /**
   * Element rendered at the root.
   * @default FileExplorerRoot
   */
  root?: React.ElementType;
  /**
   * Custom component for the item.
   * @default CCV F ileExplorerItem.
   */
  mediaTypeItem?:  React.ElementType;
}

export interface FileDetailSlotProps {
  root?: SlotComponentProps<'div', {}, FileDetailSlots>;
  mediaTypeItem?: SlotComponentPropsFromProps<
    IMediaFile,
    {},
    MediaFile
  >;
}

export interface FileDetailPropsBase extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileDetailClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  action: ITimelineAction;
  anchorEl: HTMLElement;
  onClose: () => void;
}

export interface FileDetailProps
  extends FileDetailPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: FileDetailSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: FileDetailSlotProps;
  /**
   * The ref object that allows FileExplorer View manipulation. Can be instantiated with `useFileExplorerApiRef()`
   */
}
