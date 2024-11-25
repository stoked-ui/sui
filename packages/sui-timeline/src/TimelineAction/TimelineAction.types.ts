import * as React from 'react';
import {SxProps, Theme} from "@mui/material/styles";
import {SlotComponentProps} from "@mui/material";
import {CSSProperties} from "@mui/system/CSSProperties";
import { namedId } from "@stoked-ui/media-selector";
import {TimelineActionClasses} from "./timelineActionClasses";
import {DragLineData} from "../TimelineTrackArea/TimelineTrackAreaDragLines";
import {type ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";
import Controller from "../Controller/Controller";

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


export interface ITimelineFileAction
  extends TimelineActionState {
  /** action id */
  id?: string;
  /** action display name */
  name?: string;
  /** Action start time */
  start?: number;
  /** Action end time */
  end?: number;

  trimStart?: number;

  trimEnd?: number;

  playbackRate?: number;

  freeze?: number;

  loop?: boolean | number;

  volume?: [ volume: number, start?: number, end?: number] [];

  url?: string;

  style?: CSSProperties;
}

/**
 *Basic parameters of the action
 * @export
 * @interface ITimelineAction
 */
export interface ITimelineAction
  extends Omit<ITimelineFileAction, 'id' | 'start' | 'end' | 'name' | 'url' | 'style'> {
  /** action id */
  id: string;
  /** action display name */
  name: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;

  onKeyDown?: (event: any, id: string) => void;

  duration?: number;

  style?: CSSProperties;

  backgroundImageStyle?: BackgroundImageStyle | object;

  backgroundImage?: string;

  frameSyncId?: number;
  /** Minimum start time limit for actions */
  minStart?: number;
  /** Maximum end time limit of action */
  maxEnd?: number;

  playCount?: number;

  volumeIndex?: number;

  disabled?: boolean;
}

function setVolumeIndex(action: ITimelineFileAction) {
  if (!action.volume) {
    return -2; // -2: no volume parts available => volume 1
  }
  for (let i = 0; i < action.volume!.length; i += 1) {
    const { volume } = Controller.getVol(action.volume![i]);

    if (volume < 0 || volume > 1) {
      console.info(`${action.name} [${action.url}] - specifies a volume of ${volume} which is outside the standard range: 0.0 - 1.0`)
    }
  }
  return -1; // -1: volume part unassigned => volume 1 until assigned
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const initTimelineAction = (fileAction: ITimelineFileAction, trackIndex: number) => {
  const newAction = fileAction as ITimelineAction;
  newAction.volumeIndex = setVolumeIndex(newAction)

  if (!newAction.id) {
    newAction.id = namedId('action');
  }

  return newAction;
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

export interface ITimelineActionHandlers<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * @description Start moving callback
   */
  onActionMoveStart?: (params: { action: ActionType; track: TrackType }) => void;
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving?: (params: { action: ActionType; track: TrackType; start: number; end: number }) => void | boolean;
  /**
   * @description Move end callback (return false to prevent onChange from triggering)
   */
  onActionMoveEnd?: (params: { action: ActionType; track: TrackType; start: number; end: number }) => void;
  /**
   * @description Start changing the size callback
   */
  onActionResizeStart?: (params: { action: ActionType; track: TrackType; dir: 'right' | 'left' }) => void;
  /**
   * @description Start size callback (return false to prevent changes)
   */
  onActionResizing?: (params: { action: ActionType; track: TrackType; start: number; end: number; dir: 'right' | 'left' }) => void | boolean;
  /**
   * @description size change end callback (return false to prevent onChange from triggering)
   */
  onActionResizeEnd?: (params: { action: ActionType; track: TrackType; start: number; end: number; dir: 'right' | 'left' }) => void;

  /**
   * @description Click track callback
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      action: ActionType;
      time: number;
    },
  ) => void;
  /**
   * @description Click track callback
   */
  onClickActionOnly?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      action: ActionType;
      time: number;
    },
  ) => void;
  /**
   * @description Double-click track callback
   */
  onDoubleClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      action: ActionType;
      time: number;
    },
  ) => void;
  /**
   * @description Right-click track callback
   */
  onContextMenuAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      track: TrackType;
      action: ActionType;
      time: number;
    },
  ) => void;
}

export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
>
  extends TimelineActionState,
    Omit<React.HTMLAttributes<HTMLUListElement>, 'id' | 'onScroll'>,
    ITimelineActionHandlers<TrackType, ActionType> {
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

  track: TrackType;
  action: ActionType;
  dragLineData: DragLineData;
  handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
  areaRef?: React.MutableRefObject<HTMLDivElement>;
  /* setUp scroll left */
  deltaScrollLeft?: (delta: number) => void;

}

export interface BackgroundImageStyle {
  backgroundImage: string,
  backgroundPosition: string,
  backgroundSize: string
}
