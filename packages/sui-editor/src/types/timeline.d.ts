declare module '@stoked-ui/timeline' {
  import * as React from 'react';

  export enum MediaType {
    Image = 'image',
    Video = 'video',
    Audio = 'audio',
    Text = 'text',
    Unknown = 'unknown',
  }

  export interface IMediaFile {
    id: string;
    name: string;
    size: number;
    type: string;
    mediaType: MediaType;
  }

  export class MediaFile implements IMediaFile {
    id: string;
    name: string;
    size: number;
    type: string;
    mediaType: MediaType;
    
    constructor(file: IMediaFile);
    static from(file: File): MediaFile;
  }

  export interface ITimelineTrack {
    id: string;
    name: string;
    index?: number;
    actions?: ITimelineAction[];
    locked?: boolean;
    muted?: boolean;
    expanded?: boolean;
    hidden?: boolean;
    type?: string;
    color?: string;
    metadata?: Record<string, any>;
  }

  export interface ITimelineFileTrack extends ITimelineTrack {
    file?: MediaFile;
  }

  export interface ITimelineAction {
    id: string;
    trackId?: string;
    name?: string;
    start?: number;
    end?: number;
    duration?: number;
    type?: string;
    locked?: boolean;
    expanded?: boolean;
    hidden?: boolean;
    metadata?: Record<string, any>;
  }

  export interface ITimelineFileAction extends ITimelineAction {
    file?: MediaFile;
  }

  export interface IController {
    getItem: (params: GetItemParams) => Promise<HTMLElement | null>;
    preload: (params: PreloadParams) => Promise<void>;
    cleanup: () => void;
  }

  export interface GetItemParams {
    file: MediaFile;
    start?: number;
    end?: number;
  }

  export interface PreloadParams {
    file: MediaFile;
  }

  export interface ControllerParams {
    file: MediaFile;
    start?: number;
    end?: number;
  }

  export interface TimelineProps {
    tracks?: ITimelineTrack[];
    currentTime?: number;
    duration?: number;
    waveformData?: any;
    onTimeChange?: (time: number) => void;
    onTrackAdd?: (track: ITimelineTrack) => void;
    onTrackRemove?: (trackId: string) => void;
    onTrackUpdate?: (track: ITimelineTrack) => void;
    onActionAdd?: (action: ITimelineAction) => void;
    onActionRemove?: (actionId: string) => void;
    onActionUpdate?: (action: ITimelineAction) => void;
  }

  export interface TimelineControlProps {
    currentTime?: number;
    duration?: number;
    onTimeChange?: (time: number) => void;
    onPlay?: () => void;
    onPause?: () => void;
    playing?: boolean;
  }

  export interface IEngine {
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    addEventListener: (event: string, callback: (data?: any) => void) => void;
    removeEventListener: (event: string, callback: (data?: any) => void) => void;
    state?: any;
    on?: (event: string, callback: () => void) => void;
  }

  export interface TimelineSlotProps {
    track: ITimelineTrack;
  }

  export enum Events {
    TimeUpdate = 'timeupdate',
    Play = 'play',
    Pause = 'pause',
    Stop = 'stop',
    Error = 'error',
  }

  export enum EventTypes {
    TimeUpdate = 'timeupdate',
    Play = 'play',
    Pause = 'pause',
    Stop = 'stop',
    Error = 'error',
  }

  export enum FileState {
    Loading = 'loading',
    Ready = 'ready',
    Error = 'error',
  }

  export enum EngineState {
    Loading = 'loading',
    Ready = 'ready',
    Error = 'error',
    LOADING = 'loading',  // Alias for backward compatibility
    READY = 'ready',      // Alias for backward compatibility
    ERROR = 'error',      // Alias for backward compatibility
  }

  export interface IFileDetail {
    file: MediaFile;
    id?: string;
    name?: string;
    type?: string;
    size?: number;
    mediaType?: MediaType;
    url?: string;
    thumbnail?: string;
  }

  export interface Version {
    id: string;
    name: string;
  }

  export enum ControlState {
    Playing = 'playing',
    Paused = 'paused',
    Loading = 'loading',
  }

  export interface OutputBlob {
    blob: Blob;
    url: string;
  }

  export interface ITimelineTrackDetail {
    track: ITimelineTrack;
  }

  export function createAction(trackId: string, start: number, end: number): ITimelineAction;
  export function initTimelineAction(action: ITimelineAction): ITimelineAction;
  export function TimelineProvider(props: any): JSX.Element;
  export function getDbProps(): any;
  export function createTimelineState(): any;
  export class TimelineFile {
    static create(file: File): Promise<MediaFile>;
  }
  export function ToggleButtonGroupEx(props: any): JSX.Element;
  export function ToggleVolume(props: any): JSX.Element;
  export function ToggleLock(props: any): JSX.Element;
  export const TimelineContext: React.Context<any>;
  export function TrackDetail(props: any): JSX.Element;
  export function ActionDetail(props: any): JSX.Element;
  export const TimelineSlot: React.ElementType;
  
  // Additional editor-specific exports
  export interface EditorControlState {
    play?: boolean;
    record?: boolean;
  }
} 
