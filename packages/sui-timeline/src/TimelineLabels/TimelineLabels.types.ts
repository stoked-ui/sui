import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import { IController } from '../Controller/Controller.types';
import {TimelineLabelsClasses} from './timelineLabelsClasses';
import { MediaFile } from '@stoked-ui/media-selector';
import { ITimelineTrack } from "../TimelineTrack";

export interface TimelineLabelsSlots {
  /**
   * Element rendered at the root.
   * @default TimelineLabelsRoot
   */
  root?: React.ElementType;
  label?: React.ElementType;
  template?: React.ElementType;
  container?: React.ElementType;
}

export interface TimelineLabelsSlotProps {
  root?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  label?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  template?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  container?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
}

export interface TimelineLabelsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TimelineLabelsClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  controllers: Record<string, IController>;

  onAddFiles?: () => void;

  hideLock?: boolean;

  width?: number | string;

  onLabelClick?: (track: ITimelineTrack) => void;
}

export interface TimelineLabelsProps
  extends Omit<TimelineLabelsPropsBase, 'onToggle'> {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TimelineLabelsSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TimelineLabelsSlotProps;

  onToggle?: (id: string, property: string) => void;
  setFlags?: (id: string) => string[];

}
