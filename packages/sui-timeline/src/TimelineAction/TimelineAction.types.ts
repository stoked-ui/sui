import * as React from 'react';
import {SxProps, Theme} from "@mui/material/styles";
import {SlotComponentProps} from "@mui/material";
import {CSSProperties} from "@mui/system/CSSProperties";
import {MediaFile} from "@stoked-ui/media-selector";
import {TimelineActionClasses} from "./timelineActionClasses";
import {DragLineData} from "../TimelineTrackArea/TimelineTrackAreaDragLines";
import {CommonProps} from '../interface/common_prop';
import {type ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";
import { IController } from '../Engine/Controller.types';

export type GetBackgroundImage = (action: ITimelineAction) => Promise<string>;

export interface TimelineActionState {
  /** Whether the action is selected */
  selected?: boolean;
  /** Whether the action is scalable */
  flexible?: boolean;
  /** Whether the action is movable */
  movable?: boolean;
  /** Whether the action is prohibited from running */
  disable?: boolean;
  /** Whether the action is hidden from timeline */
  hidden?: boolean;
  /** Whether the action is locked on the timeline */
  locked?: boolean;
}

export interface ITimelineActionInput extends TimelineActionState {
  /** action id */
  id?: string;
  /** action display name */
  name: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;
  /** The controllerName corresponding to the action */
  controllerName: string;

  layer?: string;

  src: string;

  style?: CSSProperties;
}

/**
 *Basic parameters of the action
 * @export
 * @interface ITimelineAction
 */
export interface ITimelineAction extends Omit<ITimelineActionInput, 'id' | 'start' | 'end' | 'data'>, TimelineActionState {
  /** action id */
  id: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;

  file?: MediaFile;

  /** z index */
  z: number;

  /** Minimum start time limit for actions */
  minStart?: number;
  /** Maximum end time limit of action */
  maxEnd?: number;

  onKeyDown?: (event: any, id: string) => void;

  duration?: number;

  src: string;

  style?: CSSProperties;

  getBackgroundImage?: (actionType: IController, src: string) => string;

  staticZ: boolean;

  name: string;

  fullName: string;

  element?: any;

  controller: IController;

  frameSyncId?: number;
}

export type ITimelineActionLayer = 'background' | 'foreground';

export interface TimelineActionSlots {
  /**
   * Element rendered at the root.
   * @default TimelineActionRoot
   */
  root?: React.ElementType;

  left?: React.ElementType;

  right?: React.ElementType;
}

export interface TimelineActionSlotProps {
  root?: SlotComponentProps<'div', {}, {}>;
  left?: SlotComponentProps<'div', {}, {}>;
  right?: SlotComponentProps<'div', {}, {}>;
}

export interface TimelineActionProps
  extends TimelineActionState,
    CommonProps,
    Omit<React.HTMLAttributes<HTMLUListElement>, 'id' | 'onScroll'> {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Overridable component slots.
   */
  slots?: TimelineActionSlots;
  /**
   * The props used for each component slot.
   */
  slotProps?: TimelineActionSlotProps;
  className?: string;

  classes?: Partial<TimelineActionClasses>;
  /**
   * Override or extend the styles applied to the component.
   */
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  track: ITimelineTrack;
  action: ITimelineAction;
  dragLineData: DragLineData;
  handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
  areaRef: React.MutableRefObject<HTMLDivElement>;
  /* setUp scroll left */
  deltaScrollLeft?: (delta: number) => void;
  getActionRender?: (action: ITimelineAction, track: ITimelineTrack) => React.ReactNode;
}

export interface TimelineActionOwnerState extends Omit<TimelineActionProps, 'action' | 'onKeyDown' | 'style'>, ITimelineAction  {}
