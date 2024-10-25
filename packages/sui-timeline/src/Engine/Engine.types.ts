import * as React from "react";
import type {ITimelineTrack} from "../TimelineTrack";
import type {DrawData, IController} from './Controller.types';
import type {ITimelineAction, ITimelineFileAction} from "../TimelineAction";
import type { EventTypes } from './events';
import {ITimelineFile} from "../TimelineFile/TimelineFile";

export interface IEmitter<Events> {
  events: { [key: string]: CallableFunction[] };
  on<K extends keyof Events>(names: K | K[], handler: (args: Events[K]) => boolean | unknown): this;
  trigger<K extends keyof Events>(name: K, params: Events[K]): boolean;
  bind(name: string): void;
  exist(name: string): boolean;
  off<K extends keyof Events>(name: K, handler?: (args: Events[K]) => boolean | unknown): void;
  offAll(): void;
}

export type ViewMode = 'Renderer' | 'Screener' | 'Edit';
export type ScreenerBlob = { blob: Blob, version: number, name: string, key: string, created: number, size: number};
export interface IEngine extends IEmitter<EventTypes> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  logging: boolean;
  detailMode?: boolean;
  controllers: Record<string, any>;
  viewer: HTMLElement | null;
  viewMode: ViewMode;
  readonly screener: HTMLVideoElement | null;
  screenerBlob: ScreenerBlob | null;
  readonly stage: HTMLDivElement | null;
  readonly renderer: HTMLCanvasElement | null;
  readonly renderCtx: CanvasRenderingContext2D | null;
  rendererDetail: HTMLCanvasElement | null;
  readonly renderDetailCtx: CanvasRenderingContext2D | null;
  readonly duration: number;
  tracks: ITimelineTrack[];
  setTracks: React.Dispatch<React.SetStateAction<ITimelineTrack[] | null>> | undefined;
  readonly renderWidth: number;
  readonly renderHeight: number;
  buildTracks: (controllers: Record<string, IController>, actionData: ITimelineFileAction[]) => Promise<ITimelineTrack[]>
  action: ITimelineAction | undefined;
  readonly actions: Record<string, ITimelineAction>;
  file: ITimelineFile;
  control: any;
  setFile: React.Dispatch<React.SetStateAction<ITimelineFile>> | undefined;
  selected: any;

  drawImage(dd: DrawData): void;

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



}

export type PlayState = 'playing' | 'paused';

export type EngineOptions = {
  viewer?: HTMLElement;
  id: string;
  controllers?: Record<string, IController>;
  events?: any;
  defaultState: string;
  file: any;
  setFile: React.Dispatch<React.SetStateAction<any>>
}
