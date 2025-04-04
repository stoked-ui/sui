import * as React from 'react';
import { SlotComponentProps } from '@mui/base/utils';
import { IMediaFile, MediaFile } from '@stoked-ui/media-selector';
import { SlotComponentPropsFromProps, } from '../internals/models';
import { IEditorTrack} from "../EditorTrack";
import { IEditorAction} from "../EditorAction";

/**
 * The possible slots for the detail view component.
 */
export interface DetailViewSlots {
  /**
   * The root element type.
   */
  root?: React.ElementType;

  /**
   * The media type item element type.
   */
  mediaTypeItem?:  React.ElementType;
}

/**
 * The props for the detail view slot component.
 */
export interface DetailViewSlotProps {
  /**
   * The root slot props.
   */
  root?: SlotComponentProps<'div', {}, DetailViewSlots>;

  /**
   * The media type item slot props.
   */
  mediaTypeItem?: SlotComponentPropsFromProps<IMediaFile, {}, MediaFile>;
}

/**
 * The props for the detail view component.
 */
export interface DetailViewProps {
  /**
   * The slots for the detail view.
   */
  slots?: DetailViewSlots;

  /**
   * The slot props for the detail view.
   */
  slotProps?: DetailViewSlotProps;
}