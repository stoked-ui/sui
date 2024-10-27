import * as React from "react";
import { IMediaFile, MediaFile } from "@stoked-ui/media-selector";
import type {ITimelineTrack} from "../TimelineTrack";
import type {DrawData, IController} from '../Controller/Controller.types';
import type {ITimelineAction, ITimelineFileAction} from "../TimelineAction";
import type { EventTypes } from './events';
import { Events } from "./events";
import { Emitter } from "./emitter";
/*
export interface IEmitter<Events extends EventTypes = EventTypes> {
  events: { [key: string]: CallableFunction[] };
  on<K extends keyof Events>(names: K | K[], handler: (args: Events[K]) => boolean | unknown): IEmitter<Events>;
  trigger<K extends keyof Events>(name: K, params: Events[K]): boolean;
  bind(name: string): void;
  exist(name: string): boolean;
  off<K extends keyof Events>(name: K, handler?: (args: Events[K]) => boolean | unknown): void;
  offAll(): void;
} */

export type ViewMode = 'Renderer' | 'Screener' | 'Edit';

export type ScreenerBlob = {
  blob: Blob,
  id: string,
  version: number,
  name: string,
  key: string,
  created: number,
  lastModified: number,
  size: number
};

export function MediaFileFromScreenerBlob(screenerBlob: ScreenerBlob): IMediaFile {
  const { blob } = screenerBlob;
  const mediaFile: IMediaFile = {
    ...screenerBlob,
    mediaType: 'video',
    icon: null,
    thumbnail: null,
    url: URL.createObjectURL(screenerBlob.blob),
    type: 'video/webm',
    arrayBuffer: blob.arrayBuffer,
    stream: blob.stream,
    text: blob.text,
    slice: blob.slice,
    webkitRelativePath: screenerBlob.name,
    itemId: screenerBlob.id,
  };
  return MediaFile.fromFile(mediaFile);
}

export interface IEngine<EmitterEvents extends EventTypes = EventTypes> extends Emitter<EmitterEvents> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  readonly isLoading: boolean;
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
  readonly renderWidth: number;
  readonly renderHeight: number;
  readonly actions: Record<string, ITimelineAction>;
  control: any;

  saveVersion(vidBlob: ScreenerBlob): Promise<IDBValidKey>;

  loaded(): void;

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
  setTracks(tracks: ITimelineTrack[]): void;
  versionFiles(id: string): Promise<IMediaFile[]>

  getVersionKeys(id: string): Promise<Version[]>;
}

export type EngineState = 'loading' | 'playing' | 'paused';

export type EngineOptions = {
  viewer?: HTMLElement;
  controllers?: Record<string, IController>;
  events?: any;
}

export type Version = { id: string, version: number, key: string };
