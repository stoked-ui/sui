import {EventTypes} from "./events";
import {ITimelineAction, ITimelineActionType} from "../TimelineAction";
import {ITimelineTrack} from "../TimelineTrack";
import { Emitter } from "./emitter";

export interface ITimelineEngine extends Emitter<EventTypes> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  actionTypes: Record<string, ITimelineActionType>;
  tracks: ITimelineTrack[];
  viewer: HTMLElement;
  readonly renderer: HTMLCanvasElement;
  readonly renderCtx: CanvasRenderingContext2D;
  readonly preview: HTMLElement;


  /** Set playback rate */
  setPlayRate(rate: number): boolean;
  /** Get playback rate */
  getPlayRate(): number;
  /** Re-render the current time */
  reRender(): void;
  /** Set playback time */
  setTime(time: number, isTick?: boolean): boolean;
  /** Get playback time */
  getTime(): number;
  /** Play */
  play(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean;
  /** pause */
  pause(): void;

  getAction(actionId: string): { action: ITimelineAction, track: ITimelineTrack };
  getActionTrack(actionId: string):  ITimelineTrack;
  getSelectedActions(): { action: ITimelineAction, track: ITimelineTrack }[];
}

export type EngineOptions = {
  renderer?: HTMLCanvasElement
}
