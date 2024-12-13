import {
  Engine,
  EngineOptions, EngineState, IController,
} from '@stoked-ui/timeline';
import {EditorEvents, EditorEventTypes} from './events';
import {
  IEditorEngine, EditorEngineState, DrawData, EngineStateEx,
} from "./EditorEngine.types";
import { IEditorTrack } from '../EditorTrack/EditorTrack';
import {type IEditorAction} from "../EditorAction/EditorAction";
import Controllers from "../Controllers/Controllers";

/**
 * Can be run independently of the editor
 * @export
 * @class EditorEngine
 * @extends {EditorEngine}
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

    this._controllers = params.controllers || Controllers;
    this._state = EngineState.LOADING as State;
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

    this._renderCtx?.clearRect(0, 0, this.renderWidth, this.renderHeight)

    // if (isTick)  {
    //  this._renderCtx?.clearRect(0, 0, this.renderWidth, this.renderHeight)
    // }

    this._next = 0;

    this._currentTime = time;
    if (this.playbackMode === 'media' && this.media && this.media.currentTime) {
      // this.media.currentTime = time / 1000;
    }
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

