import {
  Engine,
  EngineState,
  EngineOptions,
} from '@stoked-ui/timeline';
import { type EditorEventTypes} from "./events";

export interface WasmRendererConfig {
  enabled: boolean;
  maxMemoryMB?: number;     // default 200
  fallbackToCanvas?: boolean; // default true
  debugMode?: boolean;
}

export interface EditorEngineOptions extends EngineOptions {
  useWasmRenderer?: boolean;
  wasmRendererConfig?: WasmRendererConfig;
}

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
  readonly useWasm: boolean;

  drawImage(dd: DrawData): void;

  record(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
    name?: string;
  }): boolean;

  exportVideo(options?: ExportOptions): Promise<Blob>;

  cancelExport(): void;

  readonly isExporting: boolean;
}

export enum EngineStateEx {
  RECORDING = 'RECORDING',
  EXPORTING = 'EXPORTING',
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

/**
 * Options for the offline frame-by-frame video export.
 */
export interface ExportOptions {
  /** Frames per second. Defaults to 30. */
  fps?: number;
  /** Output MIME type (e.g. 'video/webm', 'video/mp4'). Defaults to 'video/webm'. */
  format?: string;
  /** Output width in pixels. Defaults to the engine renderWidth. */
  width?: number;
  /** Output height in pixels. Defaults to the engine renderHeight. */
  height?: number;
  /** Called on each encoded frame with progress info. */
  onProgress?: (progress: ExportProgress) => void;
  /** AbortSignal to cancel the export mid-flight. */
  signal?: AbortSignal;
}

/**
 * Progress information emitted during exportVideo().
 */
export interface ExportProgress {
  /** 0-based index of the current frame. */
  frame: number;
  /** Total number of frames to render. */
  totalFrames: number;
  /** Fraction complete in [0, 1]. */
  progress: number;
  /** Current time position in seconds. */
  currentTime: number;
  /** Total duration in seconds. */
  duration: number;
}


