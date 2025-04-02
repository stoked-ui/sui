import type {ITimelineTrack} from "../TimelineTrack";
import type {IController} from '../Controller/Controller.types';
import type {ITimelineAction } from "../TimelineAction";
import type { EventTypes } from './events';
import { Emitter } from "./emitter";

export type SetAction<S> = S | ((prevState: S) => S);
export type Dispatch<A> = (value: A) => void;

export interface IEngine<EmitterEvents extends EventTypes = EventTypes> extends Emitter<EmitterEvents> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  readonly isLoading: boolean;
  logging: boolean;
  controllers: Record<string, any>;
  readonly duration: number;
  maxDuration: number;
  readonly canvasDuration: number;
  readonly actions: Record<string, ITimelineAction>;
  state: string;
  playbackMode: PlaybackMode;

  getStartTime(): number;

  getEndTime(): number;

  setStart(): void;

  setEnd(): void;

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
  get time(): number;
  /** Play backwards increasing in speed incrementally */
  rewind(delta: number): void;
  /** Play forwards increasing in speed incrementally */
  fastForward(delta: number): void;
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

export enum EngineState {
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  READY = 'READY',
  PREVIEW = 'PREVIEW',
}

export type EngineOptions = {
  viewer?: HTMLElement;
  controllers?: Record<string, IController>;
  events?: any;
}

export type Version = { id: string, version: number, key: string };

export enum PlaybackMode {
  TRACK_FILE = 'TRACK_FILE',
  CANVAS = 'CANVAS',
  MEDIA = 'MEDIA'
}

