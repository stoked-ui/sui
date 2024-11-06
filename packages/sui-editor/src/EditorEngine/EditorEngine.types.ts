import {
  Engine,
  EngineState,
  ITimelineTrack,
} from '@stoked-ui/timeline';
import { type EditorEventTypes} from "./events";
import type { IEditorAction } from "../EditorAction/EditorAction";

export interface IEditorTrack<
  ActionType extends IEditorAction = IEditorAction,
>  extends ITimelineTrack<ActionType> {}

export interface IEditorEngine<
  State extends string = EditorEngineState,
  EmitterEvents extends EditorEventTypes = EditorEventTypes
>
  extends Engine<State, EmitterEvents> {

  readonly isRecording: boolean;
  viewer: HTMLElement | null;
  readonly stage: HTMLDivElement | null;
  readonly renderer: HTMLCanvasElement | null;
  readonly renderCtx: CanvasRenderingContext2D | null;
  readonly renderWidth: number;
  readonly renderHeight: number;

  drawImage(dd: DrawData): void;

  record(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean;
}

export type EditorEngineState = EngineState | 'recording';

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


