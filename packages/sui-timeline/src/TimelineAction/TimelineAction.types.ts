import * as React from 'react';
import { Sx } from '@mui/system';

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionSlotProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionSlotProps {
  root?: SlotComponentProps<'div', {}, {}>;
  left?: SlotComponentProps<'div', {}, {}>;
  right?: SlotComponentProps<'div', {}, {}>;
}

/**
 * @description TimelineActionSlots Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionSlots {
  /**
   * Element rendered at the root.
   * @default TimelineActionRoot
   */
  root?: React.ElementType;

  left?: React.ElementType;

  right?: React.ElementType;
}

/**
 * @description ITimelineActionHandlers Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
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

/**
 * @description ITimelineActionInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineActionInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * Start moving callback.
   */
  onActionMoveStart?: (params: { action: ActionType; track: TrackType }) => void;

  /**
   * Move callback.
   */
  onActionMoving?: (params: { action: ActionType; track: TrackType; start: number; end: number }) => void | boolean;

  /**
   * Move end callback.
   */
  onActionMoveEnd?: (params: { action: ActionType; track: TrackType; start: number; end: number }) => void;

  /**
   * Start changing the size callback.
   */
  onActionResizeStart?: (params: { action: ActionType; track: TrackType; dir: 'right' | 'left' }) => void;

  /**
   * Start size callback.
   */
  onActionResizing?: (params: { action: ActionType; track: TrackType; start: number; end: number; dir: 'right' | 'left' }) => void | boolean;

  /**
   * Size change end callback.
   */
  onActionResizeEnd?: (params: { action: ActionType; track: TrackType; start: number; end: number; dir: 'right' | 'left' }) => void;

  /**
   * Click track callback.
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
   * Click track callback.
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
   * Double-click track callback.
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
   * Right-click track callback.
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

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
 * @description TimelineActionProps Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface TimelineActionProps<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineStateInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineStateInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The state of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineEventInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineEventInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The event of the component.
   */
  [key: string]: any;
}

/**
 * @description ITimelineTypeInterface Interface
 * 
 * @param TrackType The type of the track
 * @param ActionType The type of the action
 */
export interface ITimelineTypeInterface<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
> {
  /**
   * The type of the component.
   */
  [key: string]: any;
}

/**
*  @description This class represents a timeline action.
*/

export default class TimelineAction
{
    constructor( public  trackType : TrackType,  public  actionType : ActionType)
    {
        this.trackType = trackType;
        this.actionType = actionType;
    }

}