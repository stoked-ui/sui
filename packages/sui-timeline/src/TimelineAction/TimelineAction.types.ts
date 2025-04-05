import * as React from 'react';
import {SxProps, Theme} from "@mui/material/styles";
import {SlotComponentProps} from "@mui/base";
import {CSSProperties} from "@mui/system/CSSProperties";
import { namedId} from '@stoked-ui/common';
import {TimelineActionClasses} from "./timelineActionClasses";
import {DragLineData} from "../TimelineTrackArea/TimelineTrackAreaDragLines";
import {type ITimelineTrack } from "../TimelineTrack/TimelineTrack.types";
import Controller from "../Controller/Controller";

/**
 * Represents the state of a timeline action.
 * @typedef {object} TimelineActionState
 * @property {boolean} [selected] - Whether the action is selected.
 * @property {boolean} [flexible] - Whether the action is scalable.
 * @property {boolean} [movable] - Whether the action is movable.
 * @property {boolean} [disabled] - Whether the action is prohibited from running.
 * @property {boolean} [muted] - Whether the action is hidden from the timeline.
 * @property {boolean} [locked] - Whether the action is locked on the timeline.
 */
export interface TimelineActionState {
  selected?: boolean;
  flexible?: boolean;
  movable?: boolean;
  disabled?: boolean;
  muted?: boolean;
  locked?: boolean;
}

/**
 * Represents a timeline action with additional file-related properties.
 * @typedef {object} ITimelineFileAction
 * @property {string} [id] - Action id.
 * @property {string} [name] - Action display name.
 * @property {number} [start] - Action start time.
 * @property {number} [end] - Action end time.
 * @property {number} [trimStart] - Trim start time.
 * @property {number} [trimEnd] - Trim end time.
 * @property {number} [playbackRate] - Playback rate.
 * @property {number} [freeze] - Freeze time.
 * @property {boolean | number} [loop] - Loop flag or loop count.
 * @property {[ volume: number, start?: number, end?: number] []} [volume] - Volume settings.
 * @property {string} [url] - Action URL.
 * @property {CSSProperties} [style] - Custom CSS styles.
 */
export interface ITimelineFileAction extends TimelineActionState {
  id?: string;
  name?: string;
  start?: number;
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
 * Represents a basic timeline action.
 * @typedef {object} ITimelineAction
 * @property {string} id - Action id.
 * @property {string} name - Action display name.
 * @property {number} start - Action start time.
 * @property {number} end - Action end time.
 * @property {(event: any, id: string) => void} [onKeyDown] - Key down event handler.
 * @property {number} [duration] - Action duration.
 * @property {CSSProperties} [style] - Custom CSS styles.
 * @property {BackgroundImageStyle | object} [backgroundImageStyle] - Background image style.
 * @property {string} [backgroundImage] - Background image URL.
 * @property {number} [frameSyncId] - Frame sync ID.
 * @property {number} [minStart] - Minimum start time limit for actions.
 * @property {number} [maxEnd] - Maximum end time limit of action.
 * @property {number} [playCount] - Play count.
 * @property {number} [volumeIndex] - Volume index.
 * @property {boolean} [disabled] - Whether the action is disabled.
 * @property {boolean} [dim] - Whether the action is dimmed.
 */
export interface ITimelineAction extends Omit<ITimelineFileAction, 'id' | 'start' | 'end' | 'name' | 'url' | 'style'> {
  id: string;
  name: string;
  start: number;
  end: number;
  onKeyDown?: (event: any, id: string) => void;
  duration?: number;
  style?: CSSProperties;
  backgroundImageStyle?: BackgroundImageStyle | object;
  backgroundImage?: string;
  frameSyncId?: number;
  minStart?: number;
  maxEnd?: number;
  playCount?: number;
  volumeIndex?: number;
  disabled?: boolean;
  dim?: boolean;
}

/**
 * Sets the volume index of the action based on volume settings.
 * @param {ITimelineFileAction} action - The timeline action.
 * @returns {number} - The volume index.
 */
function setVolumeIndex(action: ITimelineFileAction): number {
  if (!action.volume) {
    return -2; // -2: no volume parts available => volume 1
  }

  for (let i = 0; i < action.volume!.length; i += 1) {
    const { volume } = Controller.getVol(action.volume![i]);

    if (volume < 0 || volume > 1) {
      console.info(`${action.name} - specifies a volume of ${volume} which is outside the standard range: 0.0 - 1.0`);
    }
  }
  return -1;
}

/**
 * Initializes a timeline action with default values.
 * @param {ITimelineFileAction} fileAction - The timeline action from file.
 * @param {number} trackIndex - The index of the track.
 * @returns {ITimelineAction} - The initialized timeline action.
 */
export const initTimelineAction = (fileAction: ITimelineFileAction, trackIndex: number): ITimelineAction => {
  const newAction = fileAction as ITimelineAction;
  newAction.volumeIndex = setVolumeIndex(newAction);

  if (!newAction.id) {
    newAction.id = namedId('action');
  }

  return newAction;
}

/**
 * Gets the timespan of an action in a file.
 * @param {ITimelineAction} action - The timeline action.
 * @returns {{ start: number, end: number }} - The timespan object.
 */
export function getActionFileTimespan(action: ITimelineAction): { start: number, end: number } {
  return {
    start: action.trimStart || 0,
    end: (action.trimStart || 0) + (action.end - action.start) - (action?.trimEnd || 0),
  }
}

/**
 * Creates a new timeline action with the specified properties.
 * @param {Partial<ActionType>} props - The partial properties of the action.
 * @returns {ActionType} - The created timeline action.
 */
export function createAction<ActionType extends ITimelineAction = ITimelineAction>(props: Partial<ActionType>): ActionType {
  return {
    ...props,
  } as ActionType;
}

/**
 * Represents the slots for a timeline action component.
 * @typedef {object} TimelineActionSlots
 * @property {React.ElementType} [root=TimelineActionRoot] - Element rendered at the root.
 * @property {React.ElementType} [left] - Left element.
 * @property {React.ElementType} [right] - Right element.
 */
export interface TimelineActionSlots {
  root?: React.ElementType;
  left?: React.ElementType;
  right?: React.ElementType;
}

/**
 * Represents the slot props for a timeline action component.
 * @typedef {object} TimelineActionSlotProps
 * @property {SlotComponentProps<'div', {}, {}>} [root] - Props for the root slot.
 * @property {SlotComponentProps<'div', {}, {}>} [left] - Props for the left slot.
 * @property {SlotComponentProps<'div', {}, {}>} [right] - Props for the right slot.
 */
export interface TimelineActionSlotProps {
  root?: SlotComponentProps<'div', {}, {}>;
  left?: SlotComponentProps<'div', {}, {}>;
  right?: SlotComponentProps<'div', {}, {}>;
}

/**
 * Represents the event handlers for a timeline action component.
 * @typedef {object} ITimelineActionHandlers
 */
export interface ITimelineActionHandlers<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  onActionMoveStart?: (params: { action: ActionType; track: TrackType }) => void;
  onActionMoving?: (params: { action: ActionType; track: TrackType; start: number; end: number }) => void | boolean;
  onActionMoveEnd?: (params: { action: ActionType; track: TrackType; start: number; end: number }) => void;
  onActionResizeStart?: (params: { action: ActionType; track: TrackType; dir: 'right' | 'left' }) => void;
  onActionResizing?: (params: { action: ActionType; track: TrackType; start: number; end: number; dir: 'right' | 'left' }) => void | boolean;
  onActionResizeEnd?: (params: { action: ActionType; track: TrackType; start: number; end: number; dir: 'right' | 'left' }) => void;
  onClickAction?: (e: React.MouseEvent<HTMLElement, MouseEvent>, param: { track: TrackType; action: ActionType; time: number }) => void;
  onClickActionOnly?: (e: React.MouseEvent<HTMLElement, MouseEvent>, param: { track: TrackType; action: ActionType; time: number }) => void;
  onDoubleClickAction?: (e: React.MouseEvent<HTMLElement, MouseEvent>, param: { track: TrackType; action: ActionType; time: number }) => void;
  onContextMenuAction?: (e: React.MouseEvent<HTMLElement, MouseEvent>, param: { track: TrackType; action: ActionType; time: number }) => void;
}

/**
 * Represents the props for a timeline action component.
 * @typedef {object} TimelineActionProps
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> extends TimelineActionState, Omit<React.HTMLAttributes<HTMLUListElement>, 'id' | 'onScroll'>, ITimelineActionHandlers<TrackType, ActionType> {
  children?: React.ReactNode;
  slots?: TimelineActionSlots;
  slotProps?: TimelineActionSlotProps;
  className?: string;
  classes?: Partial<TimelineActionClasses>;
  sx?: SxProps<Theme>;
  track: TrackType;
  action: ActionType;
  dragLineData: DragLineData;
  handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
  areaRef?: React.MutableRefObject<HTMLDivElement>;
  deltaScrollLeft?: (delta: number) => void;
}
/**
 * Represents the style for a background image.
 * @typedef {object} BackgroundImageStyle
 * @property {string} backgroundImage - Background image URL.
 * @property {string} backgroundPosition - Background image position.
 * @property {string} backgroundSize - Background image size.
 */
export interface BackgroundImageStyle {
  backgroundImage: string;
  backgroundPosition: string;
  backgroundSize: string;
}