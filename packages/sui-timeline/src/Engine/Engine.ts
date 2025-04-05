import BTree from "sorted-btree";
import { type ITimelineAction } from '../TimelineAction/TimelineAction.types'
import { type IController } from '../Controller/Controller.types';
import {
  type IEngine, EngineState, type EngineOptions, PlaybackMode,
} from './Engine.types';
import { type ITimelineTrack } from '../TimelineTrack/TimelineTrack.types';
import { Events, type EventTypes } from './events'
import { Emitter } from './emitter';

/**
 * Timeline player
 * Can be run independently of the editor
 * @export
 * @class Engine
 * @extends {Emitter<EventTypes>}
 */
export default class Engine<
  State extends string = EngineState,
  EmitterEvents extends EventTypes = EventTypes,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack
  > extends Emitter<EmitterEvents> implements IEngine<EmitterEvents> {

  protected _logging: boolean = false;

  maxDuration: number = 15;

  /** requestAnimationFrame timerId */
  protected _timerId: number = 0;

  /** Playback rate */
  protected _playRate = 1;

  /** current time */
  _currentTime: number = 0;

  /** Playback status */
  _state: State;

  /** Time frame pre data */
  protected _prev: number = 0;

  playbackMode: PlaybackMode = PlaybackMode.CANVAS;

  playbackTimespans: { timespan: { start: number, end: number }, fileTimespan: { start: number, end: number }}[];

  playbackCurrentTimespans: { timespan: { start: number, end: number }, fileTimespan: { start: number, end: number }}[]

  media: HTMLMediaElement | null;

  /** Action actionType map */
  protected _controllers: Record<string, IController>;

  /** Action map that needs to be run */
  protected _actionMap: Record<string, ActionType> = {};

  protected _actionTrackMap: Record<string, TrackType> = {};

  /** Action ID array sorted in positive order by action start time */
  protected _actionSortIds: string[] = [];

  /** The currently traversed action index */
  protected _next: number = 0;

  /** The action time range contains the actionId list of the current time */
  protected _activeIds: BTree = new BTree<string, number>();

  resetCursor?: () => void;

  /**
   * Constructor for Engine class
   * @param {EngineOptions} params - Engine options
   */
  constructor(params: EngineOptions) {
    super(params.events ?? new Events())

    if (params?.controllers) {
      this._controllers = params.controllers;
    }
    this._state = EngineState.LOADING as State;
    if (!params?.controllers) {
      throw new Error('Error: No controllers set!');
    }
  }

  /**
   * Check if the given mode matches the current playback mode
   * @param {PlaybackMode | PlaybackMode[]} mode - Playback mode or array of modes to check against
   * @returns {boolean} Whether the mode matches the current playback mode
   */
  isPlayMode(mode: PlaybackMode | PlaybackMode[]) {
    if (Array.isArray(mode)) {
      return mode.includes(this.playbackMode);
    }
    return this.playbackMode === mode;
  }

  /**
   * Get the current state of the engine
   * @returns {State} The current state of the engine
   */
  get state() {
    return this._state as State;
  }

  /**
   * Set the state of the engine
   * @param {string} newState - New state to set
   */
  set state(newState: string) {
    this._state = newState as State;
  }

  /**
   * Get the logging status of the engine
   * @returns {boolean} The logging status
   */
  get logging() {
    return this._logging;
  }

  /**
   * Set the logging status of the engine
   * @param {boolean} enableLogging - Whether to enable logging
   */
  set logging(enableLogging: boolean) {
    this._logging = enableLogging;
    const controllers: IController[] = Object.values(this._controllers);

    for (let i = 0; i < controllers.length; i += 1){
      const controller = controllers[i];
      controller.logging = enableLogging;
    }
  }

  /**
   * Get the actions map of the engine
   * @returns {Record<string, ActionType>} The actions map
   */
  get actions() {
    return this._actionMap;
  }

  /**
   * Get the first action in the actions map
   * @returns {ActionType | undefined} The first action in the map
   */
  get action(): ActionType | undefined {
    const vals = Object.values(this._actionMap)
    if (vals.length) {
      return vals[0];
    }
    return undefined;
  }

  /**
   * Get the total duration based on playback mode
   * @returns {number} The total duration
   */
  get duration() {
    if (this.isPlayMode([PlaybackMode.TRACK_FILE, PlaybackMode.MEDIA]) && this.media) {
      return this.media.duration;
    }

    return this.canvasDuration;
  }

  /**
   * Get the duration based on canvas actions
   * @returns {number} The duration based on canvas actions
   */
  get canvasDuration() {
    const actions = Object.values(this._actionMap);
    let end = 0;
    for(let i = 0; i < actions.length; i += 1) {
      if (actions[i].end > end) {
        end = actions[i].end;
      }
    }
    return end;
  }

  /**
   * Get the action and track for a given action ID
   * @param {string} actionId - The ID of the action
   * @returns {Object} Object containing the action and track
   */
  getAction(actionId: string) {
    return {
      action: this._actionMap[actionId],
      track: this._actionTrackMap[actionId]
    };
  }

  /**
   * Get the track for a given action ID
   * @param {string} actionId - The ID of the action
   * @returns {TrackType} The track associated with the action
   */
  getActionTrack(actionId: string) {
    return this._actionTrackMap[actionId];
  }

  /**
   * Get selected actions and their tracks
   * @returns {Array} Array of objects containing selected actions and tracks
   */
  getSelectedActions() {
    const actionTracks: { action: ActionType, track: TrackType }[] = [];
    for (const [key, ] of this._activeIds.entries()) {
      const action = this._actionMap[key];
      if (action.selected) {
        actionTracks.push({ action, track: this._actionTrackMap[key] });
      }
    }
    return actionTracks;
  }

  /**
   * Check if the engine is ready
   * @returns {boolean} Whether the engine is in the ready state
   */
  get isReady() {
    return this._state === EngineState.READY;
  }

  /**
   * Check if the engine is loading
   * @returns {boolean} Whether the engine is in the loading state
   */
  get isLoading() {
    return this._state === EngineState.LOADING;
  }

  /**
   * Check if the engine is playing
   * @returns {boolean} Whether the engine is currently playing
   */
  get isPlaying() {
    return this._state === EngineState.PLAYING;
  }

  /**
   * Check if the engine is paused
   * @returns {boolean} Whether the engine is currently paused
   */
  get isPaused() {
    return this._state === EngineState.PAUSED;
  }

  /**
   * Get the controllers map of the engine
   * @returns {Record<string, IController>} The controllers map
   */
  get controllers() {
    return this._controllers;
  }

  /**
   * Set the controllers map of the engine
   * @param {Record<string, IController>} controllers - The controllers map to set
   */
  set controllers(controllers: Record<string, IController>) {
    this._controllers = controllers;
    this.logging = this._logging;
  }

  /**
   * Set the tracks for the engine
   * @param {Array} tracks - Array of tracks to set
   */
  setTracks(tracks: TrackType[]) {
    this._dealData(tracks);
    this._dealClear();
    this._dealEnter(this._currentTime);
    if (this.state === EngineState.LOADING) {
      this.state = EngineState.READY;
    }
  }

  /**
   * Set the playback rate
   * @param {number} rate - The playback rate to set
   * @returns {boolean} Whether the rate was successfully set
   */
  setPlayRate(rate: number): boolean {
    const result = this.trigger('beforeSetPlayRate' as keyof EmitterEvents, { rate, engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
    if (!result) {
      return false;
    }
    this._playRate = rate;
    this.trigger('afterSetPlayRate' as keyof EmitterEvents, { rate, engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);

    return true;
  }

  /**
   * Get the current playback rate
   * @returns {number} The current playback rate
   */
  getPlayRate() {
    return this._playRate;
  }

  /**
   * Re-render the current time
   */
  reRender(): void {
    if (this.isPlaying) {
      return;
    }
    this.tickAction(this._currentTime);
  }

  /**
   * Get the start time based on playback mode
   * @returns {number} The start time
   */
  getStartTime() {
    if (this.isPlayMode([PlaybackMode.TRACK_FILE, PlaybackMode.MEDIA]) && this.playbackTimespans.length) {
      return this.playbackTimespans[0].timespan.start;
    }

    return 0;
  }

  /**
   * Get the end time based on playback mode
   * @returns {number} The end time
   */
  getEndTime() {
    if (this.isPlayMode([PlaybackMode.TRACK_FILE, PlaybackMode.MEDIA]) && this.playbackTimespans.length) {
      return this.playbackTimespans[this.playbackTimespans.length - 1].timespan.end;
    }
    return this.canvasDuration;
  }

  /**
   * Set the start time
   */
  setStart() {
    if (this.isPlayMode([PlaybackMode.TRACK_FILE, PlaybackMode.MEDIA]) && this.media) {
      this.playbackCurrentTimespans = JSON.parse(JSON.stringify(this.playbackTimespans));
      this.media.currentTime = this.playbackCurrentTimespans[0].fileTimespan.start;
    }
    const start = this.getStartTime();
    this.setTime(start, true);
    this.reRender();
    this.reRender();
  }

  /**
   * Set the end time
   */
  setEnd() {
    const start = this.getStartTime();
    this.setTime(start, true);
    this.reRender();
  }

  /**
   * Set the playback time
   * @param {number} time - The time to set
   * @param {boolean} [isTick] - Flag indicating if triggered by a tick
   * @returns {boolean} Whether the time was successfully set
   */
  setTime(time: number, isTick?: boolean): boolean {
    const result = isTick || this.trigger('beforeSetTime' as keyof EmitterEvents, { time, engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
    if (!result) {
      return false;
    }

    this._next = 0;

    this._currentTime = time;

    if (this.playbackMode === PlaybackMode.CANVAS) {
      this._dealLeave(time);
      this._dealEnter(time);
    } else if (this.media) {
      console.info('setTime', time)
      this.media.currentTime = this._currentTime + this.playbackCurrentTimespans[0].fileTimespan.start;
    }

    if (isTick) {
      this.trigger('setTimeByTick' as keyof EmitterEvents, { time, engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
    }
    else {
      this.trigger('afterSetTime' as keyof EmitterEvents, { time, engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
    }
    return true;
  }

  /**
   * Get the current time
   * @returns {number} The current time
   */
  get time(): number {
    return this._currentTime;
  }

  /**
   * Rewind the playback by a specified delta value
   * @param {number} delta - The delta value for rewinding
   */
  rewind(delta: number) {
    if (this._playRate > 0 || this._playRate <= -10) {
      this.setPlayRate(-1);
    } else if (this._playRate > -10) {
      this.setPlayRate(this._playRate - delta);
    }
    this.run({ autoEnd: true });
  }

  /**
   * Fast forward the playback by a specified delta value
   * @param {number} delta - The delta value for fast forwarding
   */
  fastForward(delta: number) {
    if (this._playRate < 0 || this._playRate === 1 || this._playRate >= 10) {
      this.setPlayRate(1.5);
    } else if (this._playRate < 10) {
      this.setPlayRate(this._playRate + delta);
    }
    this.run({ autoEnd: true });
  }

  /**
   * Run the engine from the current time
   * @param {Object} param - Parameters for running
   * @returns {boolean} Whether the engine started running
   */
  run(param: {
    toTime?: number;
    autoEnd?: boolean;
  }): boolean {
    const { toTime, autoEnd } = param;

    const currentTime = this.time;
    if (this.isPlaying || (toTime && toTime <= currentTime)) {
      console.info('run return false')
      return false;
    }

    this._state = EngineState.PLAYING as State;

    this._startOrStop('start');

    if (this._playRate > 1) {
      this.trigger('fastForward' as keyof EmitterEvents, { engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
    } else if (this._playRate < 0) {
      this.trigger('rewind' as keyof EmitterEvents, { engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
    } else {
      this.trigger('play' as keyof EmitterEvents, {engine: this as IEngine} as EmitterEvents[keyof EmitterEvents]);
    }

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({now: time, autoEnd, to: toTime});
    });

    return true;
  }

  /**
   * Play the engine from the current time
   * @param {Object} param - Parameters for playing
   * @returns {boolean} Whether the engine started playing
   */
  play(param: {
    toTime?: number;
    autoEnd?: boolean;
  }): boolean {
    this._playRate = 1;

    if (this.playbackMode === PlaybackMode.TRACK_FILE && this.media) {
      this.media.style.display = 'flex';
    }
    return this.run(param);
  }

  /**
   * Pause the playback
   */
  pause() {
    if (this.isPlaying) {
      const previousState = this._state;
      this._state = EngineState.PAUSED as State;

      this._startOrStop('stop');

      this.trigger('pause' as keyof EmitterEvents, { engine: this as IEngine, previousState } as EmitterEvents[keyof EmitterEvents]);
    }
    cancelAnimationFrame(this._timerId);
  }

  /**
   * Handle playback completion
   */
  protected _end() {
    this.pause();
    this.setStart();

    this.trigger('ended' as keyof EmitterEvents, { engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
  }

  protected _startOrStop(type?: 'start' | 'stop') {
    if (this.isLoading) {
      return;
    }
    if ([PlaybackMode.TRACK_FILE, PlaybackMode.MEDIA].includes(this.playbackMode) && this.media) {
      if (type === 'start') {
        this.media.play();
      } else if (type === 'stop') {
        this.media.pause();
      }
      return
    }
    this._activeIds.forEach((key, ) => {
      const action = this._actionMap[key];
      const track = this._actionTrackMap[action.id];
      if (type === 'start' && track?.controller?.start) {
        track.controller?.start({action, track, time: this.time, engine: this as IEngine });
      } else if (type === 'stop' && track?.controller?.stop) {
        track.controller?.stop({action, track, time: this.time, engine: this as IEngine });
      }
    });
  }

  /**
   * Log a message with optional context
   * @param {string} msg - The message to log
   * @param {string} [ctx] - The context of the message
   */
  // eslint-disable-next-line class-methods-use-this
  log(msg: string, ctx?: string) {
    if (!this._logging) {
      return;
    }
    let finalMsg = `${this.time.toFixed(3)} - ${msg}`;
    if (ctx) {
      finalMsg = `${finalMsg} [${ctx}]`
    }
    console.info(finalMsg)
  }

  /**
   * Execute actions on each frame
   * @param {Object} data - Data for the tick operation
   */
  protected _tick(data: { now: number; autoEnd?: boolean; to?: number }) {
    if (this.isLoading || this.isPaused) {
      return;
    }

    this.log('tick')
    const { now, autoEnd = true, to } = data;

    const initialTime = this.time;
    let currentTime = initialTime + (Math.min(1000, now - this._prev) / 1000) * this._playRate;
    const forwards = this