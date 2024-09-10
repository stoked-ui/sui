import {EngineOptions, ITimelineEngine} from './TimelineEngine.types';
import {ITimelineAction, ITimelineActionType} from '../TimelineAction/TimelineAction.types';
import { ITimelineTrack } from '../TimelineTrack/TimelineTrack.types';
import {Events, type EventTypes} from './events';
import {Emitter} from "./emitter";

const PLAYING = 'playing';
const PAUSED = 'paused';
type PlayState = 'playing' | 'paused';


/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class TimelineEngine
 * @extends {Emitter<EventTypes>}
 */
export class TimelineEngine extends Emitter<EventTypes> implements ITimelineEngine {

  private _viewer: HTMLElement;

  private _renderer?: HTMLCanvasElement;

  private _renderCtx?: CanvasRenderingContext2D;

  private _preview: HTMLElement;

  constructor(params?: EngineOptions ) {
    super(new Events());
    this._renderer = params?.renderer;
  }

  set viewer(viewer: HTMLElement) {
    this._viewer = viewer;
    this._viewerUpdate();
    if (this.renderer && this.viewer && this.preview && this.renderCtx) {
      this._loading = false;
    } else {

      throw new Error('Assigned a viewer but could not locate the renderer, renderCtx, or' +
                      ' preview elements.\n' +
                      'Please ensure that the viewer has the following children:\n' +
                      `  - renderer (canvas with working 2d context): ${this.renderer}` +
                      `  - preview: ${this.preview}`);

    }
  }

  get viewer() {
    return this._viewer;
  }

  get renderer() {
    return this._renderer;
  }

  set renderer(canvas: HTMLCanvasElement) {
    this._renderer = canvas;
    if (canvas) {
      this._renderCtx = canvas.getContext('2d');
    }
  }

  get renderCtx() {
    return this._renderCtx;
  }

  get preview() {
    return this._preview;
  }

  private _loading = true;

  /** requestAnimationFrame timerId */
  private _timerId: number;

  /** Playback rate */
  private _playRate = 1;

  /** current time */
  private _currentTime: number = 0;

  /** Playback status */
  private _playState: PlayState = 'paused';

  /** Time frame pre data */
  private _prev: number;

  /** Action actionType map */
  private _actionTypes: Record<string, ITimelineActionType> = {};

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

  set actionTypes(actionTypes: Record<string, ITimelineActionType>) {
    this._actionTypes = actionTypes;
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
   * @memberof TimelineEngine
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
   * @memberof TimelineEngine
   */
  getPlayRate() {
    return this._playRate;
  }

  /**
   * Re-render the current time
   * @return {*}
   * @memberof TimelineEngine
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
   * @memberof TimelineEngine
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
   * @memberof TimelineEngine
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
   * @memberof TimelineEngine
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
      return document.querySelector(`#${this.viewer.parentElement.id} [role=${role}]`)
    }
    const renderer = getEditorRole('renderer');
    if (renderer) {
      this.renderer = renderer as HTMLCanvasElement;
    }
    const preview =  getEditorRole('preview');
    if (preview) {
      this._preview = preview as HTMLElement;
    }
  }

  private _viewerUpdate() {
    this._assignElements()
    const actionTypes: ITimelineActionType[] = Object.values(this._actionTypes);
    for (let i = 0; i < actionTypes.length; i += 1){
      const actionType = actionTypes[i];
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
      const actionType = this._actionTypes[action?.effectId];

      if (type === 'start' && actionType?.start) {
        actionType.start({action, time: this.getTime(), engine: this});
      } else if (type === 'stop' && actionType?.stop) {
        actionType.stop({action, time: this.getTime(), engine: this});
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
      const actionType = this._actionTypes[action.effectId];
      if (actionType && actionType?.update) {
        actionType.update({action, time: this.getTime(), engine: this});
      }
    }
  }

  /** Reset active data */
  private _dealClear() {
    while (this._activeActionIds.length) {
      const actionId = this._activeActionIds.shift();
      const action = this._actionMap[actionId];

      const actionType = this._actionTypes[action?.effectId];
      if (actionType?.leave) {
        actionType.leave({action, time: this.getTime(), engine: this});
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
          const actionType = this._actionTypes[action.effectId];
          if (actionType && actionType?.enter && action?.data) {
            actionType.enter({action, time: this.getTime(), engine: this});
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
        const actionType = this._actionTypes[action.effectId];

        if (actionType && actionType?.leave) {
          actionType.leave({action, time: this.getTime(), engine: this});
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
