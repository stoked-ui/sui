import * as React from 'react';
import {SxProps, Theme} from "@mui/material/styles";
import {SlotComponentProps} from "@mui/material";
import {CSSProperties} from "@mui/system/CSSProperties";
import {MediaFile} from "@stoked-ui/media-selector";
import {FileBase, FileBaseFromMediaFile} from '@stoked-ui/file-explorer';
import {TimelineActionClasses} from "./timelineActionClasses";
import {DragLineData} from "../TimelineTrackArea/TimelineTrackAreaDragLines";
import {CommonProps} from '../interface/common_prop';
import {type ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";
import {DrawData, IController} from '../Engine/Controller.types';

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

  trimStart?: number;

  trimEnd?: number;

  layer?: string;

  src: string;

  style?: CSSProperties;

  playbackRate?: number;

  velocity?: number;

  acceleration?: number;

  freeze?: number;

  loop?: boolean | number;

  width?: number;

  height?: number;

  z?: number;

  x?: number | string;

  y?: number | string;

  fit?:
    'fill'    | // The action is resized to fill the given dimension. If necessary, the action will be stretched or squished to fit
    'cover'   | // The action keeps its aspect ratio and fills the given dimension. The action will be clipped to fit
    'contain' | // The action keeps its aspect ratio, but is resized to fit within the given dimension
    'none'      // DEFAULT - The action is not resized

  alpha?: boolean;
}

/**
 *Basic parameters of the action
 * @export
 * @interface ITimelineAction
 */
export interface ITimelineAction extends Omit<ITimelineActionInput, 'id' | 'start' | 'end' | 'data' | 'height' | 'weight' | 'x' | 'y' | 'z' | 'fit' | 'alpha'>, TimelineActionState {
  /** action id */
  id: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;

  file?: MediaFile;

  /** z index */
  z: number;

  x: number;

  y: number;

  width: number;

  height: number;

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

  timeUpdate?: (time: number) => void;

  controller: IController;

  frameSyncId?: number;

  translate?: {x?: number, y?: number};

  speed?: number;

  fit:
    'fill'    | // The action is resized to fill the given dimension. If necessary, the action will be stretched or squished to fit
    'cover'   | // The action keeps its aspect ratio and fills the given dimension. The action will be clipped to fit
    'contain' | // The action keeps its aspect ratio, but is resized to fit within the given dimension
    'none'      // DEFAULT - The action is not resized

  alpha: boolean;

  playCount?: number;

  nextFrame?: DrawData;
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

export interface TimelineActionOwnerState extends Omit<TimelineActionProps, 'action' | 'onKeyDown' | 'style' | 'translate'>, ITimelineAction  {}

export function FilesFromActions(actions: ITimelineAction[] = []): FileBase[] {
  return actions.map((action) => FileBaseFromMediaFile(action.file));
}
