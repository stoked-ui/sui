import {
  Engine,
  EngineState,
  ITimelineTrack,
  RowRndApi
} from '@stoked-ui/timeline';
import { type EditorEventTypes} from "./events";

export interface IEditorEngine<
  State extends string = EditorEngineState,
  EmitterEvents extends EditorEventTypes = EditorEventTypes
>
  extends Engine<State, EmitterEvents> {

  readonly isRecording: boolean;
  viewer: HTMLElement | null;
  readonly stage: HTMLDivElement | null;
  readonly screener: HTMLVideoElement | null;
  renderer: HTMLCanvasElement | null;
  readonly renderCtx: CanvasRenderingContext2D | null;
  readonly renderWidth: number;
  readonly renderHeight: number;

  drawImage(dd: DrawData): void;

  record(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
    name?: string;
  }): boolean;
}

export enum EngineStateEx {
  RECORDING = 'RECORDING'
}

export type EditorEngineState =  EngineState | EngineStateEx;

export interface DrawData {
  source:  HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame,
  sx: number,
  sy: number,
  sWidth: number,
  sHeight: number,
  dx?: number,
  dy?: number,
  dWidth?: number,
  dHeight?: number
}

export type ViewMode = 'Renderer' | 'Screener' | 'Edit';



