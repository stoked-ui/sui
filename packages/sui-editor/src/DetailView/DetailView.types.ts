import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { SlotComponentProps } from '@mui/base/utils';
import {IEngine, ITimelineAction, ITimelineFile, ITimelineTrack } from '@stoked-ui/timeline'
import { IMediaFile, MediaFile } from '@stoked-ui/media-selector';
import { DetailViewClasses } from './detailViewClasses';
import {
  SlotComponentPropsFromProps,
} from '../internals/models';
import { getVideoSchema } from "./DetailVideoView.types";
import { getActionSchema } from "./DetailActionView.types";
import { getMediaFileSchema, getTrackSchema} from "./DetailTrackView.types";

export interface DetailViewSlots {
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

export interface DetailViewSlotProps {
  root?: SlotComponentProps<'div', {}, DetailViewSlots>;
  mediaTypeItem?: SlotComponentPropsFromProps<
    IMediaFile,
    {},
    MediaFile
  >;
}

export type DetailViewSelected = ITimelineTrack | ITimelineAction | ITimelineFile;

export interface DetailViewPropsBase extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<DetailViewClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  anchorEl?: HTMLElement;

  onClose: (event: {} |  React.MouseEvent<HTMLElement, MouseEvent>, reason: ("backdropClick" | "escapeKeyDown")) => void;
}

export interface DetailViewProps
  extends DetailViewPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: DetailViewSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: DetailViewSlotProps;
  /**
   * The ref object that allows FileExplorer View manipulation. Can be instantiated with
   * `useFileExplorerApiRef()`
   */
}

export const getFormSchema = () => {
  return {
    video: getVideoSchema(),
    file: getMediaFileSchema(),
    track: getTrackSchema(),
    action: getActionSchema()
  }
};
