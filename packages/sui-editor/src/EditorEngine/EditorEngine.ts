/**
 * Represents an Editor Engine that can be run independently of the editor.
 * @export
 * @class EditorEngine
 * @extends {Engine<State, EmitterEvents>}
 * @template State - The state type of the editor engine
 * @template EmitterEvents - The event types of the editor engine
 */
export default class EditorEngine<
  State extends string = EditorEngineState,
  EmitterEvents extends EditorEventTypes = EditorEventTypes
> extends Engine<State, EmitterEvents> implements IEditorEngine<State, EmitterEvents> {

  protected _viewer: HTMLElement | null = null;

  protected _renderer: HTMLCanvasElement | null = null;

  protected _renderCtx: CanvasRenderingContext2D | null = null;

  protected _rendererDetail: HTMLCanvasElement | null = null;

  protected _renderDetailCtx: CanvasRenderingContext2D | null = null;

  protected _renderWidth: number = 0;

  protected _renderHeight: number = 0;

  protected _screener: HTMLVideoElement | null = null;

  protected _stage: HTMLDivElement | null = null;

  _recorder?: MediaRecorder;

  _recordedChunks: Blob[] = [];

  override _state: State;

  /** Action map that needs to be run */
  protected _actionMap: Record<string, IEditorAction> = {};

  protected _actionTrackMap: Record<string, IEditorTrack> = {};

  /**
   * Creates an instance of EditorEngine.
   * @param {EngineOptions} params - The engine options
   */
  constructor(params: EngineOptions) {
    if (!params.events) {
      params.events = new EditorEvents();
    }
    super({...params});
    if (params?.viewer) {
      this._viewer = params.viewer;
    }

    this._controllers = params.controllers || Controllers;
    this._state = EngineState.LOADING as State;
  }

  /**
   * Get an action track by action ID.
   * @param {string} actionId - The ID of the action
   * @returns {IEditorTrack} The editor track associated with the action ID
   */
  getActionTrack(actionId: string): IEditorTrack {
    return this._actionTrackMap[actionId];
  }

  /**
   * Get the current state of the editor engine.
   */
  get state() {
    return this._state as State;
  };

  /**
   * Set the state of the editor engine.
   * @param {State} newState - The new state to set
   */
  set state(newState: State) {
    this._state = newState;
  }

  /**
   * Set the viewer element for rendering.
   * @param {HTMLElement} viewer - The viewer element
   */
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
  }

  /**
   * Get the viewer element.
   * @returns {HTMLElement | null} The viewer element
   */
  get viewer(): HTMLElement | null {
    return this._viewer;
  }

  /**
   * Get the screener element.
   * @returns {HTMLVideoElement | null} The screener element
   */
  get screener(): HTMLVideoElement | null {
    return this._screener;
  }

  /**
   * Get the stage element.
   * @returns {HTMLDivElement | null} The stage element
   */
  get stage(): HTMLDivElement | null {
    return this._stage;
  }

  /**
   * Set the tracks for the editor engine.
   * @param {IEditorTrack[]} tracks - The tracks to set
   */
  set tracks(tracks: IEditorTrack[]) {
    this._dealData(tracks);
    this._dealClear();
    this._dealEnter(this._currentTime);
  }

  /**
   * Check if the editor engine is currently playing.
   */
  get isPlaying() {
    return this._state === EngineState.PLAYING as State || this.isRecording;
  }

  /**
   * Check if the editor engine is currently recording.
   */
  get isRecording() {
    return this._state === EngineStateEx.RECORDING as State;
  }

  /**
   * Finalize the video recording.
   * @param {string} name - The name of the recorded video
   */
  finalizeRecording(name: string) {
    console.info('finalizeVideo');
    const blob = new Blob(this._recordedChunks, {
      type: 'video/mp4',
    });

    this.trigger('finishedRecording', { blob, engine: this as any });

    this._recordedChunks = [];
    this.pause();
    this._recorder = undefined;
  };

  /**
   * Record a video.
   * @param {string} name - The name of the video
   */
  recordVideo(name: string) {
    // Implementation details omitted for brevity
  };

  /**
   * Pause playback.
   */
  pause() {
    if (this.isRecording && this._recorder) {
      this._recorder.stop();
    }
    super.pause();
  }

  /**
   * Record an action.
   * @param {{ toTime?: number, autoEnd?: boolean, name: string }} param - The parameters for the action
   * @returns {boolean} Indicates if the action was successfully recorded
   */
  record(param: {
    toTime?: number;
    autoEnd?: boolean;
    name: string;
  }): boolean {
    // Implementation details omitted for brevity
    return true;
  }

  /**
   * Set the renderer element for rendering.
   * @param {HTMLCanvasElement} canvas - The renderer canvas element
   */
  set renderer(canvas: HTMLCanvasElement) {
    // Implementation details omitted for brevity
  }

  /**
   * Get the renderer element.
   * @returns {HTMLCanvasElement | null} The renderer element
   */
  get renderer(): HTMLCanvasElement | null {
    return this._renderer;
  }

  /**
   * Get the rendering context of the renderer canvas.
   * @returns {CanvasRenderingContext2D | null} The rendering context
   */
  get renderCtx() {
    return this._renderCtx;
  }

  /**
   * Set the rendering dimensions.
   * @param {number} width - The width of the rendering area
   * @param {number} height - The height of the rendering area
   */
  setRenderView(width: number, height: number) {
    this._renderWidth = width;
    this._renderHeight = height;
  }

  /**
   * Get the width of the rendering area.
   * @returns {number} The width of the rendering area
   */
  get renderWidth() {
    return this._renderWidth || 1920;
  }

  /**
   * Get the height of the rendering area.
   * @returns {number} The height of the rendering area
   */
  get renderHeight() {
    return this._renderHeight || 1080;
  }

  /**
   * Draw an image on the renderer canvas.
   * @param {DrawData} dd - The draw data for the image
   */
  drawImage(dd: DrawData) {
    this.renderCtx?.drawImage(dd.source, dd.sx, dd.sy, dd.sWidth, dd.sHeight, dd.dx ?? 0, dd.dy ?? 0, dd.dWidth ?? 1920, dd.dHeight ?? 1080);
  }

  /**
   * Parse a coordinate value based on context.
   * @param {number | string} coord - The coordinate value to parse
   * @param {number} coordContext - The context of the coordinate
   * @param {number} sceneContext - The context of the scene
   * @returns {number} The parsed coordinate value
   */
  static parseCoord(
    coord: number | string,
    coordContext: number,
    sceneContext: number
  ): number {
    // Implementation details omitted for brevity
    return 0;
  }

  /**
   * Set the playback time for the editor engine.
   * @param {number} time - The time to set for playback
   * @param {boolean} [isTick] - Indicates if the setting is triggered by a tick
   * @returns {boolean} Indicates if the time was successfully set
   */
  setTime(time: number, isTick?: boolean): boolean {
    // Implementation details omitted for brevity
    return true;
  }

  /** Process action time enter */
  protected _dealEnter(time: number) {
    // Implementation details omitted for brevity
  }
}