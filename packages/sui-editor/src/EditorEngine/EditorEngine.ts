import {Emitter, Engine,  ITimelineTrack, EngineOptions, EventTypes, EngineState } from '@stoked-ui/timeline';
import {EditorEvents, EditorEventTypes} from './events';
import {
  IEditorEngine, EditorEngineState, ViewMode, DrawData,

} from "./EditorEngine.types";
import {IEditorAction} from "../EditorAction/EditorAction";
import {IEditorTrack} from "../EditorTrack/EditorTrack";


/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class Engine
 * @extends {Engine<EditorState, EditorEventTypes>}
 */
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

  override _state: State;

  /** Action map that needs to be run */
  protected _actionMap: Record<string, IEditorAction> = {};

  protected _actionTrackMap: Record<string, IEditorTrack> = {};

  constructor(params: EngineOptions ) {
    if (!params.events) {
      params.events = new EditorEvents()
    }
    super({...params});
    if (params?.viewer) {
      this._viewer = params.viewer;
    }
    if (params?.controllers) {
      this._controllers = params.controllers;
    }

    this._state = 'loading' as State;
  }

  get state() {
    return this._state as State;
  };

  set state(newState: State) {
    this._state = newState;
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
      throw new Error('Assigned a viewer but could not locate the renderer, renderCtx, or' +
        ' preview elements.\n' +
        'Please ensure that the viewer has the following children:\n' +
        `  - renderer (canvas with working 2d context): ${this.renderer}` +
        `  - viewer: ${this.viewer}`);
    }
  }

  get viewer(): HTMLElement | null {
    return this._viewer;
  }

  get stage(): HTMLDivElement | null {
    return this._stage;
  }

  set tracks(tracks: ITimelineTrack[]) {
    this._dealData(tracks);
    this._dealClear();
    this._dealEnter(this._currentTime);
  }

  /** Whether it is playing */
  get isPlaying() {
    return this._state === 'playing' as State || this.isRecording;
  }

  /** Whether it is playing */
  get isRecording() {
    return this._state === 'recording' as State;
  }
/*
  displayVersion(screenerBlob: ScreenerBlob) {
    ScreenVideoBlob(screenerBlob, this as any);
  } */

  /**
   * Get the current time
   * @return {*} {number}
   * @memberof Engine
   */
  getTime(): number {
    return this._currentTime;
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
  }): boolean {
    const {toTime, autoEnd} = param;

    const currentTime = this.getTime();

    /** The current state is being played or the running end time is less than the start time, return directly */
    if (this.isPlaying || (toTime && toTime <= currentTime)) {
      return false;
    }

    this._state = 'recording' as State;
    // activeIds run start
    this._startOrStop('start');
    // trigger event
    this.trigger('record', { engine: this as any });

    // Set running status

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({now: time, autoEnd, to: toTime});
    });
/*
    // Get the video stream from the canvas renderer
    const videoStream = this.renderer?.captureStream();

    // Get the Howler audio stream
    const audioContext = Howler.ctx;
    const destination = audioContext.createMediaStreamDestination();
    Howler.masterGain.connect(destination);
    const audioStream = destination.stream;

    // Get audio tracks from video elements
    const videoElements = document.querySelectorAll('video');
    const videoAudioStreams: MediaStreamTrack[] = [];
    videoElements.forEach((video) => {
      const videoElement = video as HTMLVideoElement & { captureStream?: () => MediaStream };

      if (videoElement.captureStream) {
        const videoStream = videoElement.captureStream();
        videoStream.getAudioTracks().forEach((track) => {
          videoAudioStreams.push(track);
        });
      }
    });

    // Combine Howler and video audio streams
    const combinedAudioStream = new MediaStream([
      ...audioStream.getAudioTracks(),
      ...videoAudioStreams,
    ]);

    // Combine the video and audio streams
    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...combinedAudioStream.getAudioTracks(),
    ]);

    // Create the MediaRecorder with the combined stream
    this._recorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/mp4',
    });
    // setMediaRecorder(recorder);
    // setRecordedChunks([]);
    this._recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this._recordedChunks.push(e.data);
        // setRecordedChunks([...recordedChunks]);
      }
    };

    this._recorder.onstop = () => {
      if (!this.screener || !this.renderer || !this.stage) {
        console.warn("recording couldn't stop");
        return;
      }
      this.pause();
      this.finalizeRecording();
    };

    this._recorder.start(100); // Start recording

     */
    return true;
  }
   /**
   * Run: The start time is the current time
   * @param param
   * @return {boolean} {boolean}
   */
  /*
  play(param: {
    // By default, it runs from beginning to end, with a priority greater than autoEnd
    toTime?: number;
    // Whether to automatically end after playing
    autoEnd?: boolean;
  }): boolean {
    const { toTime, autoEnd } = param;

    const currentTime = this.getTime();
    // The current state is being played or the running end time is less than the start time,  return directly

    if (this.isPlaying || (toTime && toTime <= currentTime)) {
      return false;
    }

    // Set running status
    this._state = 'playing' as State;

    // activeIds run start
    this._startOrStop('start');

    // trigger event
    this.trigger('play' as keyof EmitterEvents, { engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
    if (this.viewMode === 'Screener') {
      this.screener.play()
      .then(() => {
        this._timerId = requestAnimationFrame((time: number) => {

          this._prev = time;
          this._tick({now: time, autoEnd, to: toTime});
        });
      })
    } else {
      this._timerId = requestAnimationFrame((time: number) => {
        this._prev = time;
        this._tick({now: time, autoEnd, to: toTime});
      });
    }

    return true;
  }

  */
  /**
   * Pause playback
   * @memberof Engine
   */
  /*
  pause() {
    if (this.isPlaying) {
      const previousState = this._state;
      this._state = 'paused' as State;

      if (this._viewMode === 'Screener') {
        this._screener.pause();
        return;
      }

      // activeIds run stop
      this._startOrStop('stop');

      this.trigger('paused' as keyof EmitterEvents, { engine: this as IEngine, previousState } as EmitterEvents[keyof EmitterEvents]);
    }
    cancelAnimationFrame(this._timerId);
  } */

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
/*
  get rendererDetail() {
    return this._rendererDetail;
  }

  set rendererDetail(canvas: HTMLCanvasElement) {
    this._rendererDetail = canvas;
    if (canvas) {
      canvas.width = this.renderWidth;
      canvas.height = this.renderHeight;
      const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });

      if (!ctx) {
        throw new Error('Could not get 2d context from renderer');
      }
      this._renderDetailCtx = ctx;
      this._renderDetailCtx.clearRect(0, 0, this.renderWidth, this.renderHeight);
    }
  }

  get renderDetailCtx() {
    return this._renderDetailCtx;
  }
 */

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

    this._renderCtx?.clearRect(0, 0, this.renderWidth, this.renderHeight)

    this._next = 0;

    this._currentTime = time;

    this._dealLeave(time);
    this._dealEnter(time);

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
    // add to active
    while (this._actionSortIds[this._next]) {
      const actionId = this._actionSortIds[this._next];
      const action = this._actionMap[actionId];

      if (!action.disable) {
        // Determine whether the action start time has arrived

        if (action.start > time) {
          break;
        }
        const track = this._actionTrackMap[actionId];
        // The action can be executed and started
        if (action.end > time && active.indexOf(actionId) === -1 && !track.hidden) {
          const controller = track.controller;
          if (controller && controller?.enter) {
            controller.enter({action, time: this.getTime(), engine: this as IEditorEngine});
          }

          this._activeIds.set(action.z, actionId);
        }
      }
      this._next += 1;
    }
  }
}
/*

 loadedActions.forEach((loadedAction) => {
 if (!loadedAction) {
 throw new Error(`Action not preloaded`);
 }
 if (loadedAction.x) {
 loadedAction.x = Engine.parseCoord(loadedAction.x, loadedAction.width, engine.renderWidth);
 } else {
 loadedAction.x = 0;
 }
 if (loadedAction.y) {
 loadedAction.y = Engine.parseCoord(loadedAction.y, loadedAction.height, engine.renderHeight);
 } else {
 loadedAction.y = 0;
 }
 })
 */

