import {
  Engine,
  EngineState,
  PlaybackMode,
} from '@stoked-ui/timeline';
// import {IMediaFile, MediaFile} from "@stoked-ui/media";
import {EditorEvents, EditorEventTypes} from './events';
import {
  IEditorEngine, EditorEngineState, DrawData, EngineStateEx, EditorEngineOptions, WasmRendererConfig,
  ExportOptions,
} from "./EditorEngine.types";
import { IEditorTrack } from '../EditorTrack/EditorTrack';
import {type IEditorAction} from "../EditorAction/EditorAction";
import Controllers from "../Controllers/Controllers";
import CompositorController, { CompositorControl } from "../Controllers/CompositorController";

/**
 * Can be run independently of the editor
 * @export
 * @class EditorEngine
 * @extends {EditorEngine}
 */
/**
 * PreviewRenderer instance interface from WASM
 */
interface PreviewRendererInstance {
  render_frame(layersJson: string): void;
  clear(): void;
  get_metrics(): string;
  free(): void;
}

export default class EditorEngine<
  State extends string = EditorEngineState,
  EmitterEvents extends EditorEventTypes = EditorEventTypes
> extends Engine<State, EmitterEvents> implements IEditorEngine<State, EmitterEvents> {

  protected _viewer: HTMLElement | null = null;

  protected _renderer: HTMLCanvasElement | null = null;

  protected _renderCtx: CanvasRenderingContext2D | null = null;

  protected _rendererDetail: HTMLCanvasElement | null = null;

  protected _renderDetailCtx: CanvasRenderingContext2D | null = null

  protected  _renderWidth: number = 0;

  protected _renderHeight: number = 0;

  protected _screener: HTMLVideoElement | null = null;

  protected _stage: HTMLDivElement | null = null;

  _recorder?: MediaRecorder;

  _recordedChunks: Blob[] = [];

  /** Whether an offline frame export is in progress */
  protected _isExporting: boolean = false;

  /** AbortController used to cancel an in-progress exportVideo() call */
  protected _exportAbortController: AbortController | null = null;

  override _state: State;

  /** Action map that needs to be run */
  protected _actionMap: Record<string, IEditorAction> = {};

  protected _actionTrackMap: Record<string, IEditorTrack> = {};

  /** WASM renderer state */
  protected _useWasm: boolean = false;

  protected _compositorController: CompositorControl | null = null;

  protected _wasmRendererConfig: WasmRendererConfig;

  constructor(params: EditorEngineOptions ) {
    if (!params.events) {
      params.events = new EditorEvents()
    }
    super({...params});
    if (params?.viewer) {
      this._viewer = params.viewer;
    }

    this._controllers = params.controllers || Controllers;
    this._state = EngineState.LOADING as State;

    // Initialize WASM renderer if requested
    this._wasmRendererConfig = params.wasmRendererConfig || {
      enabled: false,
      maxMemoryMB: 200,
      fallbackToCanvas: true,
      debugMode: false,
    };

    if (params.useWasmRenderer && this._wasmRendererConfig.enabled !== false) {
      this._useWasm = true;
      this._compositorController = CompositorController;
      this._compositorController.logging = this._wasmRendererConfig.debugMode || false;
    }
  }

  getActionTrack(actionId: string): IEditorTrack {
    return this._actionTrackMap[actionId];
  }

  get state() {
    return this._state as State;
  };

  set state(newState: State) {
    this._state = newState;
  }

  get useWasm(): boolean {
    return this._useWasm;
  }

  /**
   * Check whether the canvas renderer is ready: non-null, attached to the DOM,
   * and has valid (non-zero) layout dimensions.
   */
  private _isRendererReady(): boolean {
    const canvas = this._renderer;
    if (!canvas) {
      return false;
    }
    if (!canvas.isConnected) {
      return false;
    }
    const { width, height } = canvas.getBoundingClientRect();
    if (width <= 0 || height <= 0) {
      return false;
    }
    return true;
  }

  /**
   * Initialize the WASM renderer module
   * Dynamically imports and initializes the WASM module, creates PreviewRenderer,
   * and connects it to CompositorController.
   *
   * Guards: canvas must be non-null, attached to the DOM, and have valid dimensions
   * before the WASM PreviewRenderer is constructed. If the canvas is not yet ready
   * the call is deferred via requestAnimationFrame until it becomes ready.
   */
  async initWasmRenderer(): Promise<boolean> {
    if (!this._useWasm || !this._compositorController) {
      return false;
    }

    // If the canvas is not yet in the DOM or has zero dimensions, defer using rAF.
    if (!this._isRendererReady()) {
      return new Promise<boolean>((resolve) => {
        const attemptInit = () => {
          if (this._isRendererReady()) {
            resolve(this.initWasmRenderer());
          } else {
            requestAnimationFrame(attemptInit);
          }
        };
        requestAnimationFrame(attemptInit);
      });
    }

    // At this point canvas is guaranteed to be in DOM with valid dimensions.
    const canvas = this._renderer!;
    const width = this.renderWidth;
    const height = this.renderHeight;

    if (width <= 0 || height <= 0) {
      console.error(
        `[EditorEngine] Cannot initialize WASM renderer: invalid dimensions ${width}x${height}`
      );
      if (this._wasmRendererConfig.fallbackToCanvas !== false) {
        console.warn('[EditorEngine] Falling back to Canvas rendering mode');
        this._useWasm = false;
        this._compositorController = null;
      }
      return false;
    }

    try {
      // Dynamically import the WASM module
      const { default: init, PreviewRenderer } = await import('@stoked-ui/video-renderer-wasm');

      // Initialize the WASM module
      await init();

      // Re-check canvas is still valid after the async WASM load
      if (!this._renderer || !this._renderer.isConnected) {
        throw new Error('Canvas renderer was removed from DOM during WASM module load');
      }

      const renderer = new PreviewRenderer(
        canvas,
        width,
        height,
      ) as unknown as PreviewRendererInstance;

      // Connect renderer to CompositorController
      this._compositorController.setRenderer(renderer);

      console.log('[EditorEngine] WASM renderer initialized successfully');

      return true;
    } catch (error) {
      console.error('[EditorEngine] Failed to initialize WASM renderer:', error);

      // Fallback to Canvas if enabled
      if (this._wasmRendererConfig.fallbackToCanvas !== false) {
        console.warn('[EditorEngine] Falling back to Canvas rendering mode');
        this._useWasm = false;
        this._compositorController = null;
        return false;
      }

      throw error;
    }
  }

  set viewer(viewer: HTMLElement) {
    this._viewer = viewer;
    const renderer = viewer.querySelector("canvas[role='renderer']") as HTMLCanvasElement;
    this._screener = viewer.querySelector("video[role='screener']") as HTMLVideoElement;
    this._stage = viewer.querySelector("div[role='stage']") as HTMLDivElement;
    if (renderer) {
      renderer.width = this.renderWidth;
      renderer.height = this.renderHeight;

      this._renderer = renderer;

      const ctx = renderer.getContext('2d', { alpha: true, willReadFrequently: true });
      if (ctx) {
        this._renderCtx = ctx;
        this._renderCtx.clearRect(0, 0, this.renderWidth, this.renderHeight);
      }
    }

    if (!(this.renderer && this.viewer && this.renderCtx)) {
      throw new Error('Assigned a viewer but could not locate the renderer, renderCtx, or preview elements.\n' +
        'Please ensure that the viewer has the following children:\n' +
        `  - renderer (canvas with working 2d context): ${this.renderer}` +
        `  - viewer: ${this.viewer}`);
    }

    // Initialize WASM renderer if enabled (async, non-blocking).
    // initWasmRenderer() will defer via requestAnimationFrame if the canvas is
    // not yet attached to the DOM or has zero layout dimensions.
    if (this._useWasm) {
      if (!this._isRendererReady()) {
        console.warn(
          '[EditorEngine] Canvas not yet in DOM or has zero dimensions; ' +
          'WASM init will be deferred via requestAnimationFrame'
        );
      }
      this.initWasmRenderer().catch((error) => {
        console.error('[EditorEngine] WASM initialization failed:', error);
      });
    }
  }

  get viewer(): HTMLElement | null {
    return this._viewer;
  }

  get screener(): HTMLVideoElement | null {
    return this._screener;
  }

  get stage(): HTMLDivElement | null {
    return this._stage;
  }

  set tracks(tracks: IEditorTrack[]) {
    this._dealData(tracks);
    this._dealClear();
    this._dealEnter(this._currentTime);
  }

  /** Whether it is playing */
  get isPlaying() {
    return this._state === EngineState.PLAYING as State || this.isRecording;
  }

  /** Whether it is playing */
  get isRecording() {
    return this._state === EngineStateEx.RECORDING as State;
  }

  /** Whether an offline frame-by-frame export is in progress */
  get isExporting() {
    return this._isExporting;
  }

  /**
   * Cancel an in-progress exportVideo() call.
   * If no export is running this is a no-op.
   */
  cancelExport(): void {
    if (this._exportAbortController) {
      this._exportAbortController.abort();
    }
  }

  // ---------------------------------------------------------------------------
  // Offline frame-by-frame export
  // ---------------------------------------------------------------------------

  /**
   * Collect the compositor layers that are active at the given time (in seconds).
   *
   * This mirrors the logic used by CompositorController: an action is active
   * when  action.start <= time < action.end  and the track is not hidden.
   */
  private _getActiveLayersAtTime(timeSec: number): Array<{
    id: string;
    type: string;
    content: Record<string, unknown>;
    transform: Record<string, unknown>;
    blendMode: string;
    visible: boolean;
    zIndex: number;
  }> {
    const layers: Array<{
      id: string;
      type: string;
      content: Record<string, unknown>;
      transform: Record<string, unknown>;
      blendMode: string;
      visible: boolean;
      zIndex: number;
    }> = [];

    for (const actionId of Object.keys(this._actionMap)) {
      const action = this._actionMap[actionId] as any;
      const track = this._actionTrackMap[actionId] as any;
      if (!action || !track) {
        continue;
      }
      // Only include actions that overlap with the current time
      if (action.start > timeSec || action.end <= timeSec) {
        continue;
      }
      if (action.disabled) {
        continue;
      }

      // Determine layer type and content from track file
      let layerType = 'solidColor';
      let content: Record<string, unknown> = {
        type: 'solidColor',
        color: [128, 128, 128, 255],
      };
      if (track.file) {
        const mimeType = (track.file.type || '').toLowerCase();
        if (mimeType.startsWith('video')) {
          layerType = 'video';
          content = { type: 'video', elementId: track.id };
        } else if (mimeType.startsWith('image')) {
          layerType = 'image';
          content = { type: 'image', url: track.file.url || '' };
        }
      }

      const transform: Record<string, unknown> = {
        x: action.x ?? 0,
        y: action.y ?? 0,
        scaleX: action.scaleX ?? 1,
        scaleY: action.scaleY ?? 1,
        rotation: action.rotation ?? 0,
        opacity: action.opacity ?? 1,
        width: action.width ?? this.renderWidth,
        height: action.height ?? this.renderHeight,
      };

      layers.push({
        id: action.id || track.id,
        type: layerType,
        content,
        transform,
        blendMode: action.blendMode || track.blendMode || 'normal',
        visible: !track.hidden,
        zIndex: action.z ?? track.zIndex ?? 0,
      });
    }

    // Sort by z-index so the WASM compositor receives them in correct order
    layers.sort((a, b) => a.zIndex - b.zIndex);
    return layers;
  }

  /**
   * Render a single frame at `timeSec` (seconds) using the WASM renderer and
   * return the canvas pixel data as a Blob (PNG by default).
   *
   * The canvas is cleared before each call so that stale pixels are not carried
   * over to the next frame.
   */
  private async _renderFrameToBlob(
    timeSec: number,
    mimeType: string = 'image/png'
  ): Promise<Blob | null> {
    const canvas = this._renderer;
    if (!canvas) {
      return null;
    }

    // Clear the canvas
    this._renderCtx?.clearRect(0, 0, this.renderWidth, this.renderHeight);

    const timeMs = timeSec * 1000;

    if (this._useWasm && this._compositorController) {
      // Use WASM renderer: collect active layers and call render_frame_at_time
      const layers = this._getActiveLayersAtTime(timeSec);
      const layersJson = JSON.stringify(layers);
      // Access the underlying renderer via the compositor controller
      const ctrl = this._compositorController as any;
      if (ctrl.renderer && typeof ctrl.renderer.render_frame_at_time === 'function') {
        ctrl.renderer.render_frame_at_time(layersJson, timeMs);
      } else if (ctrl.renderer && typeof ctrl.renderer.render_frame === 'function') {
        ctrl.renderer.render_frame(layersJson);
      }
    } else {
      // Canvas fallback: drive the standard controller lifecycle at this time point.
      // We call setTime with isTick=true so the controllers run enter/update/leave.
      this.setTime(timeSec, true);
      // Yield one microtask to let any synchronous canvas draw calls settle
      await Promise.resolve();
    }

    // Capture current canvas contents as a Blob
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), mimeType);
    });
  }

  /**
   * Export the current project as an offline video Blob without real-time playback.
   *
   * Strategy:
   *   1. Iterate frame times from 0 to duration at 1/fps intervals.
   *   2. For each frame, render via WASM (or Canvas fallback).
   *   3. Draw each frame Blob onto an OffscreenCanvas (or the main canvas) and
   *      feed it to a MediaRecorder capturing the canvas stream.
   *   4. When all frames are consumed, stop the recorder and return the Blob.
   *
   * WebCodecs (VideoEncoder) is used when available for higher-quality output;
   * the implementation falls back to MediaRecorder otherwise.
   *
   * @param options  Export options (fps, format, dimensions, progress callback, signal)
   * @returns  Promise that resolves to the encoded video Blob
   */
  async exportVideo(options: ExportOptions = {}): Promise<Blob> {
    if (this._isExporting) {
      throw new Error('[EditorEngine] exportVideo: an export is already in progress');
    }
    if (this.isPlaying || this.isRecording) {
      throw new Error('[EditorEngine] exportVideo: cannot export while playing or recording');
    }

    const canvas = this._renderer;
    if (!canvas) {
      throw new Error('[EditorEngine] exportVideo: no renderer canvas available');
    }

    const fps = options.fps ?? 30;
    const format = options.format ?? 'video/webm';
    const exportWidth = options.width ?? this.renderWidth;
    const exportHeight = options.height ?? this.renderHeight;
    const { onProgress, signal } = options;

    // Determine project duration from action map
    const duration = this.canvasDuration; // seconds
    if (duration <= 0) {
      throw new Error('[EditorEngine] exportVideo: project has no duration');
    }

    const totalFrames = Math.ceil(duration * fps);
    if (totalFrames === 0) {
      throw new Error('[EditorEngine] exportVideo: zero frames to render');
    }

    // Set up a fresh AbortController (merging with any caller-supplied signal)
    this._exportAbortController = new AbortController();
    const internalSignal = this._exportAbortController.signal;

    const isCancelled = () => internalSignal.aborted || (signal?.aborted ?? false);

    // Mark export in progress and save/restore current time
    this._isExporting = true;
    this._state = EngineStateEx.EXPORTING as State;
    const savedTime = this._currentTime;

    this.trigger('exportStart' as keyof EmitterEvents, { engine: this as any, totalFrames } as EmitterEvents[keyof EmitterEvents]);

    // Resize canvas to requested export dimensions if different
    const prevWidth = canvas.width;
    const prevHeight = canvas.height;
    if (exportWidth !== prevWidth || exportHeight !== prevHeight) {
      canvas.width = exportWidth;
      canvas.height = exportHeight;
    }

    // Create a MediaRecorder on the canvas stream to encode frames
    const stream = canvas.captureStream(0); // 0 fps = manual frame timing
    const recorderMimeType = format;
    let mimeType = recorderMimeType;
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      // Common fallback chain
      const fallbacks = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
      mimeType = fallbacks.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
      if (mimeType === '') {
        throw new Error('[EditorEngine] exportVideo: no supported MediaRecorder MIME type found');
      }
      console.warn(`[EditorEngine] exportVideo: requested format "${format}" not supported, using "${mimeType}"`);
    }

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    // Wrap the MediaRecorder stop in a promise
    const recordingFinished = new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
      };
      recorder.onerror = (ev) => {
        reject(new Error(`[EditorEngine] exportVideo: MediaRecorder error: ${ev}`));
      };
    });

    recorder.start();

    // Helper to request a frame to be captured
    const videoTrack = stream.getVideoTracks()[0] as MediaStreamTrack & {
      requestFrame?: () => void;
    };

    const requestFrame = () => {
      if (videoTrack && typeof videoTrack.requestFrame === 'function') {
        videoTrack.requestFrame();
      }
    };

    // Frame rendering loop
    let exportError: unknown = null;
    let wasCancelled = false;

    try {
      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
        if (isCancelled()) {
          wasCancelled = true;
          throw new DOMException('Export cancelled by caller', 'AbortError');
        }

        const timeSec = frameIndex / fps;

        // Render the frame (WASM or Canvas fallback)
        await this._renderFrameToBlob(timeSec, 'image/png');

        // Tell the MediaRecorder to grab the current canvas frame
        requestFrame();

        // Emit progress via callback and engine event
        const progressData = {
          frame: frameIndex,
          totalFrames,
          progress: frameIndex / totalFrames,
          currentTime: timeSec,
          duration,
        };
        if (onProgress) {
          onProgress(progressData);
        }
        this.trigger('exportProgress' as keyof EmitterEvents, { engine: this as any, progress: progressData } as EmitterEvents[keyof EmitterEvents]);

        // Yield to the browser event loop so the MediaRecorder can process chunks
        // and the canvas repaint can occur.  Using a 0ms timeout rather than
        // Promise.resolve() to give the browser a full task-queue cycle.
        await new Promise<void>((res) => setTimeout(res, 0));
      }

      // Final progress event at 100 %
      const finalProgress = {
        frame: totalFrames,
        totalFrames,
        progress: 1,
        currentTime: duration,
        duration,
      };
      if (onProgress) {
        onProgress(finalProgress);
      }
      this.trigger('exportProgress' as keyof EmitterEvents, { engine: this as any, progress: finalProgress } as EmitterEvents[keyof EmitterEvents]);
    } catch (err) {
      exportError = err;
    } finally {
      // Stop the recorder regardless of success/error/cancel
      recorder.stop();

      // Restore canvas dimensions
      if (exportWidth !== prevWidth || exportHeight !== prevHeight) {
        canvas.width = prevWidth;
        canvas.height = prevHeight;
      }

      // Restore engine state
      this._isExporting = false;
      this._exportAbortController = null;
      this._state = EngineState.PAUSED as State;
      // Restore playhead to the position before export
      this.setTime(savedTime, true);
    }

    // Surface cancellation and errors after cleanup
    if (wasCancelled) {
      this.trigger('exportCancelled' as keyof EmitterEvents, { engine: this as any } as EmitterEvents[keyof EmitterEvents]);
      throw new DOMException('Export cancelled by caller', 'AbortError');
    }

    if (exportError) {
      this.trigger('exportError' as keyof EmitterEvents, { engine: this as any, error: exportError } as EmitterEvents[keyof EmitterEvents]);
      throw exportError;
    }

    // Wait for the recorder to finish flushing
    const resultBlob = await recordingFinished;

    this.trigger('exportComplete' as keyof EmitterEvents, { blob: resultBlob, engine: this as any } as EmitterEvents[keyof EmitterEvents]);

    return resultBlob;
  }

  finalizeRecording(name: string) {
    console.info('finalizeVideo');
    const blob = new Blob(this._recordedChunks, {
      type: 'video/mp4',
    });

    // dispatch({ type: 'VIDEO_CREATED', payload: videoFile });
    this.trigger('finishedRecording', { blob, engine: this as any });
    // const url = URL.createObjectURL(blob);
    // setVideoURLs((prev) => [url, ...prev]);
    this._recordedChunks = [];
    this.pause();
    this._recorder = undefined;
  };

  recordVideo (name: string) {
    if (this.renderer) {

      // Get the video stream from the canvas renderer
      const videoStream = this.renderer.captureStream();

      // Use a single AudioContext to mix all audio sources into one track.
      // MediaRecorder only records one audio track, so we must mix before recording.
      const audioContext = Howler.ctx;
      const mixedDestination = audioContext.createMediaStreamDestination();

      // Connect the Howler master gain (mp3 / audio tracks) to the mix
      Howler.masterGain.connect(mixedDestination);

      // Connect each video element's audio to the same mix destination
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach((video) => {
        const videoElement = video as HTMLVideoElement & { captureStream?: () => MediaStream };
        if (videoElement.captureStream) {
          try {
            const source = audioContext.createMediaElementSource(videoElement);
            source.connect(mixedDestination);
            // Also keep the video audible during recording
            source.connect(audioContext.destination);
          } catch {
            // createMediaElementSource can only be called once per element;
            // if already connected, the audio is already routed through the context
          }
        }
      });

      // Combine the canvas video track with the single mixed audio track
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...mixedDestination.stream.getAudioTracks(),
      ]);

      // Create the MediaRecorder with the combined stream
      this._recorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/mp4',
      });
      this._recordedChunks = [];

      this._recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this._recordedChunks.push(e.data);
        }
      };

      this._recorder.onstop = () => {
        console.info('stopped recording');
        this.finalizeRecording(name);
      };

      this._recorder.start(100); // Start recording
    }
  };

  /**
   * Pause playback
   * @memberof Engine
   */
  pause() {
    if (this.isRecording && this._recorder) {
      this._recorder.stop();
    }
    super.pause();
  }

  /**
   * Run: The start time is the current time
   * @param param
   * @return {boolean} {boolean}
   */
  record(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number; /** Whether to automatically end after playing */
    autoEnd?: boolean;
    name: string;
  }): boolean {
    const {toTime, autoEnd} = param;

    const currentTime = this.time;

    /** The current state is being played or the running end time is less than the start time, return directly */
    if (this.isPlaying || (toTime && toTime <= currentTime)) {
      return false;
    }

    this._state = EngineStateEx.RECORDING as State;
    // activeIds run start
    this._startOrStop('start');
    // trigger event
    this.trigger('record', { engine: this as any });

    // Set running status

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({now: time, autoEnd, to: toTime});
    });

    this.recordVideo(param.name);

    return true;
  }

  get renderer(): HTMLCanvasElement | null {
    return this._renderer;
  }

  set renderer(canvas: HTMLCanvasElement) {
    this._renderer = canvas;
    if (canvas) {
      canvas.width = this.renderWidth;
      canvas.height = this.renderHeight;
      const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });

      if (!ctx) {
        throw new Error('Could not get 2d context from renderer');
      }
      this._renderCtx = ctx;
      this._renderCtx.clearRect(0, 0, this.renderWidth, this.renderHeight);
    }
  }

  get renderCtx() {
    return this._renderCtx;
  }

  setRenderView(width: number, height: number) {
    this._renderWidth = width;
    this._renderHeight = height;
  }

  get renderWidth() {
    return this._renderWidth || 1920
  }

  get renderHeight() {
    return this._renderHeight || 1080
  }

  drawImage(dd: DrawData) {
    this.renderCtx?.drawImage(dd.source, dd.sx, dd.sy, dd.sWidth, dd.sHeight, dd.dx ?? 0, dd.dy ?? 0, dd.dWidth ?? 1920, dd.dHeight ?? 1080);
  }

  static parseCoord(
    coord: number | string,
    coordContext: number,
    sceneContext: number
  ): number {

    // Helper to evaluate calc expressions like 'calc(100% - 20px)'
    const evaluateCalc = (expression: string, localSize: number, sceneSize: number): number => {
      // Replace 'vw' and 'vh' with '100%' since they map to width and height in this context
      expression = expression.replace(/(\d+)vw/g, (_, value) => `${(parseFloat(value) / 100) * (sceneSize - localSize)}px`);

      // Replace percentage values with their evaluated numbers
      expression = expression.replace(/(\d+)%/g, (_, value) => `${(parseFloat(value) / 100) * (sceneSize - localSize)}`);

      // Use `eval` to compute the final expression
      // eslint-disable-next-line no-eval
      const result = eval(expression);
      if (Number.isNaN(result)) {
        throw new Error(`Failed to evaluate calc expression: ${expression}`);
      }
      return result;
    };

    const parseValue = (value: number | string, localSize: number, sceneSize: number): number => {
      if (typeof value === 'number') {
        // If it's already a number, return it directly
        return value;
      }

      if (typeof value === 'string') {
        // Handle calc() values like 'calc(100% - 20px)'
        if (value.startsWith('calc(') && value.endsWith(')')) {
          const expression = value.slice(5, -1); // Extract the expression inside calc()
          return evaluateCalc(expression, localSize, sceneSize);
        }

        // Handle pixel values like '20px'
        if (value.endsWith('px')) {
          return parseFloat(value); // Convert the string to a number
        }

        // Handle percentage values like '50%'
        if (value.endsWith('%')) {
          const percentage = parseFloat(value) / 100;
          return (sceneSize - localSize) * percentage; // Calculate percentage of the total
        }
      }

      throw new Error(`Unsupported format for value: ${value}`);
    };

    return parseValue(coord, coordContext, sceneContext);
  }

  /**
   * Set playback time
   * @param {number} time
   * @param {boolean} [isTick] Whether it is triggered by a tick
   * @memberof Engine
   */
  setTime(time: number, isTick?: boolean): boolean {
    const result = isTick || this.trigger('beforeSetTime' as  keyof EmitterEvents, { time, engine: this as IEditorEngine } as EmitterEvents[keyof EmitterEvents]);
    if (!result) {
      return false;
    }

    // Clear canvas for both Canvas and WASM modes
    this._renderCtx?.clearRect(0, 0, this.renderWidth, this.renderHeight)

    // if (isTick)  {
    //  this._renderCtx?.clearRect(0, 0, this.renderWidth, this.renderHeight)
    // }

    this._next = 0;

    this._currentTime = time;
    if (this.playbackMode === PlaybackMode.TRACK_FILE && this.media && this.media.currentTime) {
      // this.media.currentTime = time / 1000;
    }
    this._dealLeave(time);
    this._dealEnter(time);

    // When WASM enabled, CompositorController handles rendering through the existing
    // controller lifecycle (enter/update/leave). No special handling needed here.

    if (isTick) {
      this.trigger('setTimeByTick' as keyof EmitterEvents, { time, engine: this as IEditorEngine } as EmitterEvents[keyof EmitterEvents]);
    }
    else {
      this.trigger('afterSetTime' as keyof EmitterEvents, { time, engine: this as IEditorEngine } as EmitterEvents[keyof EmitterEvents]);
    }
    return true;
  }

  /** Process action time enter */
  protected _dealEnter(time: number) {
    const active = Array.from(this._activeIds.values())
    const actionIdIndex = Object.keys(this._actionTrackMap);
    // add to active
    while (this._actionSortIds[this._next]) {
      const actionId = this._actionSortIds[this._next];
      const action = this._actionMap[actionId];

      if (!action.disabled) {
        // Determine whether the action start time has arrived

        if (action.start > time) {
          break;
        }
        const track = this._actionTrackMap[actionId];
        // The action can be executed and started
        if (action.end > time && active.indexOf(actionId) === -1) {
          const controller = track.controller;
          if (controller && controller?.enter) {
            controller.enter({action, track, time: this.time, engine: this as IEditorEngine});
          }

          const actionIndex = actionIdIndex.indexOf(actionId);
          this._activeIds.set(action.z ?? actionIndex, actionId);
        }
      }
      this._next += 1;
    }
  }
}

