/**
 * Interface for the Editor Engine that extends the base Engine interface.
 * This interface defines properties and methods specific to the Editor Engine.
 * @template State - The state type for the Editor Engine, extending EditorEngineState.
 * @template EmitterEvents - The event types for the Editor Engine, extending EditorEventTypes.
 */
export interface IEditorEngine<
  State extends string = EditorEngineState,
  EmitterEvents extends EditorEventTypes = EditorEventTypes
> extends Engine<State, EmitterEvents> {

  /** Indicates if the engine is currently recording. */
  readonly isRecording: boolean;

  /** Reference to the viewer element. */
  viewer: HTMLElement | null;

  /** Reference to the stage element. */
  readonly stage: HTMLDivElement | null;

  /** Reference to the screener element. */
  readonly screener: HTMLVideoElement | null;

  /** Reference to the renderer element. */
  renderer: HTMLCanvasElement | null;

  /** Rendering context of the canvas. */
  readonly renderCtx: CanvasRenderingContext2D | null;

  /** Width of the rendering area. */
  readonly renderWidth: number;

  /** Height of the rendering area. */
  readonly renderHeight: number;

  /**
   * Draw an image on the canvas.
   * @param {DrawData} dd - Data object containing image and draw parameters.
   */
  drawImage(dd: DrawData): void;

  /**
   * Start recording the timeline with optional parameters.
   * @param {Object} param - Object containing recording parameters.
   * @param {number} [param.toTime] - End time for recording.
   * @param {boolean} [param.autoEnd] - Flag to automatically end recording.
   * @param {string} [param.name] - Name of the recording.
   * @returns {boolean} - Indicates if the recording started successfully.
   */
  record(param: {
    toTime?: number;
    autoEnd?: boolean;
    name?: string;
  }): boolean;
}

/**
 * Extended EngineState enum for the Editor Engine.
 */
export enum EngineStateEx {
  RECORDING = 'RECORDING'
}

/**
 * Type alias for the state of the Editor Engine, combining base EngineState and EngineStateEx.
 */
export type EditorEngineState =  EngineState | EngineStateEx;

/**
 * Object type for drawing image data.
 */
export interface DrawData {
  source:  HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | VideoFrame;
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
  dx?: number;
  dy?: number;
  dWidth?: number;
  dHeight?: number;
}

/**
 * Type alias for the view mode of the Editor Engine.
 */
export type ViewMode = 'Renderer' | 'Screener' | 'Edit';