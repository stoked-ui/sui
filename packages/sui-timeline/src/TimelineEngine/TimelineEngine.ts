import {
  ITimelineAction,
  ITimelineActionType
} from '../TimelineAction/TimelineAction.types';
import { ITimelineTrack } from '../TimelineTrack';
import { Emitter } from './emitter';
import { Events, EventTypes } from './events';

const PLAYING = 'playing';
const PAUSED = 'paused';
type PlayState = 'playing' | 'paused';

export interface ITimelineEngine extends Emitter<EventTypes> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  actionTypes: Record<string, ITimelineActionType>;
  tracks: ITimelineTrack[];
  viewer: HTMLElement;
  canvas: HTMLCanvasElement;


  /** Set playback rate */
  setPlayRate(rate: number): boolean;
  /** Get playback rate */
  getPlayRate(): number;
  /** Re-render the current time */
  reRender(): void;
  /** Set playback time */
  setTime(time: number, isTick?: boolean): boolean;
  /** Get playback time */
  getTime(): number;
  /** Play */
  play(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean;
  /** pause */
  pause(): void;

  getAction(actionId: string): { action: ITimelineAction, track: ITimelineTrack };
  getActionTrack(actionId: string):  ITimelineTrack;
  getSelectedActions(): { action: ITimelineAction, track: ITimelineTrack }[];
}

type EngineOptions = {
  canvas?: HTMLCanvasElement
}

/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class TimelineEngine
 * @extends {Emitter<EventTypes>}
 */
export default class TimelineEngine extends Emitter<EventTypes> implements ITimelineEngine {
  constructor(params?: EngineOptions ) {
    super(new Events());
    this._canvas = params?.canvas;
  }

  private _canvas?: HTMLCanvasElement;

  set canvas(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  get canvas() {
    return this._canvas;
  }

  private _loading = true;

  private _viewer: HTMLElement;

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

  set viewer(viewer: HTMLElement) {
    this._viewer = viewer;
    this._viewerUpdate()
    this._loading = false;
  }

  get viewer() {
    return this._viewer;
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

  private _viewerUpdate() {
    const actionTypes: ITimelineActionType[] = Object.values(this._actionTypes);
    for (const actionType of actionTypes) {
      if (actionType?.viewerUpdate) {
        actionType.viewerUpdate(this);
      }
    }
  }

  private _verifyLoaded() {
    if (this.loading) {
      const notReadyYet = new Error('start or stop before finished loading')
      console.log(notReadyYet, notReadyYet.stack);
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
