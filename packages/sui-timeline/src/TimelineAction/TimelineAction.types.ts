import * as React from 'react';
import { SxProps, Theme } from "@mui/material/styles";
import { SlotComponentProps } from "@mui/material";
import { CSSProperties } from "@mui/system/CSSProperties";
import { TimelineActionClasses } from "./timelineActionClasses";
import { TimelineTrack } from "../interface/TimelineAction";
import { DragLineData } from "../components/edit_area/drag_lines";
import { CommonProps } from '../interface/common_prop';
import {ITimelineEngine} from "../TimelineEngine/TimelineEngine";

export type TimelineActionParams = {
  action: ITimelineAction;
  time: number;
  engine: ITimelineEngine;
};

export interface ITimelineActionType {
  start?: (params: TimelineActionParams) => void;
  stop?: (params: TimelineActionParams) => void;
  enter: (params: TimelineActionParams) => void;
  leave: (params: TimelineActionParams) => void;
  update?: (params: TimelineActionParams) => void;
  viewerUpdate?: (engine: any) => void;
  destroy?: () => void;
  color?: string;
}

export interface TimelineActionState {
  /** Whether the action is selected */
  selected?: boolean;
  /** Whether the action is scalable */
  flexible?: boolean;
  /** Whether the action is movable */
  movable?: boolean;
  /** Whether the action is prohibited from running */
  disable?: boolean;
}

/**
 *Basic parameters of the action
 * @export
 * @interface ITimelineAction
 */
export interface ITimelineAction extends TimelineActionState {
  /** action id */
  id: string;
  /** action display name */
  name?: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;
  /** The effectId corresponding to the action */
  effectId: string;

  /** Minimum start time limit for actions */
  minStart?: number;
  /** Maximum end time limit of action */
  maxEnd?: number;

  onKeyDown?: (event: any, id: string) => void;

  data?: {
    src: string;
    style?: CSSProperties;
  };
}

export interface ITimelineActionInput extends Omit<ITimelineAction, 'id'>  {
  id?: string;
}

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
    Omit<React.HTMLAttributes<HTMLUListElement>, 'id'> {
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

  track: TimelineTrack;
  action: ITimelineAction;
  dragLineData: DragLineData;
  setEditorData: (tracks: TimelineTrack[]) => void;
  handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
  areaRef: React.MutableRefObject<HTMLDivElement>;
  /* setUp scroll left */
  deltaScrollLeft?: (delta: number) => void;
}

export interface TimelineActionOwnerState extends Omit<TimelineActionProps, 'action' | 'onKeyDown'>, ITimelineAction  {}
