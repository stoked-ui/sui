import BTree from "sorted-btree";
import {type ITimelineAction } from '../TimelineAction/TimelineAction.types'
import {type IController} from '../Controller/Controller.types';
import {
  type IEngine,
  type EngineState,
  type EngineOptions,
} from './Engine.types';
import { type ITimelineTrack} from '../TimelineTrack/TimelineTrack.types';
import {Events, type EventTypes} from './events'
import {Emitter} from './emitter';
import { RowRndApi } from "../TimelineTrack/TimelineTrackDnd.types";
import TimelineFile from "../TimelineFile/TimelineFile";


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


  control: any = {};

  /** requestAnimationFrame timerId */
  protected _timerId: number = 0;

  /** Playback rate */
  protected _playRate = 1;

  /** current time */
  protected _currentTime: number = 0;

  /** Playback status */
  _state: State;

  /** Time frame pre data */
  protected _prev: number = 0;

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

  constructor(params: EngineOptions ) {
    super(params.events ?? new Events())

    if (params?.controllers) {
      this._controllers = params.controllers;
    }
    this._state = 'loading' as State;
    this._controllers = TimelineFile.globalControllers;
  }

  cursorData?: () => {
    dnd?: { current: RowRndApi };
    dragLeft: { current: number };
    scrollLeft: { current: number };
    setCursor: (param: {
      left?: number,
      time?: number
    }) => boolean;
  }

  cursorDragStart?: (time: number) => void;

  cursorDragEnd?: () => void;

  cursorDrag?: (left: number, scroll) => void;

  get state() {
    return this._state as string;
  }

  set state(newState: string) {
    this._state = newState as State;
  }

  get logging() {
    return this._logging;
  }

  set logging(enableLogging: boolean) {
    this._logging = enableLogging;
    const controllers: IController[] = Object.values(this._controllers);

    for (let i = 0; i < controllers.length; i += 1){
      const controller = controllers[i];
      controller.logging = enableLogging;
    }
  }

  /* get screener() {
    return this._screener;
  } */

  get actions() {
    return this._actionMap;
  }

  get action(): ActionType | undefined {
    const vals = Object.values(this._actionMap)
    if (vals.length) {
      return vals[0];
    }
    return undefined;
  }


  get duration() {
    const actions = Object.values(this._actionMap);
    let end = 0;
    for(let i = 0; i < actions.length; i += 1) {
      if (actions[i].end > end) {
        end = actions[i].end;
      }
    }
    return end;
  }

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
    const actionTracks: {action: ActionType, track: TrackType}[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, ] of this._activeIds.entries()) {
      const action = this._actionMap[key];
      if (action.selected) {
        actionTracks.push({ action, track: this._actionTrackMap[key] });
      }
    }
    return actionTracks;
  }

  get isReady() {
    return this._state === 'ready';
  }

  get isLoading() {
    return this._state === 'loading';
  }

  /** Whether it is playing */
  get isPlaying() {
    return this._state === 'playing' as State;
  }

  /** Whether it is paused */
  get isPaused() {
    return this._state === 'paused' as State;
  }

  get controllers() {
    return this._controllers;
  }

  set controllers(controllers: Record<string, IController>) {
    this._controllers = controllers;
    this.logging = this._logging;
  }

  setTracks(tracks: TrackType[]) {
    this._dealData(tracks);
    this._dealClear();
    this._dealEnter(this._currentTime);
  }

  /**
   * Set playback rate
   * @memberof Engine
   */
  setPlayRate(rate: number): boolean {
    if (rate <= -3.0 || rate >= 3.0) {
      console.error('Error: rate cannot be less than -3 or more than 3!');
      return false;
    }
    const result = this.trigger('beforeSetPlayRate' as keyof EmitterEvents, { rate, engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
    if (!result) {
      return false;
    }
    this._playRate = rate;
    this.trigger('afterSetPlayRate' as keyof EmitterEvents, { rate, engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);

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
    this.tickAction(this._currentTime);
  }

  /**
   * Set playback time
   * @param {number} time
   * @param {boolean} [isTick] Whether it is triggered by a tick
   * @memberof Engine
   */
  setTime(time: number, isTick?: boolean): boolean {
    const result = isTick || this.trigger('beforeSetTime' as  keyof EmitterEvents, { time, engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
    if (!result) {
      return false;
    }

    this._next = 0;

    this._currentTime = time;

    this._dealLeave(time);
    this._dealEnter(time);

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
   * @return {*} {number}
   * @memberof Engine
   */
  get time(): number {
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

    const currentTime = this.time;
    /** The current state is being played or the running end time is less than the start time, return directly */
    if (this.isPlaying || (toTime && toTime <= currentTime)) {
      return false;
    }

    // Set running status
    this._state = 'playing' as State;

    // activeIds run start
    this._startOrStop('start');

    // trigger event
    this.trigger('play' as keyof EmitterEvents, { engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({now: time, autoEnd, to: toTime});
    });

    return true;
  }

  /**
   * Pause playback
   * @memberof Engine
   */
  pause() {
    if (this.isPlaying) {
      const previousState = this._state;
      this._state = 'paused' as State;

      // activeIds run stop
      this._startOrStop('stop');

      this.trigger('paused' as keyof EmitterEvents, { engine: this as IEngine, previousState } as EmitterEvents[keyof EmitterEvents]);
    }
    cancelAnimationFrame(this._timerId);
  }

  /** Playback completed */
  protected _end() {
    this.pause();

    // reset the cursor
    this.setTime(0, true);
    this.tickAction(0);
    this.reRender();

    this.trigger('ended' as keyof EmitterEvents, { engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
  }

  protected _startOrStop(type?: 'start' | 'stop') {
    if (this.isLoading) {
      return;
    }

    // eslint-disable-next-line no-restricted-syntax
    this._activeIds.forEach((key, ) => {
      const action = this._actionMap[key];
      const track = this._actionTrackMap[action.id];
      if (type === 'start' && track?.controller?.start && !track.hidden) {
        track.controller.start({action, time: this.time, engine: this as IEngine });
      } else if (type === 'stop' && track?.controller?.stop && !track.hidden) {
        track.controller.stop({action, time: this.time, engine: this as IEngine });
      }
    });
  }

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

  /** Execute every frame */
  protected _tick(data: { now: number; autoEnd?: boolean; to?: number }) {
    if (this.isLoading || this.isPaused) {
      return;
    }

    this.log('tick')
    const { now, autoEnd = true, to } = data;

    const initialTime = this.time;
    // Calculate the current time
    let currentTime = initialTime + (Math.min(1000, now - this._prev) / 1000) * this._playRate;
    currentTime = Math.max(0, currentTime);
    this._prev = now;


    // Set the current time
    if (to && to <= currentTime) {
      currentTime = to;
    }

    this.setTime(currentTime, true);

    // Execute action
    this.tickAction(currentTime);
    // In the case of automatic stop, determine whether all actions have been executed.
    if (!to && autoEnd && this._next >= this._actionSortIds.length && this._activeIds.length === 0) {
      this._end();
      return;
    }
    if (initialTime > currentTime && currentTime === 0) {
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
      this.log('requestAnimationFrame')
      this._tick({ now: time, autoEnd, to });
    });
  }

  /** tick runs actions */
  tickAction(time: number) {
    if (this.isLoading) {
      return;
    }
    this.log('tickAction')

    this._dealEnter(time);
    this._dealLeave(time);

    // render

    // eslint-disable-next-line no-restricted-syntax
    this._activeIds.forEach((key, ) => {
      const action = this._actionMap[key];
      const track = this._actionTrackMap[action.id];
      if (track.controller && track.controller?.update) {
        track.controller.update({action, time: this.time, engine: this as IEngine });
      }
    });

    this.log('_tickAction', 'postUpdate')
    // console.log(renderPass.join(' => '));
  }

  setScrollLeft(left: number) {
    this.trigger('setScrollLeft' as keyof EmitterEvents, { left, engine: this as IEngine } as EmitterEvents[keyof EmitterEvents]);
  }


  /** Reset active data */
  protected _dealClear() {
    while (this._activeIds.length > 0) {
      const minKey = this._activeIds.minKey(); // Get the smallest entry in the BTree
      if (minKey !== undefined) {
        const action = Object.values(this._actionMap)[minKey];
        // console.log(`Deleting Key: ${minKey}, Value: ${action}`);
        this._activeIds.delete(minKey); // Delete the current smallest key

        if (action) {
          const track = this._actionTrackMap[action.id];
          const controller = track.controller;
          if (controller?.leave) {
            controller.leave({action, time: this.time, engine: this as IEngine});
          }
        }
      } else {
        this._activeIds.clear();
      }
    }
    this._next = 0;
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
            controller.enter({action, time: this.time, engine: this as IEngine});
          }

          this._activeIds.set(this._next, actionId);
        }
      }
      this._next += 1;
    }
  }

  /** Handle action time leave */
  protected _dealLeave(time: number) {
    this._activeIds.forEach(( key, value) => {

      const action = this._actionMap[key];

      if (action) {
        const track = this._actionTrackMap[action.id];

        // Not within the playback area or hidden
        if (action.start > time || action.end < time || track.hidden) {
          const controller = track.controller;

          if (controller && controller?.leave) {
            controller.leave({action, time: this.time, engine: this as IEngine});
          }

          this._activeIds.delete(value);
        }
      }
    });
  }

  /** Data processing */
  protected _dealData(tracks: TrackType[]) {
    const actions: ActionType[] = [];
    tracks?.forEach((track) => {
      if (track) {
        actions.push(...track.actions as ActionType[]);
        track.actions.forEach((action) => {
          this._actionTrackMap[action.id] = track;
        })
      }
    });
    const sortActions = actions.sort((a, b) => a.start - b.start);
    const actionMap: Record<string, ActionType> = {};
    const actionSortIds: string[] = [];

    sortActions.forEach((action) => {
      actionSortIds.push(action.id);
      actionMap[action.id] = { ...action };
    });
    this._actionMap = actionMap;
    this._actionSortIds = actionSortIds;
  }
}
