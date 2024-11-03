import * as React from 'react';
import { SlotComponentProps } from '@mui/base/utils';
import { IMediaFile, MediaFile } from '@stoked-ui/media-selector';
import {
  SlotComponentPropsFromProps,
} from '../internals/models';
import { getVideoSchema } from "./DetailVideoView.types";
import { getMediaFileSchema, getTrackSchema, getActionSchema} from "./DetailTrackView.types";

export interface DetailViewSlots {
  root?: React.ElementType;

  mediaTypeItem?:  React.ElementType;
}

export interface DetailViewSlotProps {
  root?: SlotComponentProps<'div', {}, DetailViewSlots>;

  mediaTypeItem?: SlotComponentPropsFromProps<IMediaFile, {}, MediaFile>;
}

export interface DetailViewProps {
  slots?: DetailViewSlots;

  slotProps?: DetailViewSlotProps;
}

export const getFormSchema = () => {
  return {
    video: getVideoSchema(),
    file: getMediaFileSchema(),
    track: getTrackSchema(),
    action: getActionSchema()
  }
};
