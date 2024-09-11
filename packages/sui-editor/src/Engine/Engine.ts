import { IController, IEngine, ITimelineTrack, ITimelineAction } from '@stoked-ui/timeline';
import {Events, type EventTypes} from './events';
import {Emitter} from "./emitter";

const PLAYING = 'playing';
const PAUSED = 'paused';
type PlayState = 'playing' | 'paused';

export type EngineOptions = {
  viewer?: HTMLElement;
  id: string;
}

/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class Engine
 * @extends {Emitter<EventTypes>}
 */
export class Engine extends Emitter<EventTypes> implements IEngine {

  private _viewer: HTMLElement | null = null;

  private _renderer: HTMLCanvasElement | null = null;

  private _renderCtx: CanvasRenderingContext2D | null = null

  constructor(params: EngineOptions ) {
    super(new Events());
    this._editorId = params.id;
    if (params?.viewer) {
      this.viewer = params.viewer;
    }
  }

  set viewer(viewer: HTMLElement) {
    this._viewer = viewer;
    const renderer = viewer.querySelector(`#${this._editorId} div[role='renderer']`) as HTMLCanvasElement;
    if (renderer) {
      this._renderer = renderer;
      const ctx = renderer.getContext('2d');
      if (ctx) {
        this._renderCtx = ctx;
      }
    }

    this._viewerUpdate();
    if (this.renderer && this.viewer && this.renderCtx) {
      this._loading = false;
    } else {
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

  get renderer(): HTMLCanvasElement | null {
    return this._renderer;
  }

  set renderer(canvas: HTMLCanvasElement) {
    this._renderer = canvas;
    if (canvas) {
      console.log('setcontext ')
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get 2d context from renderer');
      }
      this._renderCtx = ctx;
    }
  }

  get renderCtx() {
    return this._renderCtx;
  }

  get renderWidth() {
    return this._renderCtx?.canvas.width ?? 1920
  }

  get renderHeight() {
    return this._renderCtx?.canvas.height ?? 1080
  }

  private _editorId: string;

  private _loading = true;

  /** requestAnimationFrame timerId */
  private _timerId: number = 0;

  /** Playback rate */
  private _playRate = 1;

  /** current time */
  private _currentTime: number = 0;

  /** Playback status */
  private _playState: PlayState = 'paused';

  /** Time frame pre data */
  private _prev: number = -1;

  /** Action actionType map */
  private _controllers: Record<string, IController> = {};

  /** Action map that needs to be run */
  private _actionMap: Record<string, ITimelineAction> = {};

  private _actionTrackMap: Record<string, ITimelineTrack> = {};

  /** Action ID array sorted in positive order by action start time */
  private _actionSortIds: string[] = [];

  /** The currently traversed action index */
  private _next: number = 0;

  /** The action time range contains the actionId list of the current time */
  private _activeActionIds: string[] = [];

  getAction(actionId: string) {
    return {
      action: this._actionMap[actionId],
      track: this._actionTrackMap[actionId]
    };
  }

  getActionTrack(actionId: string) {
    return this._actionTrackMap[actionId];
  }

  getSelectedActions() {
    const actionTracks: {action: ITimelineAction, track: ITimelineTrack}[] = [];
    for (let i = 0; i < this._activeActionIds.length; i += 1) {
      const actionId = this._activeActionIds[i];
      const action = this._actionMap[actionId];
      if (action.selected) {
        actionTracks.push({ action, track: this._actionTrackMap[actionId] });
      }
    }
    return actionTracks;
  }


  get loading() {
    return this._loading;
  }

  /** Whether it is playing */
  get isPlaying() {
    return this._playState === 'playing';
  }

  /** Whether it is paused */
  get isPaused() {
    return this._playState === 'paused';
  }

  set controllers(controllers: Record<string, IController>) {
    this._controllers = controllers;
  }

  set tracks(tracks: ITimelineTrack[]) {
    if (this.isPlaying) {
      this.pause();
    }
    this._dealData(tracks);
    this._dealClear();
    this._dealEnter(this._currentTime);
  }

  /**
   * Set playback rate
   * @memberof Engine
   */
  setPlayRate(rate: number): boolean {
    if (rate <= 0) {
      console.error('Error: rate cannot be less than 0!');
      return false;
    }
    const result = this.trigger('beforeSetPlayRate', { rate, engine: this });
    if (!result) {
      return false;
    }
    this._playRate = rate;
    this.trigger('afterSetPlayRate', { rate, engine: this });

    return true;
  }

  /**
   * Get playback rate
   * @memberof Engine
   */
  getPlayRate() {
    return this._playRate;
  }

  /**
   * Re-render the current time
   * @return {*}
   * @memberof Engine
   */
  reRender() {
    if (this.isPlaying) {
      return;
    }
    this._tickAction(this._currentTime);
  }

  /**
   * Set playback time
   * @param {number} time
   * @param {boolean} [isTick] Whether it is triggered by a tick
   * @memberof Engine
   */
  setTime(time: number, isTick?: boolean): boolean {
    const result = isTick || this.trigger('beforeSetTime', { time, engine: this });
    if (!result) {
      return false;
    }

    this._currentTime = time;

    this._next = 0;
    this._dealLeave(time);
    this._dealEnter(time);

    if (isTick) {
      this.trigger('setTimeByTick', { time, engine: this });
    }
    else {
      this.trigger('afterSetTime', { time, engine: this });
    }
    return true;
  }

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
  play(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean {
    const { toTime, autoEnd } = param;

    const currentTime = this.getTime();
    /** The current state is being played or the running end time is less than the start time, return directly */
    if (this.isPlaying || (toTime && toTime <= currentTime)) {
      return false;
    }

    // Set running status
    this._playState = PLAYING;

    // activeIds run start
    this._startOrStop('start');

    // trigger event
    this.trigger('play', { engine: this });

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({ now: time, autoEnd, to: toTime });
    });

    return true;
  }

  /**
   * Pause playback
   * @memberof Engine
   */
  pause() {
    if (this.isPlaying) {
      this._playState = PAUSED;
      // activeIds run stop
      this._startOrStop('stop');

      this.trigger('paused', { engine: this });
    }
    cancelAnimationFrame(this._timerId);
  }

  /** Playback completed */
  private _end() {
    this.pause();
    this.trigger('ended', { engine: this });
  }

  private _assignElements() {
    const getEditorRole = (role: string) => {
      return document.querySelector(`#${this._editorId} [role=${role}]`)
    }
    const renderer = getEditorRole('renderer');
    if (renderer) {
      this.renderer = renderer as HTMLCanvasElement;
    }
  }

  private _viewerUpdate() {
    this._assignElements()
    const controllers: IController[] = Object.values(this._controllers);
    for (let i = 0; i < controllers.length; i += 1){
      const actionType = controllers[i];
      if (actionType?.viewerUpdate) {
        actionType.viewerUpdate(this);
      }
    }
  }

  private _verifyLoaded() {
    if (this.loading) {
      const notReadyYet = new Error('start or stop before finished loading')
      console.error(notReadyYet);
      return false
    }
    return true;
  }

  private _startOrStop(type?: 'start' | 'stop') {
    if (!this._verifyLoaded()) {
      return;
    }
    for (let i = 0; i < this._activeActionIds.length; i += 1) {
      const actionId = this._activeActionIds[i];
      const action = this._actionMap[actionId];
      const controller = this._controllers[action?.effectId];

      if (type === 'start' && controller?.start) {
        controller.start({action, time: this.getTime(), engine: this});
      } else if (type === 'stop' && controller?.stop) {
        controller.stop({action, time: this.getTime(), engine: this});
      }
    }
  }

  /** Execute every frame */
  private _tick(data: { now: number; autoEnd?: boolean; to?: number }) {
    if (!this._verifyLoaded()) {
      return;
    }

    if (this.isPaused) {
      return;
    }
    const { now, autoEnd, to } = data;

    // Calculate the current time
    let currentTime = this.getTime() + (Math.min(1000, now - this._prev) / 1000) * this._playRate;
    this._prev = now;

    // Set the current time
    if (to && to <= currentTime) {
      currentTime = to;
    }
    this.setTime(currentTime, true);

    // Execute action
    this._tickAction(currentTime);
    // In the case of automatic stop, determine whether all actions have been executed.
    if (!to && autoEnd && this._next >= this._actionSortIds.length && this._activeActionIds.length === 0) {
      this._end();
      return;
    }

    // Determine whether to terminate
    if (to && to <= currentTime) {
      this._end();
    }

    if (this.isPaused) {
      return;
    }
    this._timerId = requestAnimationFrame((time) => {
      this._tick({ now: time, autoEnd, to });
    });
  }

  /** tick runs actions */
  private _tickAction(time: number) {
    if (!this._verifyLoaded()) {
      return;
    }
    this._dealEnter(time);
    this._dealLeave(time);

    // render
    const length = this._activeActionIds.length;
    for (let i = 0; i < length; i +=1) {
      const actionId = this._activeActionIds[i];
      const action = this._actionMap[actionId];
      const controller = this._controllers[action.effectId];
      if (controller && controller?.update) {
        controller.update({action, time: this.getTime(), engine: this});
      }
    }
  }

  /** Reset active data */
  private _dealClear() {
    while (this._activeActionIds.length) {
      const actionId = this._activeActionIds.shift();
      if (!actionId) {
        continue;
      }
      const action = this._actionMap[actionId];

      const controller = this._controllers[action?.effectId];
      if (controller?.leave) {
        controller.leave({action, time: this.getTime(), engine: this});
      }
    }
    this._next = 0;
  }

  /** Process action time enter */
  private _dealEnter(time: number) {

    // add to active
    while (this._actionSortIds[this._next]) {
      const actionId = this._actionSortIds[this._next];
      const action = this._actionMap[actionId];

      if (!action.disable) {
        // Determine whether the action start time has arrived

        if (action.start > time) {
          break;
        }
        // The action can be executed and started
        if (action.end > time && !this._activeActionIds.includes(actionId)) {
          const controller = this._controllers[action.effectId];
          if (controller && controller?.enter && action?.data) {
            controller.enter({action, time: this.getTime(), engine: this});
          }

          this._activeActionIds.push(actionId);
        }
      }
      this._next += 1;
    }
  }

  /** Handle action time leave */
  private _dealLeave(time: number) {
    let i = 0;
    while (this._activeActionIds[i]) {
      const actionId = this._activeActionIds[i];
      const action = this._actionMap[actionId];

      // Not within the playback area
      if (action.start > time || action.end < time) {
        const controller = this._controllers[action.effectId];

        if (controller && controller?.leave) {
          controller.leave({action, time: this.getTime(), engine: this});
        }

        this._activeActionIds.splice(i, 1);
        continue;
      }
      i += 1;
    }
  }

  /** Data processing */
  private _dealData(tracks: ITimelineTrack[]) {
    const actions: ITimelineAction[] = [];
    tracks?.forEach((track) => {
      actions.push(...track.actions);
      track.actions.forEach((action) => {
        this._actionTrackMap[action.id] = track;
      })
    });
    const sortActions = actions.sort((a, b) => a.start - b.start);
    const actionMap: Record<string, ITimelineAction> = {};
    const actionSortIds: string[] = [];

    sortActions.forEach((action) => {
      actionSortIds.push(action.id);
      actionMap[action.id] = { ...action };
    });
    this._actionMap = actionMap;
    this._actionSortIds = actionSortIds;
  }
}
