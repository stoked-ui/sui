import * as React from 'react';
import { SlotComponentProps } from '@mui/base/utils';
import { IMediaFile2, MediaFile2 } from '@stoked-ui/media-selector';
import { SlotComponentPropsFromProps, } from '../internals/models';
import {IEditorTrack} from "../EditorTrack";
import {IEditorAction} from "../EditorAction";

export interface DetailViewSlots {
  root?: React.ElementType;

  mediaTypeItem?:  React.ElementType;
}

export interface DetailViewSlotProps {
  root?: SlotComponentProps<'div', {}, DetailViewSlots>;

  mediaTypeItem?: SlotComponentPropsFromProps<IMediaFile2, {}, MediaFile2>;
}

export interface DetailViewProps {
  slots?: DetailViewSlots;
  slotProps?: DetailViewSlotProps;
}
