import type {ITimelineTrack} from "../TimelineTrack";
import type {IController} from '../Controller/Controller.types';
import type {ITimelineAction } from "../TimelineAction";
import type { EventTypes } from './events';
import { Emitter } from "./emitter";


export interface IEngine<EmitterEvents extends EventTypes = EventTypes> extends Emitter<EmitterEvents> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  readonly isLoading: boolean;
  logging: boolean;
  detailMode?: boolean;
  controllers: Record<string, any>;
  readonly duration: number;
  readonly actions: Record<string, ITimelineAction>;
  control: any;
  state: string;

  setScrollLeft(left: number): void;
  /** Set playback rate */
  setPlayRate(rate: number): boolean;
  /** Get playback rate */
  getPlayRate(): number;
  /** Re-render the current time */
  reRender(): void;
  /** process a single tick */
  tickAction(time: number): void;
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

  getAction(actionId: string):

    { action: ITimelineAction, track: ITimelineTrack };

  getActionTrack(actionId: string):  ITimelineTrack;

  getSelectedActions(): { action: ITimelineAction, track: ITimelineTrack }[];
  setTracks(tracks: ITimelineTrack[]): void;

}

export type EngineState = 'loading' | 'playing' | 'paused' | 'ready';

export type EngineOptions = {
  viewer?: HTMLElement;
  controllers?: Record<string, IController>;
  events?: any;
}

export type Version = { id: string, version: number, key: string };
