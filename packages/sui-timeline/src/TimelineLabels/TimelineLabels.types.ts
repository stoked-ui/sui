import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import { IController } from '../Controller/Controller.types';
import {TimelineLabelsClasses} from './timelineLabelsClasses';
import { ITimelineTrack } from "../TimelineTrack";
import {TimelineTrackActionsProps} from "./TimelineTrackActions";

/**
 * Interface representing the possible slots for TimelineLabels component.
 */
export interface TimelineLabelsSlots {
  /**
   * Element rendered at the root.
   * @default TimelineLabelsRoot
   */
  root?: React.ElementType;
  label?: React.ElementType;
  actions?: React.ElementType;
}

/**
 * Interface representing the props for each slot in TimelineLabels component.
 */
export interface TimelineLabelsSlotProps {
  root?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  label?: SlotComponentProps<'div', {}, TimelineLabelsProps>;
  actions?: SlotComponentProps<'div', {}, TimelineTrackActionsProps>;
}

/**
 * Interface representing the base props for TimelineLabels component.
 */
export interface TimelineLabelsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Override or extend the styles applied to the component.
   */
  className?: string;
  classes?: Partial<TimelineLabelsClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  controllers: Record<string, IController>;

  onAddFiles?: () => void;

  hideLock?: boolean;

  width?: number | string;

  onClickLabel?: (event: React.MouseEvent<HTMLElement, MouseEvent>, track: ITimelineTrack) => void;
}

/**
 * Interface representing the full props for TimelineLabels component.
 */
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
  
  trackActions?: React.ElementType;
}