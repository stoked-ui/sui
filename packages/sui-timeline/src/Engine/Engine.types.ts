import * as React from "react";
import type {ITimelineTrack} from "../TimelineTrack";
import type { IController } from './Controller.types';
import type { ITimelineAction, ITimelineActionInput} from "../TimelineAction";
import type { EventTypes } from './events';

export interface IEmitter<EventTypes> {
  events: { [key: string]: CallableFunction[] };
  on<K extends keyof EventTypes>(names: K | K[], handler: (args: EventTypes[K]) => boolean | unknown): this;
  trigger<K extends keyof EventTypes>(name: K, params: EventTypes[K]): boolean;
  bind(name: string): void;
  exist(name: string): boolean;
  off<K extends keyof EventTypes>(name: K, handler?: (args: EventTypes[K]) => boolean | unknown): void;
  offAll(): void;
}

export interface IEngine extends IEmitter<EventTypes> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  controllers: Record<string, any>;
  viewer: HTMLElement | null;
  readonly screener: HTMLVideoElement | null;
  readonly stage: HTMLDivElement | null;
  readonly renderer: HTMLCanvasElement | null;
  readonly renderCtx: CanvasRenderingContext2D | null;
  readonly duration: number;
  tracks: ITimelineTrack[];
  setTracks: React.Dispatch<React.SetStateAction<ITimelineTrack[]>> | undefined;
  readonly renderWidth: number;
  readonly renderHeight: number;
  buildTracks: (controllers: Record<string, IController>, actionData: ITimelineActionInput[]) => Promise<ITimelineTrack[]>
  action: ITimelineAction | undefined;
  readonly actions: Record<string, ITimelineAction>;

  setScrollLeft(left: number): void;
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

  getActionTrack(actionId: string):  any;

  getSelectedActions(): { action: ITimelineAction, track: ITimelineTrack }[];
}

